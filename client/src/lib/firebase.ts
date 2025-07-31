// client/src/lib/firebase.ts
// Mock Firebase for demo purposes - no real database needed
console.log('Using mock Firebase for demo - no database connection required');

// Mock auth object that works without initialization
export const auth = {
  currentUser: { uid: 'demo-user', email: 'demo@easternmills.com' },
  onAuthStateChanged: (callback: any) => {
    // Simulate logged in user immediately
    setTimeout(() => callback({ uid: 'demo-user', email: 'demo@easternmills.com' }), 100);
    return () => {}; // unsubscribe function
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    return { user: { uid: 'demo-user', email } };
  },
  signOut: async () => {
    return Promise.resolve();
  },
  useDeviceLanguage: () => {}
};

// Mock firestore that simulates database operations
export const firestore = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => ({ 
        exists: true, 
        id: id,
        data: () => ({ name: 'Demo Data', createdAt: new Date() }) 
      }),
      set: async (data: any) => {
        console.log(`Mock Firestore: Setting data in ${path}/${id}:`, data);
        return Promise.resolve();
      },
      update: async (data: any) => {
        console.log(`Mock Firestore: Updating data in ${path}/${id}:`, data);
        return Promise.resolve();
      },
      delete: async () => {
        console.log(`Mock Firestore: Deleting ${path}/${id}`);
        return Promise.resolve();
      }
    }),
    add: async (data: any) => {
      console.log(`Mock Firestore: Adding to ${path}:`, data);
      return { id: 'demo-doc-' + Date.now() };
    },
    get: async () => ({ 
      docs: [
        { id: 'demo1', data: () => ({ name: 'Sample Item 1' }) },
        { id: 'demo2', data: () => ({ name: 'Sample Item 2' }) }
      ] 
    }),
    where: () => ({
      get: async () => ({ 
        docs: [
          { id: 'demo1', data: () => ({ name: 'Filtered Item' }) }
        ] 
      })
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

// Mock Google provider
export const googleProvider = {};
