// Test Firebase article numbers data directly
import { firebaseStorage } from './server/firebaseStorage';

async function checkFirebaseArticles() {
  console.log('🔍 Checking Firebase article numbers data...\n');
  
  try {
    // Get buyers first
    const buyers = await firebaseStorage.getBuyers();
    console.log(`Found ${buyers.length} total buyers\n`);
    
    // Find imported buyers
    const importedBuyers = buyers.filter(b => 
      ['A-02', 'A-07', 'C-04', 'C-05', 'CASA', 'CH-01'].includes(b.code)
    );
    
    console.log('Checking imported buyers:');
    importedBuyers.slice(0, 3).forEach(buyer => {
      console.log(`- ${buyer.name} (${buyer.code})`);
    });
    
    if (importedBuyers.length > 0) {
      const firstBuyer = importedBuyers[0];
      console.log(`\n📋 Getting article numbers for: ${firstBuyer.name} (${firstBuyer.code})`);
      
      const articles = await firebaseStorage.getArticleNumbers({ buyerId: firstBuyer.id });
      console.log(`Found ${articles.length} article numbers for this buyer\n`);
      
      if (articles.length > 0) {
        console.log('Sample article numbers with design details:');
        articles.slice(0, 5).forEach((article, index) => {
          console.log(`${index + 1}. Design: "${article.designName}"`);
          console.log(`   Color: "${article.color}"`);
          console.log(`   Size: "${article.size}"`);
          console.log(`   Construction: "${article.construction}"`);
          console.log(`   Article Code: "${article.articleNumber}" (manual entry)`);
          console.log('');
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkFirebaseArticles();