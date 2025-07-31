import admin from 'firebase-admin';
// Initialize Firebase Admin with service account
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let serviceAccount;
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
try {
    console.log('Checking for service account at:', serviceAccountPath);
    console.log('File exists?', fs.existsSync(serviceAccountPath));
    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log('✓ Service account file loaded successfully');
    }
    else {
        console.warn('Service account file not found at:', serviceAccountPath);
        // Try relative path
        const relativePath = './server/serviceAccountKey.json';
        if (fs.existsSync(relativePath)) {
            serviceAccount = JSON.parse(fs.readFileSync(relativePath, 'utf8'));
            console.log('✓ Service account file loaded from relative path');
        }
        else {
            throw new Error('Service account file not found');
        }
    }
}
catch (error) {
    console.warn('Service account file not found, attempting basic Firebase init');
    serviceAccount = {
        project_id: process.env.VITE_FIREBASE_PROJECT_ID || 'rugcraftpro',
    };
}
if (!admin.apps || !admin.apps.length) {
    try {
        if (serviceAccount.private_key) {
            // Use service account if available
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id || 'rugcraftpro',
            });
            console.log('✓ Firebase initialized with service account');
        }
        else {
            // Initialize Firebase with minimal configuration for development
            console.warn('⚠️ Initializing Firebase with basic configuration');
            admin.initializeApp({
                projectId: 'rugcraftpro',
            });
            console.log('✓ Firebase initialized with basic configuration');
        }
    }
    catch (error) {
        console.error('Firebase initialization error:', error);
        // Create a fallback admin object for development
        console.warn('⚠️ Using fallback Firebase configuration');
    }
}
export const adminDb = admin.firestore();
// User operations
export async function getUserById(id) {
    try {
        const userDoc = await adminDb.collection('users').doc(id).get();
        if (!userDoc.exists)
            return null;
        return { id: userDoc.id, ...userDoc.data() };
    }
    catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
}
export async function getUserByEmail(email) {
    try {
        console.log('🔍 Searching for user by email:', email);
        const usersRef = adminDb.collection('users');
        const snapshot = await usersRef.get();
        let foundUser = null;
        snapshot.forEach((doc) => {
            const data = doc.data();
            const userEmail = data.Email || data.email;
            console.log(`  Checking user ${doc.id}: email=${userEmail}`);
            if (userEmail === email) {
                foundUser = { id: doc.id, ...data };
                console.log('✅ Found matching user:', doc.id);
            }
        });
        return foundUser;
    }
    catch (error) {
        console.error('Error getting user by email:', error);
        return null;
    }
}
export async function createUser(userData) {
    try {
        const userRef = adminDb.collection('users').doc();
        const newUser = {
            ...userData,
            id: userRef.id,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        };
        await userRef.set(newUser);
        return { ...newUser, id: userRef.id, created_at: new Date(), updated_at: new Date() };
    }
    catch (error) {
        console.error('Error creating user:', error);
        return null;
    }
}
export async function updateUser(id, updates) {
    try {
        const userRef = adminDb.collection('users').doc(id);
        await userRef.update({
            ...updates,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        const updatedDoc = await userRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    }
    catch (error) {
        console.error('Error updating user:', error);
        return null;
    }
}
export async function listUsers(departmentId) {
    try {
        let queryRef = adminDb.collection('users');
        if (departmentId) {
            queryRef = queryRef.where('department_id', '==', departmentId);
        }
        const snapshot = await queryRef.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error listing users:', error);
        return [];
    }
}
// Department operations
export async function getDepartmentById(id) {
    try {
        const deptDoc = await adminDb.collection('departments').doc(id).get();
        if (!deptDoc.exists)
            return null;
        return { id: deptDoc.id, ...deptDoc.data() };
    }
    catch (error) {
        console.error('Error getting department:', error);
        return null;
    }
}
export async function listDepartments() {
    try {
        const snapshot = await adminDb.collection('departments').where('is_active', '==', true).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error listing departments:', error);
        return [];
    }
}
export async function getDepartmentTabs(departmentId) {
    try {
        const snapshot = await adminDb
            .collection('departmentTabs')
            .where('department_id', '==', departmentId)
            .where('is_active', '==', true)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error getting department tabs:', error);
        return [];
    }
}
// Permission operations
export async function getUserPermissions(userId) {
    try {
        const snapshot = await adminDb.collection('userTabPermissions')
            .where('user_id', '==', userId)
            .where('is_active', '==', true)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error getting user permissions:', error);
        return [];
    }
}
export async function getPermissionsForRole(role) {
    // Define role-based permissions
    const rolePermissions = {
        'admin': ['all'],
        'sampling_manager': ['sampling_view', 'sampling_edit'],
        'sampling_user': ['sampling_view'],
        'merchandising_manager': ['merchandising_view', 'merchandising_edit'],
        'merchandising_user': ['merchandising_view'],
        'quality_manager': ['quality_view', 'quality_edit'],
        'quality_user': ['quality_view'],
        'production_manager': ['production_view', 'production_edit'],
        'production_user': ['production_view'],
        'viewer': ['basic_view'],
    };
    return rolePermissions[role] || ['basic_view'];
}
// Buyer operations
export async function getBuyerById(id) {
    try {
        const buyerDoc = await adminDb.collection('buyers').doc(id).get();
        if (!buyerDoc.exists)
            return null;
        return { id: buyerDoc.id, ...buyerDoc.data() };
    }
    catch (error) {
        console.error('Error getting buyer:', error);
        return null;
    }
}
export async function listBuyers() {
    try {
        const snapshot = await adminDb.collection('buyers').where('isActive', '==', true).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error listing buyers:', error);
        return [];
    }
}
export async function createBuyer(buyerData) {
    try {
        const buyerRef = adminDb.collection('buyers').doc();
        const newBuyer = {
            ...buyerData,
            id: buyerRef.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await buyerRef.set(newBuyer);
        return { ...newBuyer, id: buyerRef.id };
    }
    catch (error) {
        console.error('Error creating buyer:', error);
        return null;
    }
}
export async function updateBuyer(id, updates) {
    try {
        const buyerRef = adminDb.collection('buyers').doc(id);
        await buyerRef.update({
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        const updatedDoc = await buyerRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    }
    catch (error) {
        console.error('Error updating buyer:', error);
        return null;
    }
}
// Rug helper functions
export async function getAllRugs() {
    const snapshot = await adminDb.collection('rugs').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function getRugsByUser(userId) {
    const snapshot = await adminDb.collection('rugs').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function getRugById(rugId) {
    const doc = await adminDb.collection('rugs').doc(rugId).get();
    if (!doc.exists)
        return null;
    return { id: doc.id, ...doc.data() };
}
export async function createRug(rugData) {
    const docRef = await adminDb.collection('rugs').add({
        ...rugData,
        created_at: new Date(),
        updated_at: new Date()
    });
    const newDoc = await docRef.get();
    return { id: newDoc.id, ...newDoc.data() };
}
export async function updateRug(rugId, updateData) {
    await adminDb.collection('rugs').doc(rugId).update({
        ...updateData,
        updated_at: new Date()
    });
    const updatedDoc = await adminDb.collection('rugs').doc(rugId).get();
    if (!updatedDoc.exists)
        return null;
    return { id: updatedDoc.id, ...updatedDoc.data() };
}
export async function deleteRug(rugId) {
    await adminDb.collection('rugs').doc(rugId).delete();
}
// Add more helper functions as needed
