import express from 'express';
import { Resend } from 'resend';
const router = express.Router();
// Initialize Resend
let resend = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
}
// Escalation email route
router.post('/escalate', async (req, res) => {
    try {
        const { recordId, materialType, company, labReportNumber, defects = [], escalationContacts = [], requestingUser = 'lab.technician@easternmills.com' } = req.body;
        // Validate required fields
        if (!recordId || !materialType || !company || !labReportNumber) {
            return res.status(400).json({
                error: 'Missing required fields: recordId, materialType, company, labReportNumber'
            });
        }
        // Log escalation attempt
        console.log('📧 Escalation email request:', {
            recordId,
            materialType,
            company,
            labReportNumber,
            defects: defects.length,
            escalationContacts: escalationContacts.length,
            hasResend: !!resend
        });
        // If Resend is not configured, log and return success for development
        if (!resend || !process.env.RESEND_API_KEY) {
            console.log('📧 Resend not configured - would send escalation email to Quality Manager');
            return res.status(200).json({
                success: true,
                message: 'Escalation logged (Resend not configured in development)'
            });
        }
        // Prepare email content
        const companyName = company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.';
        const defectsList = defects.map((defect, index) => `${index + 1}. ${defect.name} (${defect.severity})`).join('\n');
        const emailContent = `
      <h2>Material Quality Escalation - ${companyName}</h2>
      
      <p><strong>Lab Report Number:</strong> ${labReportNumber}</p>
      <p><strong>Material Type:</strong> ${materialType}</p>
      <p><strong>Company:</strong> ${companyName}</p>
      <p><strong>Status:</strong> FAILED - Requires Quality Manager Approval</p>
      
      <h3>Defects Found:</h3>
      <pre>${defectsList || 'No specific defects listed'}</pre>
      
      <p><strong>Requesting Lab Technician:</strong> ${requestingUser}</p>
      <p><strong>Escalation Time:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><em>This material has failed quality inspection and requires quality manager approval before proceeding.</em></p>
      
      <p>Please review and respond with approval or rejection decision.</p>
      
      <p>Best regards,<br>
      ${companyName} Quality Control System</p>
    `;
        // Get appropriate escalation contacts based on company and level
        const companyKey = company;
        const level1Contacts = escalationContacts[companyKey]?.level1 || [];
        const additionalContacts = escalationContacts.additional || [];
        // For initial escalation, send to Level 1 (Quality Manager) + additional contacts
        const allContacts = [...level1Contacts, ...additionalContacts].filter(email => email && email.trim());
        if (allContacts.length === 0) {
            return res.status(400).json({
                error: 'No valid escalation contacts configured',
                company: companyKey
            });
        }
        // Send emails to escalation contacts
        const emailPromises = allContacts.map(async (email) => {
            return resend.emails.send({
                to: email.trim(),
                from: 'quality@easternmills.com',
                subject: `Quality Escalation: ${labReportNumber} - Material Failed Inspection`,
                html: emailContent
            });
        });
        await Promise.all(emailPromises);
        console.log(`✅ Escalation emails sent for ${labReportNumber} to:`, allContacts);
        res.status(200).json({
            success: true,
            message: `Escalation emails sent to ${allContacts.length} recipients`,
            labReportNumber,
            recipients: allContacts.length,
            sentTo: allContacts
        });
    }
    catch (error) {
        console.error('❌ Escalation email failed:', error);
        res.status(500).json({
            error: 'Failed to send escalation emails',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Quality manager approval route
router.post('/approve', async (req, res) => {
    try {
        const { recordId, labReportNumber, decision, // 'approved' or 'rejected'
        approverEmail, comments = '', escalationContacts = [] } = req.body;
        if (!recordId || !labReportNumber || !decision || !approverEmail) {
            return res.status(400).json({
                error: 'Missing required fields: recordId, labReportNumber, decision, approverEmail'
            });
        }
        // Log approval decision
        console.log(`📋 Quality Manager Decision for ${labReportNumber}:`, {
            decision,
            approver: approverEmail,
            comments,
            timestamp: new Date().toISOString()
        });
        // If material is rejected by Quality Manager, escalate to Level 2 (Operations Manager)
        if (decision === 'rejected' && resend && process.env.RESEND_API_KEY) {
            // Determine company from lab report number
            const companyFromReport = labReportNumber.startsWith('EHI-') ? 'EHI' : 'EMPL';
            const level2Contacts = escalationContacts[companyFromReport]?.level2 || [];
            const additionalContacts = escalationContacts.additional || [];
            const level2Recipients = [...level2Contacts, ...additionalContacts].filter(email => email && email.trim());
            if (level2Recipients.length > 0) {
                const escalationEmailContent = `
          <h2>Material Rejected by Quality Manager - Level 2 Review Required</h2>
          
          <p><strong>Lab Report Number:</strong> ${labReportNumber}</p>
          <p><strong>Company:</strong> ${companyFromReport}</p>
          <p><strong>Status:</strong> REJECTED BY QUALITY MANAGER</p>
          <p><strong>Quality Manager:</strong> ${approverEmail}</p>
          <p><strong>Decision Time:</strong> ${new Date().toLocaleString()}</p>
          
          ${comments ? `<h3>Quality Manager Comments:</h3><p>${comments}</p>` : ''}
          
          <p><em>This material has been rejected by the Quality Manager and requires Level 2 approval for final decision.</em></p>
          
          <p><strong>Next Steps:</strong> ${companyFromReport === 'EHI' ? 'GM (Zakir)' : 'Operations (Sanjay)'} review and final approval/rejection decision required.</p>
          
          <p>Best regards,<br>
          ${companyFromReport} Quality Management System</p>
        `;
                // Send to Level 2 contacts
                const emailPromises = level2Recipients.map(email => resend.emails.send({
                    to: email.trim(),
                    from: 'quality@easternmills.com',
                    subject: `Level 2 Review Required: ${labReportNumber} - Material Rejected by Quality Manager`,
                    html: escalationEmailContent
                }));
                await Promise.all(emailPromises);
                console.log('📧 Escalated to Level 2:', labReportNumber, 'Recipients:', level2Recipients);
            }
        }
        res.status(200).json({
            success: true,
            message: decision === 'rejected' ?
                'Material rejected and escalated to Operations Manager' :
                `Material ${decision} successfully`,
            labReportNumber,
            decision,
            escalatedTo: decision === 'rejected' ? 'Operations Manager' : null
        });
    }
    catch (error) {
        console.error('❌ Approval process failed:', error);
        res.status(500).json({
            error: 'Failed to process approval',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Operations manager final decision route
router.post('/operations-decision', async (req, res) => {
    try {
        const { recordId, labReportNumber, decision, // 'approved' or 'final_rejected'
        operationsManagerEmail, comments = '', escalationContacts = [] } = req.body;
        if (!recordId || !labReportNumber || !decision || !operationsManagerEmail) {
            return res.status(400).json({
                error: 'Missing required fields: recordId, labReportNumber, decision, operationsManagerEmail'
            });
        }
        // Log operations manager decision
        console.log(`📋 Operations Manager Final Decision for ${labReportNumber}:`, {
            decision,
            approver: operationsManagerEmail,
            comments,
            timestamp: new Date().toISOString()
        });
        // Send final decision notification to all stakeholders
        if (resend && process.env.RESEND_API_KEY) {
            const finalDecisionContent = `
        <h2>Final Decision: Material ${decision === 'approved' ? 'Approved' : 'Rejected'} by Operations Manager</h2>
        
        <p><strong>Lab Report Number:</strong> ${labReportNumber}</p>
        <p><strong>Final Decision:</strong> ${decision === 'approved' ? 'APPROVED' : 'FINAL REJECTION'}</p>
        <p><strong>Operations Manager:</strong> ${operationsManagerEmail}</p>
        <p><strong>Decision Time:</strong> ${new Date().toLocaleString()}</p>
        
        ${comments ? `<h3>Operations Manager Comments:</h3><p>${comments}</p>` : ''}
        
        <p><em>This is the final decision from Operations Management. ${decision === 'approved' ? 'Material may proceed in production.' : 'Material is definitively rejected and must not be used in production.'}</em></p>
        
        <p>Best regards,<br>
        Operations Management System</p>
      `;
            // Determine company and get all stakeholder emails
            const companyFromReport = labReportNumber.startsWith('EHI-') ? 'EHI' : 'EMPL';
            const level1Contacts = escalationContacts[companyFromReport]?.level1 || [];
            const level2Contacts = escalationContacts[companyFromReport]?.level2 || [];
            const additionalContacts = escalationContacts.additional || [];
            // Send to all stakeholders (Quality Manager, Level 2, and additional contacts)
            const stakeholderEmails = [
                ...level1Contacts,
                ...level2Contacts,
                ...additionalContacts,
                'production.manager@easternmills.com' // Always notify production
            ].filter(email => email && email.trim());
            await Promise.all(stakeholderEmails.map(email => resend.emails.send({
                to: email,
                from: 'operations@easternmills.com',
                subject: `Final Decision: ${labReportNumber} - Material ${decision === 'approved' ? 'Approved' : 'Rejected'} by Operations Manager`,
                html: finalDecisionContent
            })));
            console.log('📧 Final decision sent to all stakeholders:', labReportNumber);
        }
        res.status(200).json({
            success: true,
            message: `Material ${decision === 'approved' ? 'approved' : 'finally rejected'} by Operations Manager`,
            labReportNumber,
            decision,
            finalDecision: true
        });
    }
    catch (error) {
        console.error('❌ Operations decision process failed:', error);
        res.status(500).json({
            error: 'Failed to process operations decision',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export default router;
