// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDusEUNGnevL8TlvAiBcfPK-O8fmHUyzVM",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "eastern-erp-v1.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "eastern-erp-v1",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "eastern-erp-v1.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "613948062256",
  appId: process.env.FIREBASE_APP_ID || "1:613948062256:web:e456c256967c8bca500bf5",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-11QFYDYV29",
};

// Initialize Firebase Client (only if not already initialized)
import { getApps } from "firebase/app";

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
export const firestore = getFirestore(app);
export const db = firestore; // Alias for backward compatibility
export const storage = getStorage(app);

// Firebase Admin SDK for server-side operations
import * as admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK (server-side)
let adminApp: admin.app.App | null = null;

try {
  // Check if admin app is already initialized
  if (!admin.apps || admin.apps.length === 0) {
    // Try to initialize with service account file first
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './server/serviceAccountKey.json';
    
    try {
      // Use absolute path resolution
      const absolutePath = resolve(process.cwd(), serviceAccountPath);
      const serviceAccount = JSON.parse(readFileSync(absolutePath, 'utf8'));
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: firebaseConfig.projectId
      });
      console.log('✅ Firebase Admin initialized with service account file');
    } catch (fileError) {
      // Fallback to environment variable
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: firebaseConfig.projectId
        });
        console.log('✅ Firebase Admin initialized with environment variable');
      } else {
        console.log('⚠️ Firebase Admin initialization skipped - no credentials found');
        adminApp = null;
      }
    }
  } else {
    adminApp = admin.apps[0] as admin.app.App;
    console.log('✅ Firebase Admin already initialized');
  }
} catch (error: any) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  adminApp = null;
}

export { adminApp };
export const adminDb = adminApp ? getAdminFirestore(adminApp) : null;

console.log('✅ Firebase client initialized, Admin SDK:', adminApp ? 'enabled' : 'disabled');
