// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyADeiIAY7CA5Y5rQbUacqKxtHR9zzQkvl0",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "rugcraftpro.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "rugcraftpro",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "rugcraftpro.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "874927345152",
  appId: process.env.FIREBASE_APP_ID || "1:874927345152:web:a9af4b96032d22095412e5",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-NDP0Z4H9KF",
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
  if (admin.apps.length === 0) {
    // Try to initialize with service account file first
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
    
    try {
      const serviceAccount = require(serviceAccountPath);
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
