// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBMDgfMGjY7BDLqEMnrfVTOxHzpHKOeGvw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eastern-erp-2025.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eastern-erp-2025",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eastern-erp-2025.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "399687000927",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:399687000927:web:YOUR_APP_ID",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YOUR_MEASUREMENT_ID",
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