// client/src/lib/firebase.ts
// Mock Firebase implementation for demo purposes
console.log('Using mock Firebase implementation for demo');

// Mock auth object
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    // Simulate logged in user for demo
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

// Mock firestore object
export const firestore = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => ({ exists: true, data: () => ({}) }),
      set: async (data: any) => Promise.resolve(),
      update: async (data: any) => Promise.resolve(),
      delete: async () => Promise.resolve()
    }),
    add: async (data: any) => ({ id: 'demo-doc-id' }),
    get: async () => ({ docs: [] }),
    where: () => ({
      get: async () => ({ docs: [] })
    })
  })
};

// Mock storage object
export const storage = {
  ref: (path: string) => ({
    put: async (file: any) => ({ ref: { getDownloadURL: async () => 'demo-url' } }),
    getDownloadURL: async () => 'demo-url'
  })
};

// Mock Google provider
export const googleProvider = {};

// Export db alias for firestore
export const db = firestore;
