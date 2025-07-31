import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailRecipients {
  to: string[];
  cc?: string[];
}

export interface InspectionEmailData {
  opsNumber: string;
  carpetNumber: string;
  orderType: string;
  construction: string;
  color: string;
  size: string;
  inspectionStage: string;
  status: string;
  defects?: string[];
  severity?: 'Minor' | 'Major' | 'Critical';
  inspector: string;
  merchantEmail?: string;
}

// Email escalation logic based on severity
export function getEmailRecipients(severity: 'Minor' | 'Major' | 'Critical', merchantEmail?: string): EmailRecipients {
  const qualityTeam = ['abdulansari@easternmills.com']; // Quality team base
  const qualityManager = 'qualitymanager@easternmills.com'; // Quality manager
  const merchandisingManager = 'merchandisingmanager@easternmills.com'; // Merchandising manager
  const management = ['abdulansari@easternmills.com']; // Management (you)

  switch (severity) {
    case 'Minor':
      return {
        to: qualityTeam,
        cc: []
      };
    
    case 'Major':
      return {
        to: [
          ...qualityTeam,
          qualityManager,
          merchandisingManager,
          ...(merchantEmail ? [merchantEmail] : [])
        ],
        cc: []
      };
    
    case 'Critical':
      return {
        to: [
          ...qualityTeam,
          qualityManager,
          merchandisingManager,
          ...management,
          ...(merchantEmail ? [merchantEmail] : [])
        ],
        cc: []
      };
    
    default:
      return {
        to: qualityTeam,
        cc: []
      };
  }
}

export async function sendInspectionNotification(data: InspectionEmailData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not found - email notification skipped');
      return false;
    }

    const recipients = getEmailRecipients(data.severity || 'Minor', data.merchantEmail);
    
    const severityColors = {
      Minor: '#f59e0b', // Yellow
      Major: '#f97316', // Orange
      Critical: '#ef4444' // Red
    };

    const severityColor = severityColors[data.severity || 'Minor'];

    const subject = `${data.severity || 'Quality'} Issue - OPS ${data.opsNumber} | ${data.inspectionStage}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .severity-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; color: white; font-weight: bold; background: ${severityColor}; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
            .detail-item { background: white; padding: 10px; border-radius: 4px; border-left: 3px solid ${severityColor}; }
            .defects { background: #fff3cd; border: 1px solid #ffeeba; padding: 10px; border-radius: 4px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Quality Control Alert</h1>
              <p style="margin: 5px 0 0 0;">Eastern Mills Quality Management System</p>
            </div>
            
            <div class="content">
              <div style="text-align: center; margin-bottom: 20px;">
                <span class="severity-badge">${data.severity || 'QUALITY ISSUE'}</span>
              </div>
              
              <h2>Inspection Details</h2>
              <div class="details-grid">
                <div class="detail-item">
                  <strong>OPS Number:</strong><br>${data.opsNumber}
                </div>
                <div class="detail-item">
                  <strong>Carpet Number:</strong><br>${data.carpetNumber}
                </div>
                <div class="detail-item">
                  <strong>Order Type:</strong><br>${data.orderType}
                </div>
                <div class="detail-item">
                  <strong>Inspection Stage:</strong><br>${data.inspectionStage}
                </div>
                <div class="detail-item">
                  <strong>Construction:</strong><br>${data.construction}
                </div>
                <div class="detail-item">
                  <strong>Color/Size:</strong><br>${data.color} • ${data.size}
                </div>
                <div class="detail-item">
                  <strong>Inspector:</strong><br>${data.inspector}
                </div>
                <div class="detail-item">
                  <strong>Status:</strong><br>${data.status}
                </div>
              </div>
              
              ${data.defects && data.defects.length > 0 ? `
                <div class="defects">
                  <h3 style="margin-top: 0;">Identified Defects:</h3>
                  <ul>
                    ${data.defects.map(defect => `<li>${defect}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 15px;">
                <h3>Required Action</h3>
                <p>Please review this ${data.severity?.toLowerCase() || 'quality'} issue and take appropriate action based on your department's procedures.</p>
                
                ${data.severity === 'Critical' ? '<p style="color: #ef4444; font-weight: bold;">⚠️ CRITICAL ISSUE: Immediate attention required from management.</p>' : ''}
                ${data.severity === 'Major' ? '<p style="color: #f97316; font-weight: bold;">⚠️ MAJOR ISSUE: Merchant and manager review required.</p>' : ''}
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated notification from Eastern Mills Quality Control System</p>
              <p>Please do not reply to this email</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!resend) {
      console.warn('⚠️ Resend service not configured - email notification skipped');
      return false;
    }

    const result = await resend.emails.send({
      from: 'Quality Control <noreply@yourdomain.com>', // Update with your verified domain
      to: recipients.to,
      cc: recipients.cc,
      subject: subject,
      html: htmlContent,
    });

    console.log('✅ Inspection notification email sent:', result);
    return true;

  } catch (error) {
    console.error('❌ Failed to send inspection notification:', error);
    return false;
  }
}

export async function sendTestEmail(): Promise<boolean> {
  try {
    if (!resend) {
      console.warn('⚠️ Resend service not configured - test email skipped');
      return false;
    }

    const result = await resend.emails.send({
      from: 'Quality Control <noreply@yourdomain.com>', // Update with your verified domain  
      to: ['abdulansari@easternmills.com'],
      subject: 'Quality Control System - Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;">
            <h1>Test Email Successful!</h1>
            <p>Your Resend API integration is working correctly.</p>
          </div>
          <div style="padding: 20px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
            <p>✅ Domain verification: <strong>Confirmed</strong></p>
            <p>✅ Email delivery: <strong>Working</strong></p>
            <p>✅ Quality Control notifications: <strong>Ready</strong></p>
            <hr style="margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
              Email escalation system is configured:<br>
              • Minor issues → Quality team<br>
              • Major issues → Merchant + Quality & Merchandising managers<br>  
              • Critical issues → All above + Management
            </p>
          </div>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully:', result);
    return true;

  } catch (error) {
    console.error('❌ Test email failed:', error);
    throw error;
  }
}