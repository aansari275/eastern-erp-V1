import { Router, Request, Response } from 'express';
import { adminDb } from '../firestoreHelpers';
import crypto from 'crypto';
import { Resend } from 'resend';

const router = Router();

// Generate secure token for approval actions
function generateSecureToken(inspectionId: string, action: 'approve' | 'fail'): string {
  const data = `${inspectionId}-${action}-${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

// Store tokens with expiration (24 hours)
const tokenStore = new Map<string, {
  inspectionId: string;
  action: 'approve' | 'fail';
  expires: number;
  approverEmail: string;
}>();

interface EscalationActionData {
  inspectionId: string;
  approverEmail: string;
  level: number;
  action: 'approve' | 'fail';
  timestamp: Date;
  reason?: string;
}

// Create approval tokens and send escalation email
export async function sendEscalationEmail(
  inspectionId: string,
  inspection: any,
  approverEmail: string,
  level: number,
  escalationReason: string
) {
  try {
    console.log(`🔄 Sending escalation email for inspection ${inspectionId} to ${approverEmail}`);
    
    // Generate secure tokens
    const approveToken = generateSecureToken(inspectionId, 'approve');
    const failToken = generateSecureToken(inspectionId, 'fail');
    
    // Store tokens (expire in 24 hours)
    const expires = Date.now() + (24 * 60 * 60 * 1000);
    tokenStore.set(approveToken, {
      inspectionId,
      action: 'approve',
      expires,
      approverEmail
    });
    tokenStore.set(failToken, {
      inspectionId,
      action: 'fail',
      expires,
      approverEmail
    });
    
    // Create action URLs
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'http://localhost:5000';
    
    const approveUrl = `${baseUrl}/api/escalations/approve?id=${inspectionId}&token=${approveToken}`;
    const failUrl = `${baseUrl}/api/escalations/fail?id=${inspectionId}&token=${failToken}`;
    
    // Create HTML email with action buttons
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lab Inspection Escalation - ${inspection.materialType || 'Material'} Testing</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #dc2626; margin-bottom: 10px;">🚨 Lab Inspection Escalation Required</h2>
          <p style="color: #666; font-size: 14px;">Level ${level} Escalation - Immediate Action Required</p>
        </div>
        
        <!-- Action Buttons -->
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <p style="margin-bottom: 20px; font-weight: bold; color: #333;">Take Action:</p>
          <a href="${approveUrl}" style="display: inline-block; padding: 12px 24px; background: #22c55e; color: white; border-radius: 6px; text-decoration: none; margin-right: 16px; font-weight: bold;">✅ Approve</a>
          <a href="${failUrl}" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">❌ Fail</a>
        </div>
        
        <!-- Inspection Details -->
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Inspection Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; width: 35%;">Inspection ID:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${inspectionId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold;">Material Type:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${inspection.materialType || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold;">Supplier:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${inspection.supplierName || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold;">Inspection Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${new Date(inspection.incomingDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold;">Status:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                <span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">FAILED</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Escalation Reason:</td>
              <td style="padding: 8px 0;">${escalationReason}</td>
            </tr>
          </table>
        </div>
        
        <!-- Testing Parameters Summary -->
        ${inspection.testingParameters && inspection.testingParameters.length > 0 ? `
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Failed Testing Parameters</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${inspection.testingParameters
              .filter((param: any) => param.result === 'Fail')
              .map((param: any) => `<li style="margin: 5px 0; color: #dc2626;">${param.parameter}: ${param.standard}</li>`)
              .join('')}
          </ul>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
          <p>This is an automated escalation from Eastern Mills Quality Management System</p>
          <p>Please take action within 24 hours. Links expire after 24 hours for security.</p>
          <p>Generated at: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    
    // Send email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = `🚨 Level ${level} Escalation: ${inspection.materialType || 'Material'} Inspection Failed - Action Required`;
    
    await resend.emails.send({
      from: 'quality@easternmills.com',
      to: approverEmail,
      subject,
      html: emailHtml
    });
    
    console.log(`✅ Escalation email sent successfully to ${approverEmail}`);
    
    // Log escalation action in Firestore
    await adminDb.collection('escalationLogs').add({
      inspectionId,
      approverEmail,
      level,
      escalationReason,
      sentAt: new Date(),
      tokens: { approveToken, failToken },
      status: 'pending'
    });
    
    return { success: true, approveToken, failToken };
    
  } catch (error) {
    console.error('❌ Error sending escalation email:', error);
    throw error;
  }
}

