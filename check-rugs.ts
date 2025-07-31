// Import existing Firebase configuration
import { adminDb } from './server/firebase';

async function checkRugs() {
  try {
    console.log('🔍 Checking rugs in Firebase...\n');
    
    // Get all rugs
    const rugsSnapshot = await adminDb.collection('rugs').get();
    
    if (rugsSnapshot.empty) {
      console.log('❌ No rugs found in the database!');
      return;
    }
    
    console.log(`✅ Found ${rugsSnapshot.size} rugs in the database:\n`);
    
    // Display each rug
    rugsSnapshot.forEach((doc, index) => {
      const rugData = doc.data();
      console.log(`\n--- Rug ${index + 1} ---`);
      console.log(`ID: ${doc.id}`);
      console.log(`Article Number: ${rugData.articleNumber || 'N/A'}`);
      console.log(`Size: ${rugData.size || 'N/A'}`);
      console.log(`Quality: ${rugData.quality || 'N/A'}`);
      console.log(`Construction: ${rugData.construction || 'N/A'}`);
      console.log(`Color: ${rugData.color || 'N/A'}`);
      console.log(`Status: ${rugData.status || 'N/A'}`);
      console.log(`Created At: ${rugData.createdAt || 'N/A'}`);
      
      // Check for images
      if (rugData.images) {
        const imageCount = Object.keys(rugData.images).length;
        console.log(`Images: ${imageCount} image(s)`);
      } else {
        console.log(`Images: None`);
      }
    });
    
    // Also check if there's a specific collection for rug gallery
    console.log('\n\n🔍 Checking for rug gallery collection...');
    const gallerySnapshot = await adminDb.collection('rugGallery').get();
    
    if (!gallerySnapshot.empty) {
      console.log(`✅ Found ${gallerySnapshot.size} items in rugGallery collection`);
    } else {
      console.log('❌ No rugGallery collection found or it\'s empty');
    }
    
  } catch (error) {
    console.error('Error checking rugs:', error);
  }
}

checkRugs();