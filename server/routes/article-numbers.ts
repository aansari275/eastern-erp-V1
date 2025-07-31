import { Router, Request, Response } from 'express';
import { adminDb } from '../firestoreHelpers';
import { importArticleNumbersFromERP } from '../erpDatabase';

const router = Router();

// GET /api/article-numbers/counts - Get article count per buyer
router.get('/counts', async (req: Request, res: Response) => {
  try {
    console.log('🔍 API /api/article-numbers/counts called');
    
    // Get all article numbers
    const snapshot = await adminDb.collection('articleNumbers').get();
    const allArticleNumbers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Group by buyer and remove duplicates based on design+color+size+construction
    const buyerCounts: Record<string, number> = {};
    const seenCombinations = new Map<string, Set<string>>();
    
    for (const article of allArticleNumbers) {
      const buyerId = article.buyerId;
      
      // Create unique key for deduplication
      const uniqueKey = `${article.designName}-${article.color}-${article.size}-${article.construction}`.toLowerCase();
      
      if (!seenCombinations.has(buyerId)) {
        seenCombinations.set(buyerId, new Set());
      }
      
      if (!seenCombinations.get(buyerId)!.has(uniqueKey)) {
        seenCombinations.get(buyerId)!.add(uniqueKey);
        buyerCounts[buyerId] = (buyerCounts[buyerId] || 0) + 1;
      }
    }
    
    console.log(`📊 Calculated article counts for ${Object.keys(buyerCounts).length} buyers`);
    
    res.json(buyerCounts);
  } catch (error) {
    console.error('❌ Error calculating article counts:', error);
    res.status(500).json({ error: 'Failed to calculate article counts' });
  }
});

// Get all article numbers
router.get('/', async (req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection('articleNumbers').get();
    const articleNumbers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(articleNumbers);
  } catch (error) {
    console.error('Error fetching article numbers:', error);
    res.status(500).json({ error: 'Failed to fetch article numbers' });
  }
});

// Get article numbers by buyer ID
router.get('/buyer/:buyerId', async (req: Request, res: Response) => {
  try {
    const buyerId = req.params.buyerId;
    const snapshot = await adminDb.collection('articleNumbers').where('buyerId', '==', buyerId).get();
    const articleNumbers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(articleNumbers);
  } catch (error) {
    console.error('Error fetching article numbers by buyer:', error);
    res.status(500).json({ error: 'Failed to fetch article numbers by buyer' });
  }
});

// Import article numbers from ERP database
router.post('/import', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Starting article number import from ERP database...');
    
    // Fetch data from ERP database (vopslistdtl table with bo_id > 1614)
    const erpData = await importArticleNumbersFromERP();
    console.log(`📦 Found ${erpData.length} unique article number records from ERP`);
    
    if (erpData.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No article numbers found in ERP database',
        imported: 0,
        created: 0,
        skipped: 0
      });
    }
    
    // Get existing buyers to match buyer codes
    const buyersSnapshot = await adminDb.collection('buyers').get();
    const existingBuyers = buyersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const buyerMap = new Map();
    existingBuyers.forEach(buyer => {
      buyerMap.set(buyer.code, buyer.id);
    });
    
    console.log(`🔍 Found ${existingBuyers.length} existing buyers in database`);
    
    let importedCount = 0;
    let createdBuyersCount = 0;
    let skippedCount = 0;
    
    // Group by buyer code to track unique combinations
    const seenCombinations = new Set();
    
    for (const item of erpData) {
      try {
        const { buyerCode, construction, designName, color, size } = item;
        
        // Create unique key to avoid duplicates
        const uniqueKey = `${buyerCode}-${construction}-${designName}-${color}-${size}`;
        if (seenCombinations.has(uniqueKey)) {
          skippedCount++;
          continue;
        }
        seenCombinations.add(uniqueKey);
        
        // Check if buyer exists, create if not
        let buyerId = buyerMap.get(buyerCode);
        
        if (!buyerId) {
          console.log(`👤 Creating new buyer: ${buyerCode}`);
          const newBuyerRef = await adminDb.collection('buyers').add({
            name: buyerCode, // Will be updated manually later
            code: buyerCode,
            merchantId: 'import@easternmills.com', // Default merchant
            currency: 'USD',
            isActive: true
          });
          buyerId = newBuyerRef.id;
          buyerMap.set(buyerCode, buyerId);
          createdBuyersCount++;
        }
        
        // Create article number with empty article_number field for manual entry
        await adminDb.collection('articleNumbers').add({
          buyerId: buyerId,
          rugId: null, // Will be linked manually later
          articleNumber: '', // Left blank for manual entry
          buyerArticleCode: '',
          designName: designName,
          color: color,
          size: size,
          construction: construction,
          quality: '', // Can be filled manually
          unitPrice: null,
          currency: 'USD',
          leadTime: '',
          minimumOrder: null,
          notes: `Imported from ERP - Buyer: ${buyerCode}`,
          isActive: true
        });
        
        importedCount++;
        
        if (importedCount % 50 === 0) {
          console.log(`📈 Progress: ${importedCount} article numbers imported...`);
        }
        
      } catch (itemError) {
        console.error(`❌ Error processing item ${item.buyerCode}:`, itemError);
        skippedCount++;
      }
    }
    
    console.log(`✅ Import completed successfully!`);
    console.log(`📊 Summary: ${importedCount} imported, ${createdBuyersCount} buyers created, ${skippedCount} skipped`);
    
    res.json({
      success: true,
      message: 'Article numbers imported successfully',
      imported: importedCount,
      created: createdBuyersCount,
      skipped: skippedCount,
      total: erpData.length
    });
    
  } catch (error) {
    console.error('❌ Error importing article numbers:', error);
    res.status(500).json({ 
      error: 'Failed to import article numbers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new article number
router.post('/', async (req: Request, res: Response) => {
  try {
    const docRef = await adminDb.collection('articleNumbers').add(req.body);
    const newDoc = await docRef.get();
    res.status(201).json({ id: newDoc.id, ...newDoc.data() });
  } catch (error) {
    console.error('Error creating article number:', error);
    res.status(500).json({ error: 'Failed to create article number' });
  }
});

// Update article number
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const docRef = adminDb.collection('articleNumbers').doc(id);
    await docRef.update(req.body);
    const updatedDoc = await docRef.get();
    if (!updatedDoc.exists) {
      return res.status(404).json({ error: 'Article number not found' });
    }
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating article number:', error);
    res.status(500).json({ error: 'Failed to update article number' });
  }
});

// Delete article number
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const docRef = adminDb.collection('articleNumbers').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Article number not found' });
    }
    await docRef.delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting article number:', error);
    res.status(500).json({ error: 'Failed to delete article number' });
  }
});

export default router;