// Handle approve action
router.get('/approve', async (req: Request, res: Response) => {
  try {
    const { id: inspectionId, token } = req.query;
    
    if (!inspectionId || !token) {
      return res.status(400).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Invalid Request</h2>
          <p>Missing inspection ID or token.</p>
        </body></html>
      `);
    }
    
    // Validate token
    const tokenData = tokenStore.get(token as string);
    if (!tokenData) {
      return res.status(401).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Invalid or Expired Token</h2>
          <p>This approval link is invalid or has expired.</p>
          <p>Approval links expire after 24 hours for security.</p>
        </body></html>
      `);
    }
    
    if (tokenData.expires < Date.now()) {
      tokenStore.delete(token as string);
      return res.status(401).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Token Expired</h2>
          <p>This approval link has expired.</p>
          <p>Please contact the quality team for assistance.</p>
        </body></html>
      `);
    }
    
    if (tokenData.inspectionId !== inspectionId || tokenData.action !== 'approve') {
      return res.status(403).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Token Mismatch</h2>
          <p>This token is not valid for this action.</p>
        </body></html>
      `);
    }
    
    // Update inspection in Firestore
    const inspectionRef = adminDb.collection('labInspections').doc(inspectionId as string);
    const inspectionDoc = await inspectionRef.get();
    
    if (!inspectionDoc.exists) {
      return res.status(404).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Inspection Not Found</h2>
          <p>The inspection record could not be found.</p>
        </body></html>
      `);
    }
    
    // Update inspection status
    await inspectionRef.update({
      overallStatus: 'Pass',
      approvedBy: tokenData.approverEmail,
      approvedAt: new Date(),
      escalationResolved: true,
      lastUpdated: new Date()
    });
    
    // Log the approval action
    await adminDb.collection('escalationLogs').add({
      inspectionId,
      action: 'approve',
      approverEmail: tokenData.approverEmail,
      timestamp: new Date(),
      token: token as string
    });
    
    // Clean up tokens
    tokenStore.delete(token as string);
    // Also clean up the corresponding fail token
    for (const [key, value] of tokenStore.entries()) {
      if (value.inspectionId === inspectionId && value.action === 'fail') {
        tokenStore.delete(key);
        break;
      }
    }
    
    // Send confirmation email
    const resend = new Resend(process.env.RESEND_API_KEY);
    const inspection = inspectionDoc.data();
    
    await resend.emails.send({
      from: 'quality@easternmills.com',
      to: tokenData.approverEmail,
      subject: '✅ Inspection Approved - Confirmation',
      html: `
        <html><body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #22c55e;">✅ Inspection Approved Successfully</h2>
          <p>You have successfully approved the lab inspection:</p>
          <ul>
            <li><strong>Inspection ID:</strong> ${inspectionId}</li>
            <li><strong>Material Type:</strong> ${inspection?.materialType || 'Not specified'}</li>
            <li><strong>Supplier:</strong> ${inspection?.supplierName || 'Not specified'}</li>
            <li><strong>Approved at:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>The inspection status has been updated to <strong>PASS</strong> and production can proceed.</p>
        </body></html>
      `
    });
    
    res.send(`
      <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #22c55e;">✅ Inspection Approved</h1>
        <p style="font-size: 18px; margin: 20px 0;">You have successfully approved this inspection.</p>
        <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px auto; max-width: 400px;">
          <p><strong>Inspection ID:</strong> ${inspectionId}</p>
          <p><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">APPROVED</span></p>
          <p><strong>Approved by:</strong> ${tokenData.approverEmail}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #666; font-size: 14px;">The inspection status has been updated and production can proceed.</p>
        <p style="color: #666; font-size: 14px;">A confirmation email has been sent to you.</p>
      </body></html>
    `);
    
  } catch (error) {
    console.error('❌ Error processing approval:', error);
    res.status(500).send(`
      <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #dc2626;">❌ Error Processing Approval</h2>
        <p>An error occurred while processing your approval. Please contact the quality team.</p>
      </body></html>
    `);
  }
});

// Handle fail action
router.get('/fail', async (req: Request, res: Response) => {
  try {
    const { id: inspectionId, token } = req.query;
    
    if (!inspectionId || !token) {
      return res.status(400).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Invalid Request</h2>
          <p>Missing inspection ID or token.</p>
        </body></html>
      `);
    }
    
    // Validate token
    const tokenData = tokenStore.get(token as string);
    if (!tokenData) {
      return res.status(401).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Invalid or Expired Token</h2>
          <p>This rejection link is invalid or has expired.</p>
          <p>Rejection links expire after 24 hours for security.</p>
        </body></html>
      `);
    }
    
    if (tokenData.expires < Date.now()) {
      tokenStore.delete(token as string);
      return res.status(401).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Token Expired</h2>
          <p>This rejection link has expired.</p>
          <p>Please contact the quality team for assistance.</p>
        </body></html>
      `);
    }
    
    if (tokenData.inspectionId !== inspectionId || tokenData.action !== 'fail') {
      return res.status(403).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Token Mismatch</h2>
          <p>This token is not valid for this action.</p>
        </body></html>
      `);
    }
    
    // Get inspection details for next escalation
    const inspectionRef = adminDb.collection('labInspections').doc(inspectionId as string);
    const inspectionDoc = await inspectionRef.get();
    
    if (!inspectionDoc.exists) {
      return res.status(404).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Inspection Not Found</h2>
          <p>The inspection record could not be found.</p>
        </body></html>
      `);
    }
    
    const inspection = inspectionDoc.data();
    
    // Update inspection with rejection
    await inspectionRef.update({
      overallStatus: 'Fail',
      rejectedBy: tokenData.approverEmail,
      rejectedAt: new Date(),
      lastUpdated: new Date()
    });
    
    // Log the rejection action
    await adminDb.collection('escalationLogs').add({
      inspectionId,
      action: 'fail',
      approverEmail: tokenData.approverEmail,
      timestamp: new Date(),
      token: token as string
    });
    
    // Clean up tokens
    tokenStore.delete(token as string);
    // Also clean up the corresponding approve token
    for (const [key, value] of tokenStore.entries()) {
      if (value.inspectionId === inspectionId && value.action === 'approve') {
        tokenStore.delete(key);
        break;
      }
    }
    
    // Determine next escalation level
    const company = inspection?.company || 'EHI';
    let nextLevelEmail = '';
    let escalationMessage = '';
    
    if (company === 'EHI') {
      // EHI: Level 1 -> Quality Manager, Level 2 -> GM (Zakir)
      if (tokenData.approverEmail === 'quality.manager@easternmills.com') {
        // Quality Manager rejected, escalate to GM
        nextLevelEmail = 'zakir@easternmills.com';
        escalationMessage = 'Quality Manager has rejected the inspection. Escalating to General Manager.';
      } else {
        // GM rejected, final rejection
        escalationMessage = 'General Manager has rejected the inspection. This is a final rejection.';
      }
    } else {
      // EMPL: Level 1 -> Quality Manager, Level 2 -> Operations Manager
      if (tokenData.approverEmail === 'quality.manager@easternmills.com') {
        // Quality Manager rejected, escalate to Operations Manager
        nextLevelEmail = 'operations@easternmills.com';
        escalationMessage = 'Quality Manager has rejected the inspection. Escalating to Operations Manager.';
      } else {
        // Operations Manager rejected, final rejection
        escalationMessage = 'Operations Manager has rejected the inspection. This is a final rejection.';
      }
    }
    
    // Send next level escalation if needed
    if (nextLevelEmail) {
      try {
        await sendEscalationEmail(
          inspectionId as string,
          inspection,
          nextLevelEmail,
          2,
          escalationMessage
        );
        console.log(`🔄 Level 2 escalation sent to ${nextLevelEmail}`);
      } catch (escalationError) {
        console.error('❌ Error sending level 2 escalation:', escalationError);
      }
    }
    
    // Send confirmation email
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'quality@easternmills.com',
      to: tokenData.approverEmail,
      subject: '❌ Inspection Rejected - Confirmation',
      html: `
        <html><body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #dc2626;">❌ Inspection Rejected</h2>
          <p>You have rejected the lab inspection:</p>
          <ul>
            <li><strong>Inspection ID:</strong> ${inspectionId}</li>
            <li><strong>Material Type:</strong> ${inspection?.materialType || 'Not specified'}</li>
            <li><strong>Supplier:</strong> ${inspection?.supplierName || 'Not specified'}</li>
            <li><strong>Rejected at:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>${escalationMessage}</p>
          ${nextLevelEmail ? `<p>Next level escalation has been sent to: <strong>${nextLevelEmail}</strong></p>` : '<p><strong>This is a final rejection. No further escalation available.</strong></p>'}
        </body></html>
      `
    });
    
    res.send(`
      <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #dc2626;">❌ Inspection Rejected</h1>
        <p style="font-size: 18px; margin: 20px 0;">You have rejected this inspection.</p>
        <div style="background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px auto; max-width: 400px;">
          <p><strong>Inspection ID:</strong> ${inspectionId}</p>
          <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">REJECTED</span></p>
          <p><strong>Rejected by:</strong> ${tokenData.approverEmail}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #666; font-size: 14px;">${escalationMessage}</p>
        ${nextLevelEmail ? `<p style="color: #666; font-size: 14px;">Escalation sent to: <strong>${nextLevelEmail}</strong></p>` : '<p style="color: #666; font-size: 14px;"><strong>Final rejection - no further escalation.</strong></p>'}
        <p style="color: #666; font-size: 14px;">A confirmation email has been sent to you.</p>
      </body></html>
    `);
    
  } catch (error) {
    console.error('❌ Error processing rejection:', error);
    res.status(500).send(`
      <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #dc2626;">❌ Error Processing Rejection</h2>
        <p>An error occurred while processing your rejection. Please contact the quality team.</p>
      </body></html>
    `);
  }
});

// Test endpoint to trigger escalation (for development)
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { inspectionId, approverEmail } = req.body;
    
    if (!inspectionId || !approverEmail) {
      return res.status(400).json({ error: 'Missing inspectionId or approverEmail' });
    }
    
    // Get inspection from Firestore
    const inspectionDoc = await adminDb.collection('labInspections').doc(inspectionId).get();
    
    if (!inspectionDoc.exists) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    
    const inspection = inspectionDoc.data();
    
    // Send test escalation
    const result = await sendEscalationEmail(
      inspectionId,
      inspection,
      approverEmail,
      1,
      'Test escalation - Lab inspection failed quality standards'
    );
    
    res.json({ 
      success: true, 
      message: 'Test escalation sent successfully',
      approveToken: result.approveToken,
      failToken: result.failToken
    });
    
  } catch (error) {
    console.error('❌ Error sending test escalation:', error);
    res.status(500).json({ error: 'Failed to send test escalation' });
  }
});

export default router;