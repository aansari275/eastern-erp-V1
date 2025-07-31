import { User, Department, UserTabPermission, Buyer } from '@shared/schema';
import db from './firebaseAdmin.js';

// Use the properly initialized Firestore instance
export const adminDb = db;

// User operations
export async function getUserById(id: string): Promise<User | null> {
  try {
    const userDoc = await adminDb.collection('users').doc(id).get();
    if (!userDoc.exists) return null;
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
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
        foundUser = { id: doc.id, ...data } as User;
        console.log('✅ Found matching user:', doc.id);
      }
    });
    
    return foundUser;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}



export async function createUser(userData: Partial<User>): Promise<User | null> {
  try {
    const userRef = adminDb.collection('users').doc();
    const newUser = {
      ...userData,
      id: userRef.id,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    await userRef.set(newUser);
    return { ...newUser, id: userRef.id, created_at: new Date(), updated_at: new Date() } as User;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const userRef = adminDb.collection('users').doc(id);
    await userRef.update({
      ...updates,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    const updatedDoc = await userRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as User;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

export async function listUsers(departmentId?: string): Promise<User[]> {
  try {
    let queryRef = adminDb.collection('users');
    if (departmentId) {
      queryRef = queryRef.where('department_id', '==', departmentId) as any;
    }
    const snapshot = await queryRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  }
}

// Department operations
export async function getDepartmentById(id: string): Promise<Department | null> {
  try {
    const deptDoc = await adminDb.collection('departments').doc(id).get();
    if (!deptDoc.exists) return null;
    return { id: deptDoc.id, ...deptDoc.data() } as Department;
  } catch (error) {
    console.error('Error getting department:', error);
    return null;
  }
}

export async function listDepartments(): Promise<Department[]> {
  try {
    const snapshot = await adminDb.collection('departments').where('is_active', '==', true).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
  } catch (error) {
    console.error('Error listing departments:', error);
    return [];
  }
}

export async function getDepartmentTabs(departmentId: string) {
  try {
    const snapshot = await adminDb
      .collection('departmentTabs')
      .where('department_id', '==', departmentId)
      .where('is_active', '==', true)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting department tabs:', error);
    return [];
  }
}

// Permission operations
export async function getUserPermissions(userId: string): Promise<UserTabPermission[]> {
  try {
    const snapshot = await adminDb.collection('userTabPermissions')
      .where('user_id', '==', userId)
      .where('is_active', '==', true)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserTabPermission));
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

export async function getPermissionsForRole(role: string): Promise<string[]> {
  // Define role-based permissions
  const rolePermissions: Record<string, string[]> = {
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
export async function getBuyerById(id: string): Promise<Buyer | null> {
  try {
    const buyerDoc = await adminDb.collection('buyers').doc(id).get();
    if (!buyerDoc.exists) return null;
    return { id: buyerDoc.id, ...buyerDoc.data() } as Buyer;
  } catch (error) {
    console.error('Error getting buyer:', error);
    return null;
  }
}

export async function listBuyers(): Promise<Buyer[]> {
  try {
    const snapshot = await adminDb.collection('buyers').where('isActive', '==', true).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Buyer));
  } catch (error) {
    console.error('Error listing buyers:', error);
    return [];
  }
}

export async function createBuyer(buyerData: Partial<Buyer>): Promise<Buyer | null> {
  try {
    const buyerRef = adminDb.collection('buyers').doc();
    const newBuyer = {
      ...buyerData,
      id: buyerRef.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await buyerRef.set(newBuyer);
    return { ...newBuyer, id: buyerRef.id } as Buyer;
  } catch (error) {
    console.error('Error creating buyer:', error);
    return null;
  }
}

export async function updateBuyer(id: string, updates: Partial<Buyer>): Promise<Buyer | null> {
  try {
    const buyerRef = adminDb.collection('buyers').doc(id);
    await buyerRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const updatedDoc = await buyerRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Buyer;
  } catch (error) {
    console.error('Error updating buyer:', error);
    return null;
  }
}

// Rug helper functions
export async function getAllRugs() {
  const snapshot = await adminDb.collection('rugs').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRugsByUser(userId: string) {
  const snapshot = await adminDb.collection('rugs').where('userId', '==', userId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRugById(rugId: string) {
  const doc = await adminDb.collection('rugs').doc(rugId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

export async function createRug(rugData: any) {
  // DEBUG: Check payload size and images
  const payloadSize = JSON.stringify(rugData).length;
  console.log(`📊 Creating rug - Payload size: ${(payloadSize / 1024).toFixed(2)}KB`);
  
  if (rugData.images) {
    const imageKeys = Object.keys(rugData.images);
    console.log(`🖼️ Images in payload: ${imageKeys.length} images`, imageKeys);
    imageKeys.forEach(key => {
      if (rugData.images[key]) {
        const imageSize = rugData.images[key].length;
        console.log(`   ${key}: ${(imageSize / 1024).toFixed(2)}KB`);
      }
    });
  }

  // Check total size before save
  if (payloadSize > 800 * 1024) { // 800KB warning
    console.warn(`⚠️ Large payload detected: ${(payloadSize / 1024).toFixed(2)}KB - may hit Firebase 1MB limit`);
  }

  const docRef = await adminDb.collection('rugs').add({
    ...rugData,
    created_at: new Date(),
    updated_at: new Date()
  });
  const newDoc = await docRef.get();
  console.log(`✅ Rug created successfully with ID: ${newDoc.id}`);
  return { id: newDoc.id, ...newDoc.data() };
}

export async function updateRug(rugId: string, updateData: any) {
  // DEBUG: Check payload size and images
  const payloadSize = JSON.stringify(updateData).length;
  console.log(`📊 Updating rug ${rugId} - Payload size: ${(payloadSize / 1024).toFixed(2)}KB`);
  
  if (updateData.images) {
    const imageKeys = Object.keys(updateData.images);
    console.log(`🖼️ Images in update: ${imageKeys.length} images`, imageKeys);
    imageKeys.forEach(key => {
      if (updateData.images[key]) {
        const imageSize = updateData.images[key].length;
        console.log(`   ${key}: ${(imageSize / 1024).toFixed(2)}KB`);
      }
    });
  }

  // Check total size before save
  if (payloadSize > 800 * 1024) { // 800KB warning
    console.warn(`⚠️ Large payload detected: ${(payloadSize / 1024).toFixed(2)}KB - may hit Firebase 1MB limit`);
  }

  await adminDb.collection('rugs').doc(rugId).update({
    ...updateData,
    updated_at: new Date()
  });
  const updatedDoc = await adminDb.collection('rugs').doc(rugId).get();
  if (!updatedDoc.exists) return null;
  console.log(`✅ Rug ${rugId} updated successfully`);
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

export async function deleteRug(rugId: string) {
  await adminDb.collection('rugs').doc(rugId).delete();
}

// Add more helper functions as needed