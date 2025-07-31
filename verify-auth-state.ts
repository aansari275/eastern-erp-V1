// Verify authentication state and user document matching
import { adminDb } from './server/firestoreHelpers';

async function verifyAuthState() {
  try {
    console.log('🔍 Verifying authentication state...');
    
    // Check all users in Firestore
    const usersRef = adminDb.collection('users');
    const usersSnapshot = await usersRef.get();
    
    console.log(`Found ${usersSnapshot.size} users in Firestore:`);
    
    let adminUser = null;
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\nUser ${doc.id}:`);
      console.log(`  Email: ${data.Email || data.email}`);
      console.log(`  Role: ${data.Role || data.role}`);
      console.log(`  DepartmentId: ${data.DepartmentId || data.department_id}`);
      console.log(`  isActive: ${data.isActive || data.is_active}`);
      
      if (data.Email === 'abdulansari@easternmills.com' || data.email === 'abdulansari@easternmills.com') {
        adminUser = { id: doc.id, ...data };
        console.log(`  ✅ THIS IS THE TARGET ADMIN USER`);
      }
    });
    
    if (adminUser) {
      console.log('\n📋 Admin User Details:');
      console.log(`  Document ID: ${adminUser.id}`);
      console.log(`  Email: ${adminUser.Email || adminUser.email}`);
      console.log(`  Role: ${adminUser.Role || adminUser.role}`);
      console.log(`  DepartmentId: ${adminUser.DepartmentId || adminUser.department_id}`);
      console.log(`  Has admin role: ${(adminUser.Role || adminUser.role) === 'admin'}`);
      console.log(`  Has admin dept: ${(adminUser.DepartmentId || adminUser.department_id) === 'admin'}`);
    } else {
      console.log('\n❌ Admin user not found in Firestore');
    }
    
    // Check permissions
    const permissionsRef = adminDb.collection('permissions');
    const permissionsSnapshot = await permissionsRef.get();
    
    console.log(`\n🔐 Found ${permissionsSnapshot.size} permissions:`);
    const adminPermissions = [];
    permissionsSnapshot.forEach((doc) => {
      const perm = doc.data();
      if (perm.RoleId === 'admin') {
        adminPermissions.push(`${perm.Action}-${perm.Collection}`);
      }
    });
    
    console.log(`Admin permissions: ${adminPermissions.join(', ')}`);
    
    const requiredPermissions = [
      'read-admin-users', 'write-admin-users',
      'read-users', 'write-users', 
      'read-permissions', 'write-permissions'
    ];
    
    const missingPermissions = requiredPermissions.filter(p => !adminPermissions.includes(p));
    if (missingPermissions.length === 0) {
      console.log('✅ All required admin permissions exist');
    } else {
      console.log(`❌ Missing permissions: ${missingPermissions.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error verifying auth state:', error);
  }
}

verifyAuthState()
  .then(() => {
    console.log('\n✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });