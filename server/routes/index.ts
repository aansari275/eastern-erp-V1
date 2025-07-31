import express from 'express';
import { adminDb } from '../firestoreHelpers';
import * as admin from 'firebase-admin';

const router = express.Router();

// GET /api/users - List all users
router.get('/users', async (req, res) => {
  try {
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get specific user
router.get('/users/:id', async (req, res) => {
  try {
    const userDoc = await adminDb.collection('users').doc(req.params.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create new user
router.post('/users', async (req, res) => {
  try {
    const userData = req.body;
    const docRef = await adminDb.collection('users').add({
      ...userData,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    const newDoc = await docRef.get();
    res.status(201).json({ id: newDoc.id, ...newDoc.data() });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST /api/admin/users - Admin endpoint to create new user (alias for /api/users)
router.post('/admin/users', async (req, res) => {
  try {
    const userData = req.body;
    const docRef = await adminDb.collection('users').add({
      ...userData,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    const newDoc = await docRef.get();
    res.status(201).json({ id: newDoc.id, ...newDoc.data() });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update user
router.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = {
      ...req.body,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await adminDb.collection('users').doc(userId).update(updates);
    const updatedDoc = await adminDb.collection('users').doc(userId).get();

    if (!updatedDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await adminDb.collection('users').doc(req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/departments - List all departments
router.get('/departments', async (req, res) => {
  try {
    const departmentsSnapshot = await adminDb.collection('departments')
      .where('is_active', '==', true)
      .get();
    const departments = departmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// GET /api/departments/:id/tabs - Get department tabs
router.get('/departments/:id/tabs', async (req, res) => {
  try {
    const tabsSnapshot = await adminDb.collection('department_tabs')
      .where('department_id', '==', req.params.id)
      .where('is_active', '==', true)
      .get();
    const tabs = tabsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(tabs);
  } catch (error) {
    console.error('Error fetching department tabs:', error);
    res.status(500).json({ error: 'Failed to fetch department tabs' });
  }
});

// GET /api/users/:id/permissions - Get user permissions
router.get('/users/:id/permissions', async (req, res) => {
  try {
    const permissionsSnapshot = await adminDb.collection('user_tab_permissions')
      .where('user_id', '==', req.params.id)
      .where('is_active', '==', true)
      .get();
    const permissions = permissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
});

// POST /api/users/:id/permissions - Set user permission
router.post('/users/:id/permissions', async (req, res) => {
  try {
    const { tabId, permission, departmentId } = req.body;
    const userId = req.params.id;

    // Check if permission already exists
    const existingSnapshot = await adminDb.collection('user_tab_permissions')
      .where('user_id', '==', userId)
      .where('tab_id', '==', tabId)
      .get();

    if (!existingSnapshot.empty) {
      // Update existing permission
      const docId = existingSnapshot.docs[0].id;
      await adminDb.collection('user_tab_permissions').doc(docId).update({
        permission,
        is_active: true,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const updatedDoc = await adminDb.collection('user_tab_permissions').doc(docId).get();
      res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } else {
      // Create new permission
      const docRef = await adminDb.collection('user_tab_permissions').add({
        user_id: userId,
        tab_id: tabId,
        department_id: departmentId,
        permission,
        is_active: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const newDoc = await docRef.get();
      res.status(201).json({ id: newDoc.id, ...newDoc.data() });
    }
  } catch (error) {
    console.error('Error setting user permission:', error);
    res.status(500).json({ error: 'Failed to set user permission' });
  }
});

export default router;