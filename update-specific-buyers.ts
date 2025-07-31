import { FirebaseStorage } from './server/firebaseStorage';

async function updateSpecificBuyers() {
  console.log('🔧 Updating specific buyers to match ERP codes...\n');

  try {
    const firebaseStorage = new FirebaseStorage();
    
    // Get a few specific buyers and update them manually
    const buyers = await firebaseStorage.getBuyers();
    
    // Find specific buyers that should match ERP codes
    const targetUpdates = [
      { name: 'A-07', newCode: 'A-07' },
      { name: 'C-04', newCode: 'C-04' },
      { name: 'C-05', newCode: 'C-05' },
      { name: 'CASA', newCode: 'CASA' },
      { name: 'ROMO', newCode: 'ROMO' },
    ];

    let updated = 0;
    
    for (const update of targetUpdates) {
      const buyer = buyers.find(b => b.name === update.name);
      if (buyer) {
        console.log(`Updating buyer "${buyer.name}" (ID: ${buyer.id}) with code: "${update.newCode}"`);
        
        // Direct Firebase update
        try {
          const result = await firebaseStorage.updateBuyer(buyer.id, {
            buyerCode: update.newCode
          });
          
          if (result) {
            console.log(`✅ Successfully updated buyer "${buyer.name}" with code "${update.newCode}"`);
            updated++;
          } else {
            console.log(`❌ Failed to update buyer "${buyer.name}"`);
          }
        } catch (error) {
          console.error(`❌ Error updating buyer "${buyer.name}":`, error);
        }
      } else {
        console.log(`⚠️  Buyer "${update.name}" not found`);
      }
    }

    // Verify updates
    console.log('\n🔍 Verifying updates...');
    const updatedBuyers = await firebaseStorage.getBuyers();
    
    for (const update of targetUpdates) {
      const buyer = updatedBuyers.find(b => b.name === update.name);
      if (buyer) {
        console.log(`   "${buyer.name}": buyerCode = "${buyer.buyerCode}"`);
      }
    }

    console.log(`\n📊 Summary: ${updated}/${targetUpdates.length} buyers updated successfully`);

  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  }
}

// Run update automatically
updateSpecificBuyers()
  .then(() => {
    console.log('\n🎉 Specific buyer updates completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Update failed:', error);
    process.exit(1);
  });

export { updateSpecificBuyers };