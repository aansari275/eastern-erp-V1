import express from 'express';
const router = express.Router();

// Get all Buyer Articles No.
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all buyer articles from Firebase...');
    const snapshot = await adminDb.collection('buyerArticlesNo').get();
    
    const buyerArticles = [];
    snapshot.forEach(doc => {
      buyerArticles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${buyerArticles.length} buyer articles`);
    res.json(buyerArticles);
  } catch (error) {
    console.error('Error fetching buyer articles:', error);
    res.status(500).json({ error: 'Failed to fetch buyer articles' });
  }
});

// Get Buyer Articles No. by buyer code
router.get('/buyer/:buyerCode', async (req, res) => {
  try {
    const { buyerCode } = req.params;
    console.log(`Fetching buyer articles for buyer: ${buyerCode}`);
    
    const snapshot = await adminDb.collection('buyerArticlesNo')
      .where('buyerDesignCode', '==', buyerCode)
      .get();
    
    const buyerArticles = [];
    snapshot.forEach(doc => {
      buyerArticles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${buyerArticles.length} articles for buyer ${buyerCode}`);
    res.json(buyerArticles);
  } catch (error) {
    console.error('Error fetching buyer articles:', error);
    res.status(500).json({ error: 'Failed to fetch buyer articles' });
  }
});

// Get single Buyer Article No.
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await adminDb.collection('buyerArticlesNo').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Buyer article not found' });
    }
    
    res.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    console.error('Error fetching buyer article:', error);
    res.status(500).json({ error: 'Failed to fetch buyer article' });
  }
});

// Create new Buyer Article No.
router.post('/', async (req, res) => {
  try {
    const buyerArticleData = req.body;
    
    // Add timestamps
    buyerArticleData.createdAt = new Date();
    buyerArticleData.updatedAt = new Date();
    
    const docRef = await adminDb.collection('buyerArticlesNo').add(buyerArticleData);
    
    res.status(201).json({
      id: docRef.id,
      ...buyerArticleData
    });
  } catch (error) {
    console.error('Error creating buyer article:', error);
    res.status(500).json({ error: 'Failed to create buyer article' });
  }
});

// Update Buyer Article No.
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    await adminDb.collection('buyerArticlesNo').doc(id).update(updateData);
    
    const updatedDoc = await adminDb.collection('buyerArticlesNo').doc(id).get();
    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Error updating buyer article:', error);
    res.status(500).json({ error: 'Failed to update buyer article' });
  }
});

// Delete Buyer Article No.
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await adminDb.collection('buyerArticlesNo').doc(id).delete();
    res.json({ message: 'Buyer article deleted successfully' });
  } catch (error) {
    console.error('Error deleting buyer article:', error);
    res.status(500).json({ error: 'Failed to delete buyer article' });
  }
});

export default router;