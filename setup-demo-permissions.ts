#!/usr/bin/env tsx
/**
 * Demo script to set up sample user permissions for RBAC testing
 * This creates example users with different permission levels
 */

import { adminDb } from './server/firestoreHelpers';

// Demo user permissions data
const demoPermissions = [
  // Admin User - Full access
  {
    id: 'admin-perm-1',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2', // abdulansari@easternmills.com
    tab_id: 'sampling-create',
    department_id: 'sampling',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-perm-2',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2',
    tab_id: 'sampling-gallery',
    department_id: 'sampling',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-perm-3',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2',
    tab_id: 'sampling-inspection',
    department_id: 'sampling',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-perm-4',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2',
    tab_id: 'merchandising-buyers',
    department_id: 'merchandising',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-perm-5',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2',
    tab_id: 'merchandising-quotes',
    department_id: 'merchandising',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-perm-6',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2',
    tab_id: 'merchandising-pdoc',
    department_id: 'merchandising',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-perm-7',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2',
    tab_id: 'quality-lab',
    department_id: 'quality',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-perm-8',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2',
    tab_id: 'quality-compliance',
    department_id: 'quality',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-perm-9',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2',
    tab_id: 'quality-dashboard',
    department_id: 'quality',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-perm-10',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2',
    tab_id: 'admin-users',
    department_id: 'admin',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-perm-11',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2',
    tab_id: 'admin-permissions',
    department_id: 'admin',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-perm-12',
    user_id: 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2',
    tab_id: 'admin-system',
    department_id: 'admin',
    permission: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },

  // Sampling User - Edit access to sampling only
  {
    id: 'sampling-perm-1',
    user_id: 'sc4GFkWFTmTfYaPiO58XKaQtsYw2', // danishsampling.eastern@gmail.com
    tab_id: 'sampling-create',
    department_id: 'sampling',
    permission: 'edit',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'sampling-perm-2',
    user_id: 'sc4GFkWFTmTfYaPiO58XKaQtsYw2',
    tab_id: 'sampling-gallery',
    department_id: 'sampling',
    permission: 'edit',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'sampling-perm-3',
    user_id: 'sc4GFkWFTmTfYaPiO58XKaQtsYw2',
    tab_id: 'sampling-inspection',
    department_id: 'sampling',
    permission: 'view',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },

  // Quality User - View access to quality only
  {
    id: 'quality-perm-1',
    user_id: 'HeFMPeAqsnhoaSyQlIGYuxre4G63', // faizanansari05100@gmail.com
    tab_id: 'quality-lab',
    department_id: 'quality',
    permission: 'edit',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'quality-perm-2',
    user_id: 'HeFMPeAqsnhoaSyQlIGYuxre4G63',
    tab_id: 'quality-dashboard',
    department_id: 'quality',
    permission: 'view',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

async function setupDemoPermissions() {
  try {
    console.log('🚀 Setting up demo RBAC permissions...');

    // Clear existing permissions
    console.log('🧹 Clearing existing demo permissions...');
    const existingSnapshot = await adminDb.collection('userTabPermissions').get();
    const batch = adminDb.batch();
    
    existingSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✓ Cleared ${existingSnapshot.size} existing permissions`);

    // Create new permissions
    console.log('📝 Creating new demo permissions...');
    const createBatch = adminDb.batch();
    
    for (const permission of demoPermissions) {
      const docRef = adminDb.collection('userTabPermissions').doc(permission.id);
      createBatch.set(docRef, permission);
    }
    
    await createBatch.commit();
    console.log(`✓ Created ${demoPermissions.length} demo permissions`);

    // Summary
    console.log('\n📊 Demo Permissions Summary:');
    console.log('👑 Admin User (abdulansari@easternmills.com): Full access to all departments');
    console.log('🔨 Sampling User (danishsampling.eastern@gmail.com): Edit access to sampling');
    console.log('🔍 Quality User (faizanansari05100@gmail.com): View/Edit access to quality lab');

    console.log('\n✅ Demo RBAC permissions setup complete!');
    console.log('🎯 Users can now be tested with different permission levels');

  } catch (error) {
    console.error('❌ Error setting up demo permissions:', error);
    throw error;
  }
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDemoPermissions()
    .then(() => {
      console.log('\n🎉 Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}