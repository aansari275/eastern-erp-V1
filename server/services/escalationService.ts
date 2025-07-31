import { MailService } from '@sendgrid/mail';

const mailService = process.env.SENDGRID_API_KEY ? (() => {
  const service = new MailService();
  service.setApiKey(process.env.SENDGRID_API_KEY!);
  return service;
})() : null;

const sendEmail = async (emailData: any) => {
  if (!mailService) {
    console.log('SendGrid not configured - would send email:', emailData.subject);
    return false;
  }
  
  try {
    await mailService.send(emailData);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

interface LabInspection {
  id: string;
  supplierName: string;
  company: string;
  inspectionType: string;
  dateOfIncoming: string;
  lotNo: string;
  overallStatus: string;
  sampleResults?: Array<{
    results: { [key: string]: string };
  }>;
}

interface EscalationConfig {
  qualityManager: string;
  secondLevel: string;
}

const escalationConfig: { [company: string]: EscalationConfig } = {
  EHI: {
    qualityManager: 'quality.manager@easternmills.com',
    secondLevel: 'zakir@easternmills.com' // GM
  },
  EMPL: {
    qualityManager: 'quality.manager@easternmills.com',
    secondLevel: 'operations@easternmills.com' // Operations Manager
  }
};

export class EscalationService {
  
  /**
   * Level 1: Automatic escalation to Quality Manager when inspection fails
   */
  static async escalateToQualityManager(inspection: LabInspection): Promise<boolean> {
    const config = escalationConfig[inspection.company];
    if (!config) {
      console.error(`No escalation config found for company: ${inspection.company}`);
      return false;
    }

    const failedParameters = this.getFailedParameters(inspection);
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1>🚨 FAILED LAB INSPECTION - QUALITY MANAGER REVIEW REQUIRED</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Inspection Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Inspection ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.id}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.company}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Supplier:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.supplierName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Material Type:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.inspectionType}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Lot Number:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.lotNo}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.dateOfIncoming}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: #dc2626;"><strong>FAILED</strong></td></tr>
          </table>

          ${failedParameters.length > 0 ? `
            <h3>Failed Testing Parameters:</h3>
            <ul style="background: #fee; padding: 15px; border-left: 4px solid #dc2626;">
              ${failedParameters.map(param => `<li style="margin: 5px 0;">${param}</li>`).join('')}
            </ul>
          ` : ''}

          <div style="background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px;">
            <h3>Quality Manager Decision Required:</h3>
            <p>Please review this failed inspection and make your decision:</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/escalation/approve/${inspection.id}" 
                 style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
                ✅ APPROVE MATERIAL
              </a>
              
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/escalation/reject/${inspection.id}" 
                 style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
                ❌ REJECT MATERIAL
              </a>
            </div>
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              Click APPROVE to accept the material despite lab failure, or REJECT to escalate to ${inspection.company === 'EHI' ? 'GM (Zakir)' : 'Operations Manager'}.
            </p>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          Eastern Mills Quality Management System - Automatic Escalation
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: config.qualityManager,
        from: 'quality@easternmills.com',
        subject: `🚨 FAILED LAB INSPECTION - ${inspection.company} - ${inspection.supplierName} - QM Review Required`,
        html: emailHtml
      });

      console.log(`✅ Level 1 escalation sent to Quality Manager for inspection ${inspection.id}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send Level 1 escalation email:', error);
      return false;
    }
  }

  /**
   * Level 2: Automatic escalation to second level when Quality Manager rejects
   */
  static async escalateToSecondLevel(inspection: LabInspection): Promise<boolean> {
    const config = escalationConfig[inspection.company];
    if (!config) {
      console.error(`No escalation config found for company: ${inspection.company}`);
      return false;
    }

    const secondLevelTitle = inspection.company === 'EHI' ? 'General Manager (Zakir)' : 'Operations Manager';
    const failedParameters = this.getFailedParameters(inspection);
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1>🚨 LEVEL 2 ESCALATION - ${secondLevelTitle.toUpperCase()} DECISION REQUIRED</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <div style="background: #fee; border: 1px solid #dc2626; padding: 15px; margin-bottom: 20px; border-radius: 6px;">
            <h3 style="color: #dc2626; margin-top: 0;">⚠️ CRITICAL: Quality Manager has REJECTED this material</h3>
            <p>This failed lab inspection has been escalated to you for final decision as ${secondLevelTitle}.</p>
          </div>

          <h2>Inspection Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Inspection ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.id}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.company}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Supplier:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.supplierName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Material Type:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.inspectionType}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Lot Number:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.lotNo}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.dateOfIncoming}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Lab Status:</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: #dc2626;"><strong>FAILED</strong></td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>QM Decision:</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: #dc2626;"><strong>REJECTED</strong></td></tr>
          </table>

          ${failedParameters.length > 0 ? `
            <h3>Failed Testing Parameters:</h3>
            <ul style="background: #fee; padding: 15px; border-left: 4px solid #dc2626;">
              ${failedParameters.map(param => `<li style="margin: 5px 0;">${param}</li>`).join('')}
            </ul>
          ` : ''}

          <div style="background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px;">
            <h3>${secondLevelTitle} Final Decision Required:</h3>
            <p>As ${secondLevelTitle}, your decision is final for this material.</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/escalation/final-approve/${inspection.id}" 
                 style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
                ✅ FINAL APPROVAL
              </a>
              
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/escalation/final-reject/${inspection.id}" 
                 style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
                ❌ FINAL REJECTION
              </a>
            </div>
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              Final Approval will accept the material for production. Final Rejection will return material to supplier.
            </p>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          Eastern Mills Quality Management System - Level 2 Escalation
        </div>
      </div>
    `;

    try {
      // Send to second level decision maker
      await sendEmail({
        to: config.secondLevel,
        from: 'quality@easternmills.com',
        subject: `🚨 LEVEL 2 ESCALATION - ${inspection.company} - ${inspection.supplierName} - ${secondLevelTitle} Decision Required`,
        html: emailHtml
      });

      // CC Quality Manager on the escalation
      await sendEmail({
        to: config.qualityManager,
        from: 'quality@easternmills.com',
        subject: `📋 FYI: Level 2 Escalation Sent - ${inspection.company} - ${inspection.supplierName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #374151; color: white; padding: 20px; text-align: center;">
              <h1>📋 Escalation Notification</h1>
            </div>
            <div style="padding: 20px;">
              <p>This is to inform you that inspection <strong>${inspection.id}</strong> has been escalated to ${secondLevelTitle} for final decision.</p>
              <p><strong>Supplier:</strong> ${inspection.supplierName}</p>
              <p><strong>Company:</strong> ${inspection.company}</p>
              <p><strong>Status:</strong> Awaiting ${secondLevelTitle} decision</p>
            </div>
          </div>
        `
      });

      console.log(`✅ Level 2 escalation sent to ${secondLevelTitle} for inspection ${inspection.id}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send Level 2 escalation email:', error);
      return false;
    }
  }

  private static getFailedParameters(inspection: LabInspection): string[] {
    if (!inspection.sampleResults) return [];
    
    const failedParams: string[] = [];
    inspection.sampleResults.forEach((sample, index) => {
      Object.entries(sample.results || {}).forEach(([param, result]) => {
        if (result.toLowerCase().includes('fail') || result.toLowerCase().includes('not ok')) {
          failedParams.push(`Sample ${index + 1}: ${param} - ${result}`);
        }
      });
    });
    
    return failedParams;
  }
}