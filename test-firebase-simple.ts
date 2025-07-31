// Simple test to check Firebase connectivity
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADeiIAY7CA5Y5rQbUacqKxtHR9zzQkvl0",
  authDomain: "rugcraftpro.firebaseapp.com",
  projectId: "rugcraftpro",
  storageBucket: "rugcraftpro.firebasestorage.app",
  messagingSenderId: "874927345152",
  appId: "1:874927345152:web:a9af4b96032d22095412e5",
  measurementId: "G-NDP0Z4H9KF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    console.log('Testing Firebase connection with client SDK...');
    
    const rugsRef = collection(db, 'rugs');
    const snapshot = await getDocs(rugsRef);
    
    console.log(`✅ Successfully connected to Firebase!`);
    console.log(`Found ${snapshot.size} rugs in the collection`);
    
    snapshot.forEach(doc => {
      console.log(`Rug ${doc.id}:`, doc.data());
    });
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
  }
}

testFirebase();