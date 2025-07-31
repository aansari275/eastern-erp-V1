import { pgTable, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

// Define the users table schema directly
const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  email: varchar('email').unique().notNull(),
  first_name: varchar('first_name'),
  last_name: varchar('last_name'),
  username: varchar('username'),
  department_id: varchar('department_id'),
  role: varchar('role'),
  isActive: boolean('isActive').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

async function setupAdminUser() {
  try {
    console.log('Setting up admin user in PostgreSQL...');
    
    // Create PostgreSQL client connection
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    const db = drizzle(client);
    
    // Create the users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        username VARCHAR(255),
        department_id VARCHAR(255),
        role VARCHAR(255),
        "isActive" BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create the admin user
    const adminUser = {
      email: 'abdulansari@easternmills.com',
      first_name: 'Abdul Rahim',
      last_name: 'Ansari',
      username: 'Abdul Rahim Ansari',
      department_id: 'admin',
      role: 'admin',
      isActive: true
    };

    // Insert or update admin user
    const result = await db.insert(users)
      .values({
        id: 'admin-user-001',
        ...adminUser
      })
      .onConflictDoUpdate({
        target: users.email,
        set: adminUser
      })
      .returning();

    console.log('✅ Admin user created/updated:', result[0]);
    
    // Also create a few sample users for testing
    const sampleUsers = [
      {
        id: 'lab-user-001',
        email: 'lab.easternmills@gmail.com',
        first_name: 'Lab',
        last_name: 'Technician',
        username: 'Lab Technician',
        department_id: 'quality',
        role: 'lab-technician',
        isActive: true
      },
      {
        id: 'sampling-user-001', 
        email: 'danishsampling.eastern@gmail.com',
        first_name: 'Danish',
        last_name: 'Sampling',
        username: 'Danish Sampling',
        department_id: 'sampling',
        role: 'sampling-manager',
        isActive: true
      }
    ];

    for (const user of sampleUsers) {
      const userResult = await db.insert(users)
        .values(user)
        .onConflictDoUpdate({
          target: users.email,
          set: user
        })
        .returning();
      console.log('✅ Sample user created/updated:', userResult[0].email);
    }

    console.log('✅ All users setup complete!');
    await client.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    process.exit(1);
  }
}

setupAdminUser();