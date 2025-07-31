// client/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyADeiIAY7CA5Y5rQbUacqKxtHR9zzQkvl0",
  authDomain: "rugcraftpro.firebaseapp.com",
  projectId: "rugcraftpro",
  storageBucket: "rugcraftpro.appspot.com",
  messagingSenderId: "874927345152",
  appId: "1:874927345152:web:a9af4b96032d22095412e5",
  measurementId: "G-NDP0Z4H9KF",
};

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
