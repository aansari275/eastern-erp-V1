import express from 'express';
import { firestore } from '../firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

const router = express.Router();

// Get all audit forms for a company
router.get('/', async (req, res) => {
  try {
    const { company, status, auditType } = req.query;
    
    let query = firestore.collection('auditForms');
    
    if (company) {
      query = query.where('company', '==', company);
    }
    if (status) {
      query = query.where('status', '==', status);
    }
    if (auditType) {
      query = query.where('auditType', '==', auditType);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const auditForms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📋 Found ${auditForms.length} audit forms`);
    res.json(auditForms);
  } catch (error) {
    console.error('❌ Error fetching audit forms:', error);
    res.status(500).json({ error: 'Failed to fetch audit forms' });
  }
});

// Get a specific audit form by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await firestore.collection('auditForms').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Audit form not found' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('❌ Error fetching audit form:', error);
    res.status(500).json({ error: 'Failed to fetch audit form' });
  }
});

// Create a new audit form
router.post('/', async (req, res) => {
  try {
    const auditFormData = {
      ...req.body,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    
    const docRef = await firestore.collection('auditForms').add(auditFormData);
    console.log('✅ Created audit form with ID:', docRef.id);
    
    // Get the created document
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('❌ Error creating audit form:', error);
    res.status(500).json({ error: 'Failed to create audit form' });
  }
});

// Update an audit form
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: FieldValue.serverTimestamp()
    };
    
    await firestore.collection('auditForms').doc(id).update(updateData);
    console.log('✅ Updated audit form:', id);
    
    // Get the updated document
    const doc = await firestore.collection('auditForms').doc(id).get();
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('❌ Error updating audit form:', error);
    res.status(500).json({ error: 'Failed to update audit form' });
  }
});

// Delete an audit form
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await firestore.collection('auditForms').doc(id).delete();
    console.log('✅ Deleted audit form:', id);
    res.json({ message: 'Audit form deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting audit form:', error);
    res.status(500).json({ error: 'Failed to delete audit form' });
  }
});

export default router;