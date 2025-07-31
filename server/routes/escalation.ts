import express from 'express';
import { EscalationService } from '../services/escalationService.js';
import { adminDb as firestore } from '../firestoreHelpers.js';

const router = express.Router();

/**
 * Manual escalation trigger (for testing or manual intervention)
 */
router.post('/manual', async (req, res) => {
  try {
    const { inspectionId, inspection } = req.body;
    
    // Trigger Level 1 escalation
    await EscalationService.escalateToQualityManager(inspection);
    
    // Update inspection with escalation status
    await firestore.collection('labInspections').doc(inspectionId).update({
      escalationStatus: 'level_1_sent', 
      escalatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ Manual escalation sent for inspection ${inspectionId}`);
    res.json({ success: true, message: 'Escalation sent successfully' });
    
  } catch (error) {
    console.error('❌ Error in manual escalation:', error);
    res.status(500).json({ error: 'Failed to send escalation' });
  }
});

/**
 * Quality Manager approves the material (Level 1 approval)
 */
router.get('/approve/:inspectionId', async (req, res) => {
  try {
    const { inspectionId } = req.params;
    
    // Update inspection status to approved by QM
    await firestore.collection('labInspections').doc(inspectionId).update({
      escalationStatus: 'qm_approved',
      overallStatus: 'pass', // QM overrides lab failure
      qmDecision: 'approved',
      qmDecisionAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Quality Manager approved inspection ${inspectionId}`);
    
    res.send(`
      <html>
        <head><title>Inspection Approved</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <div style="max-width: 500px; margin: 0 auto; padding: 40px; border: 2px solid #16a34a; border-radius: 10px; background: #f0f9ff;">
            <h1 style="color: #16a34a;">✅ Material Approved</h1>
            <p style="font-size: 18px;">Quality Manager has approved the material for production.</p>
            <p><strong>Inspection ID:</strong> ${inspectionId}</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">You can close this window.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Error approving inspection:', error);
    res.status(500).send('Error processing approval');
  }
});

/**
 * Quality Manager rejects the material (escalates to Level 2)
 */
router.get('/reject/:inspectionId', async (req, res) => {
  try {
    const { inspectionId } = req.params;
    
    // Get inspection details
    const inspectionDoc = await firestore.collection('labInspections').doc(inspectionId).get();
    if (!inspectionDoc.exists) {
      return res.status(404).send('Inspection not found');
    }
    
    const inspection = inspectionDoc.data();
    
    // Update inspection status
    await firestore.collection('labInspections').doc(inspectionId).update({
      escalationStatus: 'qm_rejected',
      qmDecision: 'rejected',
      qmDecisionAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Escalate to Level 2
    await EscalationService.escalateToSecondLevel({
      id: inspectionId,
      supplierName: inspection.supplierName,
      company: inspection.company,
      inspectionType: inspection.inspectionType,
      dateOfIncoming: inspection.dateOfIncoming,
      lotNo: inspection.lotNo,
      overallStatus: inspection.overallStatus,
      sampleResults: inspection.sampleResults
    });

    console.log(`✅ Quality Manager rejected inspection ${inspectionId}, escalated to Level 2`);
    
    res.send(`
      <html>
        <head><title>Material Rejected - Escalated</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <div style="max-width: 500px; margin: 0 auto; padding: 40px; border: 2px solid #dc2626; border-radius: 10px; background: #fef2f2;">
            <h1 style="color: #dc2626;">❌ Material Rejected</h1>
            <p style="font-size: 18px;">Quality Manager has rejected the material.</p>
            <p><strong>Inspection ID:</strong> ${inspectionId}</p>
            <div style="background: #fee; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="color: #dc2626;"><strong>🚀 Escalated to Level 2</strong></p>
              <p>Email sent to ${inspection.company === 'EHI' ? 'GM (Zakir)' : 'Operations Manager'} for final decision.</p>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">You can close this window.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Error rejecting inspection:', error);
    res.status(500).send('Error processing rejection');
  }
});

/**
 * Second level (GM/Operations) final approval
 */
router.get('/final-approve/:inspectionId', async (req, res) => {
  try {
    const { inspectionId } = req.params;
    
    // Update inspection status to final approval
    await firestore.collection('labInspections').doc(inspectionId).update({
      escalationStatus: 'final_approved',
      overallStatus: 'pass', // Final approval overrides all previous failures
      finalDecision: 'approved',
      finalDecisionAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Final approval granted for inspection ${inspectionId}`);
    
    res.send(`
      <html>
        <head><title>Final Approval Granted</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <div style="max-width: 500px; margin: 0 auto; padding: 40px; border: 2px solid #16a34a; border-radius: 10px; background: #f0f9ff;">
            <h1 style="color: #16a34a;">✅ FINAL APPROVAL GRANTED</h1>
            <p style="font-size: 18px;">Material has been given final approval for production.</p>
            <p><strong>Inspection ID:</strong> ${inspectionId}</p>
            <div style="background: #dff0d8; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="color: #3c763d;"><strong>✓ Material approved for production use</strong></p>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">You can close this window.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Error processing final approval:', error);
    res.status(500).send('Error processing final approval');
  }
});

/**
 * Second level (GM/Operations) final rejection
 */
router.get('/final-reject/:inspectionId', async (req, res) => {
  try {
    const { inspectionId } = req.params;
    
    // Update inspection status to final rejection
    await firestore.collection('labInspections').doc(inspectionId).update({
      escalationStatus: 'final_rejected',
      overallStatus: 'fail', // Final rejection confirms failure
      finalDecision: 'rejected',
      finalDecisionAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`❌ Final rejection confirmed for inspection ${inspectionId}`);
    
    res.send(`
      <html>
        <head><title>Final Rejection Confirmed</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <div style="max-width: 500px; margin: 0 auto; padding: 40px; border: 2px solid #dc2626; border-radius: 10px; background: #fef2f2;">
            <h1 style="color: #dc2626;">❌ FINAL REJECTION CONFIRMED</h1>
            <p style="font-size: 18px;">Material has been finally rejected.</p>
            <p><strong>Inspection ID:</strong> ${inspectionId}</p>
            <div style="background: #f2dede; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="color: #a94442;"><strong>✗ Material must be returned to supplier</strong></p>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">You can close this window.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Error processing final rejection:', error);
    res.status(500).send('Error processing final rejection');
  }
});

export default router;