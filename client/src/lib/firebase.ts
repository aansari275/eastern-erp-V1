// client/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDvK8p3QXqZ5L2M9X8Y7N6T4R1S3W2E5Q9",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eastern-mills-erp.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eastern-mills-erp",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eastern-mills-erp.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456789012",
};

console.log("Firebase config loaded:", {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Export db alias for firestore
export const db = firestore;

// Configure auth
try {
  auth.useDeviceLanguage();
} catch (error) {
  console.warn('Firebase auth configuration warning:', error);
}
