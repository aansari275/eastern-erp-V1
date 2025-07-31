import { Router } from 'express';
import { adminDb } from '../firestoreHelpers';
const router = Router();
// Get all PDOCs
router.get('/', async (req, res) => {
    try {
        const snapshot = await adminDb.collection('pdocs').get();
        const pdocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(pdocs);
    }
    catch (error) {
        console.error('Error fetching PDOCs:', error);
        res.status(500).json({ error: 'Failed to fetch PDOCs' });
    }
});
// Get a specific PDOC by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await adminDb.collection('pdocs').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'PDOC not found' });
        }
        res.json({ id: doc.id, ...doc.data() });
    }
    catch (error) {
        console.error('Error fetching PDOC:', error);
        res.status(500).json({ error: 'Failed to fetch PDOC' });
    }
});
// Create a new PDOC
router.post('/', async (req, res) => {
    try {
        const pdocData = {
            ...req.body,
            created_at: new Date(),
            updated_at: new Date()
        };
        const docRef = await adminDb.collection('pdocs').add(pdocData);
        const newDoc = await docRef.get();
        res.status(201).json({ id: newDoc.id, ...newDoc.data() });
    }
    catch (error) {
        console.error('Error creating PDOC:', error);
        res.status(500).json({ error: 'Failed to create PDOC' });
    }
});
// Update a PDOC
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updated_at: new Date()
        };
        await adminDb.collection('pdocs').doc(id).update(updateData);
        const updatedDoc = await adminDb.collection('pdocs').doc(id).get();
        if (!updatedDoc.exists) {
            return res.status(404).json({ error: 'PDOC not found' });
        }
        res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    }
    catch (error) {
        console.error('Error updating PDOC:', error);
        res.status(500).json({ error: 'Failed to update PDOC' });
    }
});
// Delete a PDOC
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await adminDb.collection('pdocs').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'PDOC not found' });
        }
        await adminDb.collection('pdocs').doc(id).delete();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting PDOC:', error);
        res.status(500).json({ error: 'Failed to delete PDOC' });
    }
});
export default router;
