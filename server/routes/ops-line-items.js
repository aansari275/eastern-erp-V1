import express from 'express';
import { adminDb } from '../firestoreHelpers';
import { insertBuyerArticleNoSchema } from '@shared/schema';
const router = express.Router();
// Get all OPS line items
router.get('/', async (req, res) => {
    try {
        const snapshot = await adminDb.collection('opsLineItems').get();
        const opsLineItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(opsLineItems);
    }
    catch (error) {
        console.error('Error fetching OPS line items:', error);
        res.status(500).json({ error: 'Failed to fetch OPS line items' });
    }
});
// Get OPS line items by buyer
router.get('/buyer/:buyerCode', async (req, res) => {
    try {
        const { buyerCode } = req.params;
        const snapshot = await adminDb.collection('opsLineItems').get();
        const allItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Filter by buyer code (handle trimming for ERP compatibility)
        const buyerItems = allItems.filter(item => item.buyerDesignCode &&
            (item.buyerDesignCode.trim() === buyerCode.trim() ||
                item.buyerName === buyerCode));
        res.json(buyerItems);
    }
    catch (error) {
        console.error('Error fetching buyer OPS line items:', error);
        res.status(500).json({ error: 'Failed to fetch buyer OPS line items' });
    }
});
// Get single OPS line item
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await adminDb.collection('opsLineItems').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'OPS line item not found' });
        }
        res.json({ id: doc.id, ...doc.data() });
    }
    catch (error) {
        console.error('Error fetching OPS line item:', error);
        res.status(500).json({ error: 'Failed to fetch OPS line item' });
    }
});
// Create new OPS line item
router.post('/', async (req, res) => {
    try {
        const validatedData = insertBuyerArticleNoSchema.parse(req.body);
        const docRef = await adminDb.collection('opsLineItems').add({
            ...validatedData,
            created_at: new Date(),
            updated_at: new Date()
        });
        const newDoc = await docRef.get();
        res.status(201).json({ id: newDoc.id, ...newDoc.data() });
    }
    catch (error) {
        console.error('Error creating OPS line item:', error);
        res.status(500).json({ error: 'Failed to create OPS line item' });
    }
});
// Update OPS line item
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = insertBuyerArticleNoSchema.partial().parse(req.body);
        await adminDb.collection('opsLineItems').doc(id).update({
            ...validatedData,
            updated_at: new Date()
        });
        const updatedDoc = await adminDb.collection('opsLineItems').doc(id).get();
        if (!updatedDoc.exists) {
            return res.status(404).json({ error: 'OPS line item not found' });
        }
        res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    }
    catch (error) {
        console.error('Error updating OPS line item:', error);
        res.status(500).json({ error: 'Failed to update OPS line item' });
    }
});
// Delete OPS line item
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await adminDb.collection('opsLineItems').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'OPS line item not found' });
        }
        await adminDb.collection('opsLineItems').doc(id).delete();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting OPS line item:', error);
        res.status(500).json({ error: 'Failed to delete OPS line item' });
    }
});
export default router;
