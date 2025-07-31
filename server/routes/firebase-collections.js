import express from 'express';
const router = express.Router();
// Get all documents from a specific collection
router.get('/:collectionName', async (req, res) => {
    try {
        const { collectionName } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        console.log(`Fetching collection: ${collectionName}`);
        const snapshot = await adminDb.collection(collectionName).limit(limit).get();
        const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({
            collection: collectionName,
            count: documents.length,
            documents: documents
        });
    }
    catch (error) {
        console.error(`Error fetching collection ${req.params.collectionName}:`, error);
        res.status(500).json({
            error: 'Failed to fetch collection data',
            collection: req.params.collectionName,
            count: 0,
            documents: []
        });
    }
});
// Get collection metadata (count only)
router.get('/:collectionName/meta', async (req, res) => {
    try {
        const { collectionName } = req.params;
        const snapshot = await adminDb.collection(collectionName).get();
        res.json({
            collection: collectionName,
            count: snapshot.size
        });
    }
    catch (error) {
        console.error(`Error fetching collection metadata ${req.params.collectionName}:`, error);
        res.status(500).json({
            error: 'Failed to fetch collection metadata',
            collection: req.params.collectionName,
            count: 0
        });
    }
});
export default router;
