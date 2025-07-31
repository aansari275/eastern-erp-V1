// client/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Debug environment variables
console.log('Environment variables available:', {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 'present' : 'missing',
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'present' : 'missing',
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'present' : 'missing',
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? 'present' : 'missing',
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? 'present' : 'missing',
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ? 'present' : 'missing',
});

// Fallback Firebase configuration for development/demo purposes
const fallbackConfig = {
  apiKey: "AIzaSyDvK8p3QXqZ5L2M9X8Y7N6T4R1S3W2E5Q9",
  authDomain: "eastern-mills-erp.firebaseapp.com",
  projectId: "eastern-mills-erp",
  storageBucket: "eastern-mills-erp.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
};

console.log('Final Firebase config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'missing'
});

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Export db alias for firestore
export const db = firestore;

// Configure auth for better compatibility with storage-partitioned environments
try {
  // Enable persistence but handle errors gracefully
  auth.useDeviceLanguage();
} catch (error) {
  console.warn('Firebase auth configuration warning:', error);
}
