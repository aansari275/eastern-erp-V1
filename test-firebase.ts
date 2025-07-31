import db from './server/firebaseAdmin.js';

async function testConnection() {
  try {
    if (!db) {
      console.log('❌ Firebase Admin not initialized');
      console.log('💡 Solutions:');
      console.log('   1. Download service account key from Firebase Console');
      console.log('   2. Save as server/serviceAccountKey.json');
      console.log('   3. Or set environment variables (see VERCEL_ENV_VARS.md)');
      return;
    }
    
    console.log('🔍 Testing Firestore connection...');
    
    // Test basic connection
    const testRef = db.collection('test').doc('connection-test');
    await testRef.set({ timestamp: new Date().toISOString(), test: true });
    console.log('✅ Write test successful');
    
    // Test reading
    const snapshot = await testRef.get();
    if (snapshot.exists) {
      console.log('✅ Read test successful');
      console.log('Data:', snapshot.data());
    }
    
    // Test rugs collection
    console.log('🔍 Testing rugs collection...');
    const rugsSnapshot = await db.collection('rugs').limit(5).get();
    console.log(`📋 Found ${rugsSnapshot.size} rugs in database`);
    
    rugsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${doc.id}: ${data.designName || 'No name'}`);
    });
    
    // Clean up test document
    await testRef.delete();
    console.log('🧹 Cleaned up test document');
    
    console.log('🎉 Firebase connection test completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message);
    console.log('🔧 Debug info:');
    console.log('   Error type:', error.constructor.name);
    console.log('   Error code:', error.code || 'No code');
    
    if (error.message.includes('credentials')) {
      console.log('💡 This looks like a credentials issue');
      console.log('   Please check your service account key or environment variables');
    }
  }
}

testConnection();