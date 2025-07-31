import express from 'express';
import admin from 'firebase-admin';
import { generateLabInspectionPDF } from '../pdfMaster';
import { EscalationService } from '../services/escalationService';

const router = express.Router();

// GET /api/lab-inspections - Fetch all lab inspections
router.get('/', async (req, res) => {
  try {
    console.log('🔬 Server: Fetching lab inspections...');
    
    // Get lab inspections from Firestore
    const labInspectionsRef = admin.firestore().collection('labInspections');
    const snapshot = await labInspectionsRef.orderBy('createdAt', 'desc').limit(50).get();
    
    const inspections = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || doc.data().submittedAt
    }));
    
    console.log('✅ Server: Found', inspections.length, 'lab inspections');
    res.json(inspections);
    
  } catch (error) {
    console.error('❌ Server: Error fetching lab inspections:', error);
    // Return empty array instead of error to allow UI to load
    res.json([]);
  }
});

// GET /api/lab-inspections/:id - Fetch individual lab inspection
router.get('/:id', async (req, res) => {
  try {
    console.log('🔬 Server: Fetching lab inspection:', req.params.id);
    
    const inspectionDoc = await admin.firestore().collection('labInspections').doc(req.params.id).get();
    
    if (!inspectionDoc.exists) {
      return res.status(404).json({ error: 'Lab inspection not found' });
    }
    
    const inspection = {
      id: inspectionDoc.id,
      ...inspectionDoc.data(),
      createdAt: inspectionDoc.data()?.createdAt?.toDate?.()?.toISOString() || inspectionDoc.data()?.createdAt,
      updatedAt: inspectionDoc.data()?.updatedAt?.toDate?.()?.toISOString() || inspectionDoc.data()?.updatedAt,
      submittedAt: inspectionDoc.data()?.submittedAt?.toDate?.()?.toISOString() || inspectionDoc.data()?.submittedAt
    };
    
    console.log('✅ Server: Found lab inspection');
    res.json(inspection);
    
  } catch (error) {
    console.error('❌ Server: Error fetching lab inspection:', error);
    res.status(500).json({ error: 'Failed to fetch lab inspection' });
  }
});

