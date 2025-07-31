import express from 'express';
import { Resend } from 'resend';

const router = express.Router();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email service functions
const sendEmail = async (params: { to: string[], subject: string, html: string }) => {
  if (!resend) {
    console.log('Email service not configured - RESEND_API_KEY not found');
    console.log('Would send email:', { to: params.to, subject: params.subject });
    return { success: false, message: 'Email service not configured' };
  }
  
  try {
    await resend.emails.send({
      from: 'Eastern Mills Quality <quality@easternmills.com>',
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

interface EmailNotificationData {
  opsNumber: string;
  carpetNumber: string;
  contractor: string;
  process: string;
  orderType: string;
  inspectionStage: string;
  status: string;
  inspector: string;
  inspectionDate: string;
  severity: 'Minor' | 'Major' | 'Critical';
  defects: string[];
  emailType: 'inspection_created' | 'inspection_updated' | 'defect_alert';
  itemCount?: number;
}

// Get email recipients based on severity level
const getEmailRecipients = (severity: 'Minor' | 'Major' | 'Critical', orderType: string): string[] => {
  const baseEmails = {
    quality: ['abdulansari@easternmills.com'], // Quality team
    merchant: ['zahid@easternmills.com'], // Merchant
    qualityManager: ['faizanansari05100@gmail.com'], // Quality manager
    merchandisingManager: ['israr@easternmills.com'], // Merchandising manager
    management: ['danish@easternmills.com'] // Management
  };

  switch (severity) {
    case 'Minor':
      return baseEmails.quality;
    case 'Major':
      return [
        ...baseEmails.quality,
        ...baseEmails.merchant,
        ...baseEmails.qualityManager,
        ...baseEmails.merchandisingManager
      ];
    case 'Critical':
      return [
        ...baseEmails.quality,
        ...baseEmails.merchant,
        ...baseEmails.qualityManager,
        ...baseEmails.merchandisingManager,
        ...baseEmails.management
      ];
    default:
      return baseEmails.quality;
  }
};

// Inspection created notification
router.post('/notify-inspection-created', async (req, res) => {
  try {
    const data: EmailNotificationData = req.body;
    const recipients = getEmailRecipients(data.severity, data.orderType);
    
    const subject = `🔍 New Quality Inspection - ${data.opsNumber} (${data.severity} Priority)`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">🔍 New Quality Inspection Created</h2>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Priority Level: ${data.severity}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0;">Inspection Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">OPS Number:</td><td style="padding: 8px 0;">${data.opsNumber}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Carpet Number:</td><td style="padding: 8px 0;">${data.carpetNumber}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Order Type:</td><td style="padding: 8px 0;">${data.orderType}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Inspection Stage:</td><td style="padding: 8px 0;">${data.inspectionStage}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Contractor:</td><td style="padding: 8px 0;">${data.contractor}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Inspector:</td><td style="padding: 8px 0;">${data.inspector}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Inspection Date:</td><td style="padding: 8px 0;">${data.inspectionDate}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Status:</td><td style="padding: 8px 0;"><span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px;">${data.status}</span></td></tr>
              ${data.itemCount ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Item Count:</td><td style="padding: 8px 0;">${data.itemCount} items</td></tr>` : ''}
            </table>

            ${data.defects.length > 0 ? `
              <div style="margin-top: 20px; padding: 16px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 4px 4px 0;">
                <h4 style="color: #dc2626; margin: 0 0 12px 0;">⚠️ Defects Found:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
                  ${data.defects.map(defect => `<li style="margin: 4px 0;">${defect}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            <div style="margin-top: 24px; padding: 16px; background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 0 4px 4px 0;">
              <p style="margin: 0; color: #0c4a6e;"><strong>Next Steps:</strong> Please review this inspection and take appropriate action based on the ${data.severity.toLowerCase()} priority level.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>Eastern Mills Quality Control System</p>
            <p style="margin: 4px 0 0 0;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: recipients,
      subject,
      html: emailBody
    });

    console.log(`✅ Inspection created notification sent to: ${recipients.join(', ')}`);
    res.json({ message: 'Notification sent successfully', recipients });
  } catch (error) {
    console.error('❌ Error sending inspection created notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Inspection updated notification
router.post('/notify-inspection-updated', async (req, res) => {
  try {
    const data: EmailNotificationData = req.body;
    const recipients = getEmailRecipients(data.severity, data.orderType);
    
    const subject = `📝 Quality Inspection Updated - ${data.opsNumber} (${data.severity} Priority)`;
    const statusColor = data.status === 'Pass' ? '#10b981' : data.status === 'Fail' ? '#ef4444' : '#f59e0b';
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">📝 Quality Inspection Updated</h2>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Priority Level: ${data.severity}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0;">Updated Inspection Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">OPS Number:</td><td style="padding: 8px 0;">${data.opsNumber}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Carpet Number:</td><td style="padding: 8px 0;">${data.carpetNumber}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Inspection Stage:</td><td style="padding: 8px 0;">${data.inspectionStage}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Contractor:</td><td style="padding: 8px 0;">${data.contractor}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Inspector:</td><td style="padding: 8px 0;">${data.inspector}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Updated Status:</td><td style="padding: 8px 0;"><span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${data.status}</span></td></tr>
            </table>

            ${data.defects.length > 0 ? `
              <div style="margin-top: 20px; padding: 16px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 4px 4px 0;">
                <h4 style="color: #dc2626; margin: 0 0 12px 0;">⚠️ Current Defects:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
                  ${data.defects.map(defect => `<li style="margin: 4px 0;">${defect}</li>`).join('')}
                </ul>
              </div>
            ` : `
              <div style="margin-top: 20px; padding: 16px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 0 4px 4px 0;">
                <p style="margin: 0; color: #065f46;"><strong>✅ No defects reported</strong></p>
              </div>
            `}
            
            <div style="margin-top: 24px; padding: 16px; background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 0 4px 4px 0;">
              <p style="margin: 0; color: #0c4a6e;"><strong>Action Required:</strong> Review the updated status and take necessary follow-up actions for this ${data.severity.toLowerCase()} priority inspection.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>Eastern Mills Quality Control System</p>
            <p style="margin: 4px 0 0 0;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: recipients,
      subject,
      html: emailBody
    });

    console.log(`✅ Inspection updated notification sent to: ${recipients.join(', ')}`);
    res.json({ message: 'Notification sent successfully', recipients });
  } catch (error) {
    console.error('❌ Error sending inspection updated notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Critical defect alert
router.post('/notify-defect-alert', async (req, res) => {
  try {
    const data: EmailNotificationData = req.body;
    const recipients = getEmailRecipients('Critical', data.orderType); // Always use Critical for defect alerts
    
    const subject = `🚨 URGENT: Critical Quality Defect Alert - ${data.opsNumber}`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">🚨 CRITICAL QUALITY DEFECT ALERT</h2>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Immediate Action Required</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #dc2626; margin: 0 0 8px 0;">⚠️ URGENT ATTENTION REQUIRED</h3>
              <p style="margin: 0; color: #7f1d1d;">Critical quality issues have been identified that require immediate management attention and corrective action.</p>
            </div>
            
            <h3 style="color: #333; margin-top: 0;">Defect Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">OPS Number:</td><td style="padding: 8px 0;">${data.opsNumber}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Carpet Number:</td><td style="padding: 8px 0;">${data.carpetNumber}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Order Type:</td><td style="padding: 8px 0;">${data.orderType}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Inspection Stage:</td><td style="padding: 8px 0;">${data.inspectionStage}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Contractor:</td><td style="padding: 8px 0;">${data.contractor}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Inspector:</td><td style="padding: 8px 0;">${data.inspector}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Status:</td><td style="padding: 8px 0;"><span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">FAILED</span></td></tr>
            </table>

            <div style="margin-top: 20px; padding: 16px; background: #7f1d1d; color: white; border-radius: 8px;">
              <h4 style="color: white; margin: 0 0 12px 0;">🚨 Critical Defects Identified:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                ${data.defects.map(defect => `<li style="margin: 6px 0; font-weight: 500;">${defect}</li>`).join('')}
              </ul>
            </div>
            
            <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 4px 4px 0;">
              <h4 style="color: #92400e; margin: 0 0 8px 0;">⏰ Immediate Actions Required:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                <li>Stop production on this order immediately</li>
                <li>Investigate root cause of defects</li>
                <li>Coordinate with contractor for corrective measures</li>
                <li>Report to management within 1 hour</li>
                <li>Document all findings and action plans</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>Eastern Mills Quality Control System - CRITICAL ALERT</p>
            <p style="margin: 4px 0 0 0;">This is an automated critical alert. Immediate response required.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: recipients,
      subject,
      html: emailBody
    });

    console.log(`🚨 CRITICAL defect alert sent to: ${recipients.join(', ')}`);
    res.json({ message: 'Critical alert sent successfully', recipients });
  } catch (error) {
    console.error('❌ Error sending critical defect alert:', error);
    res.status(500).json({ error: 'Failed to send critical alert' });
  }
});

export default router;