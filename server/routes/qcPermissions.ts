import express from 'express';
import { firestore } from '../../client/src/lib/firebase';


const router = express.Router();
const db = firestore;

interface QCPermission {
  userId: string;
  email: string;
  name: string;
  assignedStages: string[];
  isActive: boolean;
}

// Get all QC permissions
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('qcPermissions').get();
    const permissions: QCPermission[] = [];
    
    snapshot.forEach(doc => {
      permissions.push({ ...doc.data() as QCPermission });
    });
    
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching QC permissions:', error);
    res.status(500).json({ error: 'Failed to fetch QC permissions' });
  }
});

// Save QC permissions (bulk update)
router.post('/', async (req, res) => {
  try {
    const permissions: QCPermission[] = req.body;
    
    // Create a batch to update all permissions atomically
    const batch = db.batch();
    
    // Clear existing permissions
    const existingSnapshot = await db.collection('qcPermissions').get();
    existingSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Add new permissions
    permissions.forEach((permission) => {
      const docRef = db.collection('qcPermissions').doc(permission.userId);
      batch.set(docRef, permission);
    });
    
    await batch.commit();
    res.json({ message: 'QC permissions updated successfully' });
  } catch (error) {
    console.error('Error saving QC permissions:', error);
    res.status(500).json({ error: 'Failed to save QC permissions' });
  }
});

// Get QC permissions for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const doc = await db.collection('qcPermissions').doc(userId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'QC permissions not found for user' });
    }
    
    res.json(doc.data());
  } catch (error) {
    console.error('Error fetching user QC permissions:', error);
    res.status(500).json({ error: 'Failed to fetch user QC permissions' });
  }
});

// Update specific user permissions
router.put('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedPermission: QCPermission = req.body;
    
    await db.collection('qcPermissions').doc(userId).set(updatedPermission);
    res.json({ message: 'User QC permissions updated successfully' });
  } catch (error) {
    console.error('Error updating user QC permissions:', error);
    res.status(500).json({ error: 'Failed to update user QC permissions' });
  }
});

export default router;