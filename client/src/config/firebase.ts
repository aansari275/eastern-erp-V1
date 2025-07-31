// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDusEUNGnevL8TlvAiBcfPK-O8fmHUyzVM",
  authDomain: "eastern-erp-v1.firebaseapp.com",
  projectId: "eastern-erp-v1",
  storageBucket: "eastern-erp-v1.firebasestorage.app",
  messagingSenderId: "613948062256",
  appId: "1:613948062256:web:e456c256967c8bca500bf5",
  measurementId: "G-11QFYDYV29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default { db, storage, auth };