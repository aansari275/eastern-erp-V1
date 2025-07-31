import express from 'express';
import * as admin from 'firebase-admin';

const router = express.Router();

// GET all dynamic lab inspections
router.get('/', async (req, res) => {
  try {
    console.log('🔬 Fetching dynamic lab inspections...');
    const snapshot = await admin.firestore().collection('dynamicLabInspections')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const inspections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
    }));
    
    console.log('✅ Found', inspections.length, 'dynamic lab inspections');
    res.json(inspections);
  } catch (error) {
    console.error('Error fetching dynamic lab inspections:', error);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

// GET inspection by ID
router.get('/:id', async (req, res) => {
  try {
    const docRef = admin.firestore().collection('dynamicLabInspections').doc(req.params.id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      res.json({ id: docSnap.id, ...docSnap.data() });
    } else {
      res.status(404).json({ error: 'Inspection not found' });
    }
  } catch (error) {
    console.error('Error fetching inspection:', error);
    res.status(500).json({ error: 'Failed to fetch inspection' });
  }
});

// POST create new inspection
router.post('/', async (req, res) => {
  try {
    console.log('🔬 Creating dynamic lab inspection...', req.body);
    
    const inspectionData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: req.body.status || 'draft'
    };
    
    const docRef = await admin.firestore().collection('dynamicLabInspections').add(inspectionData);
    
    console.log('✅ Dynamic lab inspection created with ID:', docRef.id);
    
    res.status(201).json({
      id: docRef.id,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: req.body.status || 'draft'
    });
  } catch (error) {
    console.error('❌ Error creating dynamic lab inspection:', error);
    res.status(500).json({ error: 'Failed to create inspection' });
  }
});

// PUT update inspection
router.put('/:id', async (req, res) => {
  try {
    const docRef = admin.firestore().collection('dynamicLabInspections').doc(req.params.id);
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await docRef.update(updateData);
    
    res.json({
      id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating inspection:', error);
    res.status(500).json({ error: 'Failed to update inspection' });
  }
});

// DELETE inspection
router.delete('/:id', async (req, res) => {
  try {
    await admin.firestore().collection('dynamicLabInspections').doc(req.params.id).delete();
    res.json({ message: 'Inspection deleted successfully' });
  } catch (error) {
    console.error('Error deleting inspection:', error);
    res.status(500).json({ error: 'Failed to delete inspection' });
  }
});

// GET inspections by company
router.get('/company/:company', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('dynamicLabInspections')
      .where('company', '==', req.params.company)
      .orderBy('createdAt', 'desc')
      .get();
    
    const inspections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(inspections);
  } catch (error) {
    console.error('Error fetching inspections by company:', error);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

// GET inspections by type
router.get('/type/:type', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('dynamicLabInspections')
      .where('inspectionType', '==', req.params.type)
      .orderBy('createdAt', 'desc')
      .get();
    
    const inspections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(inspections);
  } catch (error) {
    console.error('Error fetching inspections by type:', error);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

export default router;