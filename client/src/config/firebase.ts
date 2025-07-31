// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDusEUNGnevL8TlvAiBcfPK-O8fmHUyzVM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eastern-erp-v1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eastern-erp-v1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eastern-erp-v1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "613948062256",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:613948062256:web:e456c256967c8bca500bf5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-11QFYDYV29",
};

// Initialize Firebase - check if app already exists to prevent duplicate app error
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;