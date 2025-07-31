import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  console.log('🔧 Initializing Firebase Admin with local service account...');
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'rugcraftpro'
  });
  console.log('✅ Firebase Admin initialized successfully for project: rugcraftpro');
}

const db = admin.firestore();

// Sample users for different departments
const departmentUsers = [
  // Sampling Department
  {
    id: 'sampling_manager_001',
    username: 'Sampling Manager',
    email: 'sampling.manager@easternmills.com',
    role: 'Manager',
    departmentId: 'sampling',
    departments: ['Sampling'],
    tier: 'Manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sampling_supervisor_001',
    username: 'Sampling Supervisor',
    email: 'sampling.supervisor@easternmills.com',
    role: 'Supervisor',
    departmentId: 'sampling',
    departments: ['Sampling'],
    tier: 'Supervisor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sampling_staff_001',
    username: 'Sampling Staff 1',
    email: 'sampling.staff1@easternmills.com',
    role: 'Staff',
    departmentId: 'sampling',
    departments: ['Sampling'],
    tier: 'Staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sampling_staff_002',
    username: 'Sampling Staff 2',
    email: 'sampling.staff2@easternmills.com',
    role: 'Staff',
    departmentId: 'sampling',
    departments: ['Sampling'],
    tier: 'Staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Designing Department
  {
    id: 'designing_manager_001',
    username: 'Design Manager',
    email: 'design.manager@easternmills.com',
    role: 'Manager',
    departmentId: 'designing',
    departments: ['Designing'],
    tier: 'Manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'designing_supervisor_001',
    username: 'Design Supervisor',
    email: 'design.supervisor@easternmills.com',
    role: 'Supervisor',
    departmentId: 'designing',
    departments: ['Designing'],
    tier: 'Supervisor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'designing_staff_001',
    username: 'CAD Designer 1',
    email: 'cad.designer1@easternmills.com',
    role: 'Staff',
    departmentId: 'designing',
    departments: ['Designing'],
    tier: 'Staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'designing_staff_002',
    username: 'Pattern Designer',
    email: 'pattern.designer@easternmills.com',
    role: 'Staff',
    departmentId: 'designing',
    departments: ['Designing'],
    tier: 'Staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Production Department
  {
    id: 'production_manager_001',
    username: 'Production Manager',
    email: 'production.manager@easternmills.com',
    role: 'Manager',
    departmentId: 'production',
    departments: ['Production'],
    tier: 'Manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'production_supervisor_001',
    username: 'Production Supervisor',
    email: 'production.supervisor@easternmills.com',
    role: 'Supervisor',
    departmentId: 'production',
    departments: ['Production'],
    tier: 'Supervisor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Additional Quality Department users
  {
    id: 'quality_manager_001',
    username: 'Quality Manager',
    email: 'quality.manager@easternmills.com',
    role: 'Manager',
    departmentId: 'quality',
    departments: ['Quality'],
    tier: 'Manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'quality_supervisor_001',
    username: 'Quality Supervisor',
    email: 'quality.supervisor@easternmills.com',
    role: 'Supervisor',
    departmentId: 'quality',
    departments: ['Quality'],
    tier: 'Supervisor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function createDepartmentUsers() {
  console.log('🔧 Creating department users in Firebase...');
  
  try {
    // Create users in Firebase using batch write
    const batch = db.batch();
    let createdCount = 0;
    
    for (const user of departmentUsers) {
      const userRef = db.collection('users').doc(user.id);
      batch.set(userRef, user);
      createdCount++;
      console.log(`📝 Adding user: ${user.username} (${user.email}) - ${user.departmentId}`);
    }
    
    await batch.commit();
    console.log(`✅ Successfully created ${createdCount} department users!`);
    
    // Group users by department for summary
    const groupedUsers = departmentUsers.reduce((acc, user) => {
      if (!acc[user.departmentId]) acc[user.departmentId] = [];
      acc[user.departmentId].push(`${user.username} (${user.tier})`);
      return acc;
    }, {} as Record<string, string[]>);
    
    console.log('\n📊 Users by Department:');
    Object.entries(groupedUsers).forEach(([dept, users]) => {
      console.log(`\n${dept.toUpperCase()}:`);
      users.forEach(user => console.log(`  ✓ ${user}`));
    });
    
    // Verify users were created
    console.log('\n🔍 Verifying user creation...');
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Total users in database: ${usersSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
}

// Run the script
createDepartmentUsers().then(() => {
  console.log('\n🎉 Script completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});