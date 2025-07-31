// client/src/lib/firebase.ts
// Hybrid Firebase - Real Auth + Mock Database
console.log('Using hybrid Firebase - real auth, mock database');

// Import real Firebase auth for Google sign-in
let realAuth: any = null;
let realGoogleProvider: any = null;

const initializeRealAuth = async () => {
  if (realAuth) return realAuth;
  
  try {
    const { initializeApp } = await import("firebase/app");
    const { getAuth, GoogleAuthProvider, signInWithPopup, signOut } = await import("firebase/auth");
    
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDvK8p3QXqZ5L2M9X8Y7N6T4R1S3W2E5Q9",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eastern-mills-erp.firebaseapp.com",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eastern-mills-erp",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eastern-mills-erp.appspot.com",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456789012",
    };

    console.log("Initializing real Firebase Auth for Google Sign-In");
    const app = initializeApp(firebaseConfig);
    realAuth = getAuth(app);
    realGoogleProvider = new GoogleAuthProvider();
    
    // Configure Google provider
    realGoogleProvider.addScope('email');
    realGoogleProvider.addScope('profile');
    
    return realAuth;
  } catch (error) {
    console.error("Failed to initialize real Firebase Auth:", error);
    // Fall back to mock if real auth fails
    return null;
  }
};

// Real auth object with Google sign-in
export const auth = {
  get currentUser() { 
    return realAuth?.currentUser || { uid: 'demo-user', email: 'demo@easternmills.com' };
  },
  onAuthStateChanged: async (callback: any) => {
    const authInstance = await initializeRealAuth();
    if (authInstance) {
      return authInstance.onAuthStateChanged(callback);
    } else {
      // Fallback to mock
      setTimeout(() => callback({ uid: 'demo-user', email: 'demo@easternmills.com' }), 100);
      return () => {};
    }
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    const authInstance = await initializeRealAuth();
    if (authInstance) {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      return signInWithEmailAndPassword(authInstance, email, password);
    } else {
      return { user: { uid: 'demo-user', email } };
    }
  },
  signInWithPopup: async () => {
    const authInstance = await initializeRealAuth();
    if (authInstance && realGoogleProvider) {
      const { signInWithPopup } = await import("firebase/auth");
      return signInWithPopup(authInstance, realGoogleProvider);
    } else {
      // Mock Google sign-in response
      return { 
        user: { 
          uid: 'google-' + Date.now(), 
          email: 'user@gmail.com',
          displayName: 'Google User',
          photoURL: 'https://via.placeholder.com/40'
        } 
      };
    }
  },
  signOut: async () => {
    const authInstance = await initializeRealAuth();
    if (authInstance) {
      const { signOut } = await import("firebase/auth");
      return signOut(authInstance);
    } else {
      return Promise.resolve();
    }
  },
  useDeviceLanguage: () => {}
};

// Real Firestore database
let realFirestore: any = null;

const initializeFirestore = async () => {
  if (realFirestore) return realFirestore;
  
  try {
    const { initializeApp } = await import("firebase/app");
    const { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, getDocs, query, where } = await import("firebase/firestore");
    
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDvK8p3QXqZ5L2M9X8Y7N6T4R1S3W2E5Q9",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eastern-mills-erp.firebaseapp.com",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eastern-mills-erp",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eastern-mills-erp.appspot.com",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456789012",
    };

    console.log("Initializing real Firestore database");
    // Use a different app name to avoid conflicts with auth
    const app = initializeApp(firebaseConfig, 'firestore-database-app');
    realFirestore = getFirestore(app);
    
    return realFirestore;
  } catch (error) {
    console.error("Failed to initialize Firestore:", error);
    return null;
  }
};

export const firestore = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => {
        const db = await initializeFirestore();
        if (db) {
          const { doc, getDoc } = await import("firebase/firestore");
          const docRef = doc(db, path, id);
          const docSnap = await getDoc(docRef);
          return {
            exists: docSnap.exists(),
            id: docSnap.id,
            data: () => docSnap.data()
          };
        } else {
          // Fallback to mock
          return { 
            exists: true, 
            id: id,
            data: () => ({ name: 'Demo Data', createdAt: new Date() }) 
          };
        }
      },
      set: async (data: any) => {
        const db = await initializeFirestore();
        if (db) {
          const { doc, setDoc } = await import("firebase/firestore");
          const docRef = doc(db, path, id);
          return setDoc(docRef, data);
        } else {
          console.log(`Mock Firestore: Setting data in ${path}/${id}:`, data);
          return Promise.resolve();
        }
      },
      update: async (data: any) => {
        const db = await initializeFirestore();
        if (db) {
          const { doc, updateDoc } = await import("firebase/firestore");
          const docRef = doc(db, path, id);
          return updateDoc(docRef, data);
        } else {
          console.log(`Mock Firestore: Updating data in ${path}/${id}:`, data);
          return Promise.resolve();
        }
      },
      delete: async () => {
        const db = await initializeFirestore();
        if (db) {
          const { doc, deleteDoc } = await import("firebase/firestore");
          const docRef = doc(db, path, id);
          return deleteDoc(docRef);
        } else {
          console.log(`Mock Firestore: Deleting ${path}/${id}`);
          return Promise.resolve();
        }
      }
    }),
    add: async (data: any) => {
      const db = await initializeFirestore();
      if (db) {
        const { collection, addDoc } = await import("firebase/firestore");
        const collectionRef = collection(db, path);
        const docRef = await addDoc(collectionRef, data);
        return { id: docRef.id };
      } else {
        console.log(`Mock Firestore: Adding to ${path}:`, data);
        return { id: 'demo-doc-' + Date.now() };
      }
    },
    get: async () => {
      const db = await initializeFirestore();
      if (db) {
        const { collection, getDocs } = await import("firebase/firestore");
        const collectionRef = collection(db, path);
        const querySnapshot = await getDocs(collectionRef);
        return {
          docs: querySnapshot.docs.map(doc => ({
            id: doc.id,
            data: () => doc.data()
          }))
        };
      } else {
        // Fallback to mock
        return { 
          docs: [
            { id: 'demo1', data: () => ({ name: 'Sample Item 1' }) },
            { id: 'demo2', data: () => ({ name: 'Sample Item 2' }) }
          ] 
        };
      }
    },
    where: (field: string, operator: string, value: any) => ({
      get: async () => {
        const db = await initializeFirestore();
        if (db) {
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const collectionRef = collection(db, path);
          const q = query(collectionRef, where(field, operator as any, value));
          const querySnapshot = await getDocs(q);
          return {
            docs: querySnapshot.docs.map(doc => ({
              id: doc.id,
              data: () => doc.data()
            }))
          };
        } else {
          // Fallback to mock
          return { 
            docs: [
              { id: 'demo1', data: () => ({ name: 'Filtered Item' }) }
            ] 
          };
        }
      }
    })
  })
};

// Mock storage
export const storage = {
  ref: (path: string) => ({
    put: async (file: any) => {
      console.log(`Mock Storage: Uploading to ${path}`);
      return { ref: { getDownloadURL: async () => 'https://demo-url.com/file.jpg' } };
    },
    getDownloadURL: async () => 'https://demo-url.com/file.jpg'
  })
};

// Alias for compatibility
export const db = firestore;

// Export Google provider for compatibility
export const googleProvider = {
  addScope: (scope: string) => {
    if (realGoogleProvider) {
      realGoogleProvider.addScope(scope);
    }
  }
};
