// Mock Firebase config for demo purposes
console.log('Loading mock Firebase config - no initialization needed');

// Mock Firebase services
export const db = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => ({ 
        exists: true, 
        id: id,
        data: () => ({ name: 'Demo Data', createdAt: new Date() }) 
      }),
      set: async (data: any) => {
        console.log(`Mock Config Firebase: Setting data in ${path}/${id}:`, data);
        return Promise.resolve();
      },
      update: async (data: any) => {
        console.log(`Mock Config Firebase: Updating data in ${path}/${id}:`, data);
        return Promise.resolve();
      },
      delete: async () => {
        console.log(`Mock Config Firebase: Deleting ${path}/${id}`);
        return Promise.resolve();
      }
    }),
    add: async (data: any) => {
      console.log(`Mock Config Firebase: Adding to ${path}:`, data);
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

export const storage = {
  ref: (path: string) => ({
    put: async (file: any) => {
      console.log(`Mock Config Storage: Uploading to ${path}`);
      return { ref: { getDownloadURL: async () => 'https://demo-url.com/file.jpg' } };
    },
    getDownloadURL: async () => 'https://demo-url.com/file.jpg'
  })
};

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
  }
};

export const analytics = null;

export default { db, storage, auth };