// POST /api/lab-inspections - Create new lab inspection
router.post('/', async (req, res) => {
  try {
    console.log('🔬 Server: Creating lab inspection...');
    
    const inspectionData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await admin.firestore().collection('labInspections').add(inspectionData);
    
    // Fetch the created document to return it
    const createdDoc = await docRef.get();
    const result = {
      id: docRef.id,
      ...createdDoc.data(),
      createdAt: createdDoc.data()?.createdAt?.toDate?.()?.toISOString(),
      updatedAt: createdDoc.data()?.updatedAt?.toDate?.()?.toISOString()
    };
    
    // 🚨 AUTOMATIC ESCALATION: Check if new inspection is submitted and failed
    if (req.body.status === 'submitted' && req.body.overallStatus === 'fail') {
      console.log('🚨 Failed inspection detected on creation - triggering Level 1 escalation');
      
      try {
        await EscalationService.escalateToQualityManager({
          id: docRef.id,
          supplierName: result.supplierName || 'Unknown Supplier',
          company: result.company || 'Unknown Company',
          inspectionType: result.inspectionType || 'Unknown Type',
          dateOfIncoming: result.dateOfIncoming || new Date().toISOString().split('T')[0],
          lotNo: result.lotNo || 'Unknown Lot',
          overallStatus: result.overallStatus,
          sampleResults: result.sampleResults
        });
        
        // Update inspection with escalation status
        await docRef.update({
          escalationStatus: 'level_1_sent',
          escalatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Level 1 escalation email sent for new inspection');
      } catch (escalationError) {
        console.error('❌ Failed to send escalation email for new inspection:', escalationError);
        // Don't fail the main request if escalation fails
      }
    }
    
    console.log('✅ Server: Created lab inspection with ID:', docRef.id);
    res.status(201).json(result);
    
  } catch (error) {
    console.error('❌ Server: Error creating lab inspection:', error);
    res.status(500).json({ error: 'Failed to create lab inspection' });
  }
});

// PUT /api/lab-inspections/:id - Update lab inspection
router.put('/:id', async (req, res) => {
  try {
    console.log('🔬 Server: Updating lab inspection:', req.params.id);
    
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // If status is changing to submitted, add submittedAt timestamp
    if (req.body.status === 'submitted') {
      updateData.submittedAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    await admin.firestore().collection('labInspections').doc(req.params.id).update(updateData);
    
    // Fetch the updated document
    const updatedDoc = await admin.firestore().collection('labInspections').doc(req.params.id).get();
    const result = {
      id: req.params.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toDate?.()?.toISOString(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate?.()?.toISOString(),
      submittedAt: updatedDoc.data()?.submittedAt?.toDate?.()?.toISOString()
    };
    
    // 🚨 AUTOMATIC ESCALATION: Check if inspection failed and trigger Level 1 escalation
    if (req.body.status === 'submitted' && req.body.overallStatus === 'fail') {
      console.log('🚨 Failed inspection detected - triggering Level 1 escalation');
      
      try {
        await EscalationService.escalateToQualityManager({
          id: req.params.id,
          supplierName: result.supplierName || 'Unknown Supplier',
          company: result.company || 'Unknown Company',
          inspectionType: result.inspectionType || 'Unknown Type',
          dateOfIncoming: result.dateOfIncoming || new Date().toISOString().split('T')[0],
          lotNo: result.lotNo || 'Unknown Lot',
          overallStatus: result.overallStatus,
          sampleResults: result.sampleResults
        });
        
        // Update inspection with escalation status
        await admin.firestore().collection('labInspections').doc(req.params.id).update({
          escalationStatus: 'level_1_sent',
          escalatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Level 1 escalation email sent successfully');
      } catch (escalationError) {
        console.error('❌ Failed to send escalation email:', escalationError);
        // Don't fail the main request if escalation fails
      }
    }
    
    console.log('✅ Server: Updated lab inspection');
    res.json(result);
    
  } catch (error) {
    console.error('❌ Server: Error updating lab inspection:', error);
    res.status(500).json({ error: 'Failed to update lab inspection' });
  }
});

// DELETE /api/lab-inspections/:id - Delete lab inspection
router.delete('/:id', async (req, res) => {
  try {
    console.log('🔬 Server: Deleting lab inspection:', req.params.id);
    
    await admin.firestore().collection('labInspections').doc(req.params.id).delete();
    
    console.log('✅ Server: Deleted lab inspection');
    res.json({ success: true, message: 'Lab inspection deleted successfully' });
    
  } catch (error) {
    console.error('❌ Server: Error deleting lab inspection:', error);
    res.status(500).json({ error: 'Failed to delete lab inspection' });
  }
});

// GET /api/lab-inspections/:id/pdf - Generate PDF for lab inspection
router.get('/:id/pdf', async (req, res) => {
  try {
    console.log('🔬 Server: Generating PDF for lab inspection:', req.params.id);
    
    // Get inspection data from Firestore
    const inspectionDoc = await admin.firestore().collection('labInspections').doc(req.params.id).get();
    
    if (!inspectionDoc.exists) {
      return res.status(404).json({ error: 'Lab inspection not found' });
    }
    
    const inspectionData = {
      id: inspectionDoc.id,
      ...inspectionDoc.data(),
      createdAt: inspectionDoc.data()?.createdAt?.toDate?.()?.toISOString(),
      updatedAt: inspectionDoc.data()?.updatedAt?.toDate?.()?.toISOString(),
      submittedAt: inspectionDoc.data()?.submittedAt?.toDate?.()?.toISOString()
    };
    
    // Generate PDF using master PDF system with Puppeteer + fallback
    console.log('🔧 Using Master PDF Generator with LATO font support...');
    const pdfBuffer = await generateLabInspectionPDF(inspectionData);
    
    const filename = `Lab_Inspection_${inspectionData.materialType}_${inspectionData.challanNumber || 'unknown'}_${new Date().toISOString().split('T')[0]}_${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
    
    console.log('✅ Server: PDF generated successfully for lab inspection:', req.params.id);
    
  } catch (error) {
    console.error('❌ Server: Error generating PDF for lab inspection:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// =================== UNDYED LAB INSPECTIONS ROUTES ===================

// GET /api/lab-inspections/undyed - Fetch all undyed lab inspections
router.get('/undyed', async (req, res) => {
  try {
    console.log('🧪 Server: Fetching undyed lab inspections...');
    
    // Get undyed lab inspections from Firestore
    const undyedInspectionsRef = admin.firestore().collection('undyedLabInspections');
    const snapshot = await undyedInspectionsRef.orderBy('createdAt', 'desc').limit(50).get();
    
    const inspections = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || doc.data().submittedAt
    }));
    
    console.log('✅ Server: Found', inspections.length, 'undyed lab inspections');
    res.json(inspections);
    
  } catch (error) {
    console.error('❌ Server: Error fetching undyed lab inspections:', error);
    res.json([]);
  }
});

// POST /api/lab-inspections/undyed - Create new undyed lab inspection
router.post('/undyed', async (req, res) => {
  try {
    console.log('🧪 Server: Creating undyed lab inspection...');
    
    const inspectionData = {
      ...req.body,
      materialType: 'undyed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await admin.firestore().collection('undyedLabInspections').add(inspectionData);
    
    // Fetch the created document to return it
    const createdDoc = await docRef.get();
    const result = {
      id: docRef.id,
      ...createdDoc.data(),
      createdAt: createdDoc.data()?.createdAt?.toDate?.()?.toISOString(),
      updatedAt: createdDoc.data()?.updatedAt?.toDate?.()?.toISOString()
    };
    
    console.log('✅ Server: Created undyed lab inspection with ID:', docRef.id);
    res.status(201).json(result);
    
  } catch (error) {
    console.error('❌ Server: Error creating undyed lab inspection:', error);
    res.status(500).json({ error: 'Failed to create undyed lab inspection' });
  }
});

// PUT /api/lab-inspections/undyed/:id - Update undyed lab inspection
router.put('/undyed/:id', async (req, res) => {
  try {
    console.log('🧪 Server: Updating undyed lab inspection:', req.params.id);
    
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // If status is being changed to 'submitted', automatically set submittedAt timestamp
    if (req.body.status === 'submitted' && (!req.body.submittedAt || req.body.submittedAt === '')) {
      updateData.submittedAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    await admin.firestore().collection('undyedLabInspections').doc(req.params.id).update(updateData);
    
    // Fetch the updated document to return it
    const updatedDoc = await admin.firestore().collection('undyedLabInspections').doc(req.params.id).get();
    const result = {
      id: req.params.id,
      ...updatedDoc.data(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate?.()?.toISOString(),
      submittedAt: updatedDoc.data()?.submittedAt?.toDate?.()?.toISOString()
    };
    
    console.log('✅ Server: Updated undyed lab inspection:', req.params.id);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Server: Error updating undyed lab inspection:', error);
    res.status(500).json({ error: 'Failed to update undyed lab inspection' });
  }
});

// DELETE /api/lab-inspections/undyed/:id - Delete undyed lab inspection
router.delete('/undyed/:id', async (req, res) => {
  try {
    console.log('🧪 Server: Deleting undyed lab inspection:', req.params.id);
    
    await admin.firestore().collection('undyedLabInspections').doc(req.params.id).delete();
    
    console.log('✅ Server: Deleted undyed lab inspection:', req.params.id);
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Server: Error deleting undyed lab inspection:', error);
    res.status(500).json({ error: 'Failed to delete undyed lab inspection' });
  }
});

// GET /api/lab-inspections/undyed/:id/pdf - Generate and download PDF for undyed lab inspection
router.get('/undyed/:id/pdf', async (req, res) => {
  try {
    console.log('🧪 Server: Generating PDF for undyed lab inspection:', req.params.id);
    
    // Get the undyed lab inspection from Firestore
    const doc = await admin.firestore().collection('undyedLabInspections').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Undyed lab inspection not found' });
    }
    
    const inspection = { id: doc.id, ...doc.data() };
    
    // Generate PDF using the master PDF generator (will adapt for undyed format)
    const { buffer, filename } = await generateLabInspectionPDF(inspection as any);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    // Send the PDF buffer
    res.send(buffer);
    
    console.log('✅ Server: Generated PDF for undyed lab inspection:', req.params.id);
    
  } catch (error) {
    console.error('❌ Server: Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;