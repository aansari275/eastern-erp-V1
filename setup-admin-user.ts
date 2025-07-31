import { db } from './server/db';
import { users, userTabPermissions } from './shared/schema';
import { v4 as uuidv4 } from 'uuid';

async function setupAdminUser() {
  console.log('Setting up admin user...');

  const adminUserId = uuidv4();
  
  // Create admin user
  await db.insert(users).values({
    id: adminUserId,
    email: 'abdulansari@easternmills.com',
    firstName: 'Abdul',
    lastName: 'Ansari',
    departmentId: 'admin',
    isActive: true,
    hasLoggedIn: false,
  }).onConflictDoNothing();

  // Give admin full access to all admin tabs
  const adminTabs = ['user-management', 'permissions', 'system-settings'];
  
  for (const tabId of adminTabs) {
    await db.insert(userTabPermissions).values({
      userId: adminUserId,
      departmentId: 'admin',
      tabId: tabId,
      permission: 'edit',
      isActive: true,
    }).onConflictDoNothing();
  }

  console.log('✅ Admin user setup complete!');
  process.exit(0);
}

setupAdminUser().catch(console.error);