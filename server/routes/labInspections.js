import express from 'express';
import admin from 'firebase-admin';
import { generateLabInspectionPDF } from '../pdfMaster';
const router = express.Router();
// GET /api/lab-inspections - Fetch all lab inspections
router.get('/', async (req, res) => {
    try {
        console.log('🔬 Server: Fetching lab inspections...');
        // Get lab inspections from Firestore
        const labInspectionsRef = admin.firestore().collection('labInspections');
        const snapshot = await labInspectionsRef.orderBy('createdAt', 'desc').limit(50).get();
        const inspections = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to ISO strings
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
            submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || doc.data().submittedAt
        }));
        console.log('✅ Server: Found', inspections.length, 'lab inspections');
        res.json(inspections);
    }
    catch (error) {
        console.error('❌ Server: Error fetching lab inspections:', error);
        // Return empty array instead of error to allow UI to load
        res.json([]);
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
        console.log('✅ Server: Created lab inspection with ID:', docRef.id);
        res.status(201).json(result);
    }
    catch (error) {
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
        console.log('✅ Server: Updated lab inspection');
        res.json(result);
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('❌ Server: Error generating PDF for lab inspection:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});
export default router;
