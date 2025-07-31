import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let db: FirebaseFirestore.Firestore | null = null;

async function initializeFirebaseAdmin() {
  // Prevent multiple initializations
  if (getApps().length > 0) {
    console.log('✅ Firebase Admin already initialized');
    return getFirestore();
  }

  try {
    // Method 1: Try service account file first
    const serviceAccountPath = path.resolve('server/serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log('🔑 Using service account file...');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      const app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      console.log('✅ Firebase Admin initialized with service account file');
      return getFirestore(app);
    }
    
    // Method 2: Try Firebase Admin SDK JSON from Vercel
    if (process.env.Firebase_Admin_SDK) {
      console.log('🔑 Using Firebase Admin SDK from Vercel...');
      
      const serviceAccount = JSON.parse(process.env.Firebase_Admin_SDK);
      
      const app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      console.log('✅ Firebase Admin initialized with Vercel Firebase_Admin_SDK');
      return getFirestore(app);
    }
    
    // Method 3: Try environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      console.log('🔑 Using environment variables...');
      
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      };
      
      const app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId
      });
      
      console.log('✅ Firebase Admin initialized with environment variables');
      return getFirestore(app);
    }
    
    // Method 4: Try service account JSON from environment
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      console.log('🔑 Using service account JSON from environment...');
      
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      
      const app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      console.log('✅ Firebase Admin initialized with environment JSON');
      return getFirestore(app);
    }
    
    throw new Error('No Firebase credentials found. Please provide serviceAccountKey.json or environment variables.');
    
  } catch (error: any) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.log('💡 To fix this:');
    console.log('   1. Download service account key from Firebase Console');
    console.log('   2. Save as server/serviceAccountKey.json');
    console.log('   3. Or set environment variables (see VERCEL_ENV_VARS.md)');
    return null;
  }
}

// Initialize on module load
db = await initializeFirebaseAdmin();

export default db;