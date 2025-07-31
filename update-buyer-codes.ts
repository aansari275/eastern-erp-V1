import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/database',
});

// Buyer name to code mapping from the provided list
const buyerCodeMapping: { [key: string]: string } = {
  'ARSIN RIG': 'A-01',
  'ATELIER TORTIL': 'A-02',
  'AMPM': 'A-03',
  'ABC ITALIA': 'A-05',
  'ADORA': 'A-06',
  'BENUTA': 'B-02',
  'COURISTAN': 'C-01',
  'CC MILANO': 'C-02',
  'CLASSIC COLLECTION': 'C-03',
  'DESIGNER GUILD': 'D-01',
  'DESIGNER RUGS': 'D-02',
  'EDITION 1.6.9': 'E-01',
  'FERM LIVING': 'F-01',
  'FAYETTE STUDIO': 'F-02',
  'GRAN LIVING': 'G-01',
  'HAY': 'H-01',
  'ILVA': 'I-01',
  'JOHN LEWIS': 'J-01',
  'JACARANDA': 'J-02',
  'JAIPUR LIVING': 'J-03',
  'KAPETTO': 'K-01',
  'KAWAMOTO': 'K-02',
  'LULU & GEORGIA': 'L-01',
  'LOLOI': 'L-02',
  'LA-REDOUTE': 'L-03',
  'LIEWOOD': 'L-04',
  'MENU AS': 'M-01',
  'MUUTO': 'M-02',
  'MOHAWK HOME': 'M-03',
  'MIO': 'M-04',
  'MARINA RETAIL HOME': 'M-05',
  'MARC PHILIPS LA': 'M-06',
  'MARC PHILIPS NY': 'M-07',
  'MAHARAM': 'M-08',
  'MANZIL RUGS': 'M-09',
  'MOMINI': 'M-10',
  'MEHARBAN RUGS': 'M-11',
  'MARTIN PATRIC': 'M-12',
  'NOURISON': 'N-01',
  'NORDIC KNOTS': 'N-02',
  'NINE UNITED': 'N-03',
  'PETER PAGE': 'P-01',
  'POSL POTTEN': 'P-02',
  'RH': 'R-01',
  'RUSTA': 'R-02',
  'SOK': 'S-01',
  'STANTON': 'S-02',
  'SOHO HOME': 'S-03',
  'STARK': 'S-04',
  'SHIRR RUGS': 'S-05',
  'SOSTRENE GRENES': 'S-06',
  'THE RUG COLLECTION': 'T-01',
  'THE RUG ESTABLISHMENT': 'T-02',
  'VERY COOK': 'V-01',
  'ZARA': 'Z-01',
  'Son Tapis': 'S-07'
};

// Alternative name mappings for matching variations
const nameVariations: { [key: string]: string } = {
  'AM PM': 'AMPM',
  'Tortil': 'ATELIER TORTIL',
  'Loloi': 'LOLOI',
  'Peter Page': 'PETER PAGE',
  'Stark': 'STARK',
  'Maharban': 'MEHARBAN RUGS',
  'Tigmi Trading': '', // Not in the provided list
  'C C Milano': 'CC MILANO',
  'Kpetto': 'KAPETTO',
  'Kawamoto': 'KAWAMOTO',
  'Maharam': 'MAHARAM',
  'Designer Guild': 'DESIGNER GUILD',
  'Ferm Living': 'FERM LIVING',
  'Nordic Knots': 'NORDIC KNOTS',
  'Hay': 'HAY',
  'Sostrene': 'SOSTRENE GRENES',
  'Benuta': 'BENUTA',
  'Nourison': 'NOURISON',
  'Muuto': 'MUUTO',
  'Menu': 'MENU AS',
  'Momeni': 'MOMINI',
  'The Rug Establishment': 'THE RUG ESTABLISHMENT',
  'Jaipur Living': 'JAIPUR LIVING',
  'John Lewis': 'JOHN LEWIS',
  'Mohawk': 'MOHAWK HOME',
  'RH': 'RH',
  'Couristan': 'COURISTAN',
  'COACH HOUSE': '', // Not in the provided list
  'Gran Living': 'GRAN LIVING',
  'Stanton': 'STANTON',
  'Shir': 'SHIRR RUGS',
  'Edition': 'EDITION 1.6.9',
  'PAYATI STUDIO': '', // Not in the provided list
  'Lulu Georgia': 'LULU & GEORGIA',
  'TRC': 'THE RUG COLLECTION',
  'Soho Home': 'SOHO HOME',
  'Jacaranda': 'JACARANDA',
  'Zara': 'ZARA',
  'CB2': '', // Not in the provided list
  'ABC ITALIA': 'ABC ITALIA'
};

async function updateBuyerCodes() {
  try {
    console.log('🚀 Starting buyer code update...');
    
    // Get all current buyers
    const { rows: buyers } = await pool.query('SELECT id, name, code FROM buyers ORDER BY name');
    
    console.log(`📊 Found ${buyers.length} buyers to update`);
    
    let updated = 0;
    let cleared = 0;
    let unchanged = 0;
    
    for (const buyer of buyers) {
      const currentName = buyer.name;
      const currentCode = buyer.code;
      
      // Try to find the correct code
      let newCode = '';
      
      // First, try direct mapping
      if (buyerCodeMapping[currentName.toUpperCase()]) {
        newCode = buyerCodeMapping[currentName.toUpperCase()];
      }
      // Then try name variations mapping
      else if (nameVariations[currentName] && buyerCodeMapping[nameVariations[currentName]]) {
        newCode = buyerCodeMapping[nameVariations[currentName]];
      }
      // If not found, clear the code (set to empty string)
      
      if (newCode !== currentCode) {
        await pool.query(
          'UPDATE buyers SET code = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newCode, buyer.id]
        );
        
        if (newCode === '') {
          console.log(`🔄 Cleared code for: ${currentName} (was: ${currentCode})`);
          cleared++;
        } else {
          console.log(`✅ Updated: ${currentName} -> ${newCode} (was: ${currentCode})`);
          updated++;
        }
      } else {
        unchanged++;
      }
    }
    
    console.log('\n📈 Update Summary:');
    console.log(`✅ Updated with new codes: ${updated}`);
    console.log(`🔄 Cleared codes (not in list): ${cleared}`);
    console.log(`⚡ Unchanged: ${unchanged}`);
    console.log(`📊 Total processed: ${updated + cleared + unchanged}`);
    
    // Show updated buyers
    console.log('\n📋 Updated buyer list:');
    const { rows: updatedBuyers } = await pool.query(
      'SELECT name, code FROM buyers ORDER BY name'
    );
    
    updatedBuyers.forEach(buyer => {
      console.log(`${buyer.name}: ${buyer.code || '[NO CODE]'}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating buyer codes:', error);
  } finally {
    await pool.end();
  }
}

updateBuyerCodes();