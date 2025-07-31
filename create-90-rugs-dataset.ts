import db from './server/firebaseAdmin.js';

// Generate 90+ comprehensive rugs based on your schema
function generateRugsDataset() {
  const rugs = [];
  
  // Design patterns
  const designs = [
    'Traditional Persian Kashan', 'Modern Geometric Fusion', 'Classic Floral Heritage', 
    'Contemporary Abstract', 'Vintage Medallion Revival', 'Minimalist Nordic',
    'Oriental Paisley', 'Art Deco Revival', 'Tribal Kilim', 'French Aubusson',
    'Chinese Silk Road', 'Turkish Oushak', 'Indian Agra', 'Moroccan Berber',
    'Afghan Chobi', 'Pakistani Bokhara', 'Nepalese Tibetan', 'Russian Karastan',
    'Egyptian Mamluk', 'Spanish Colonial', 'Italian Renaissance', 'Greek Key Border',
    'Scandinavian Folk', 'American Southwest', 'Japanese Zen Garden', 'Korean Hanbok',
    'Thai Temple', 'Indonesian Batik', 'Celtic Knot', 'Byzantine Mosaic'
  ];
  
  // Quality types
  const qualities = [
    'Hand-knotted', 'Hand-tufted', 'Machine-made', 'Machine-tufted', 'Hand-woven',
    'Power-loomed', 'Flat-weave', 'Hand-hooked', 'Needlepoint', 'Axminster'
  ];
  
  // Construction types
  const constructions = [
    '80 KPSI', '100 KPSI', '120 KPSI', '150 KPSI', '180 KPSI', '200 KPSI', 
    '220 KPSI', '250 KPSI', '300 KPSI', '400 KPSI'
  ];
  
  // Buyers
  const buyers = [
    'Heritage Rugs International', 'Modern Living Solutions', 'Classic Carpets Limited',
    'Urban Interiors Inc', 'Prestige Home Furnishings', 'Nordic Design House',
    'Oriental Carpet Company', 'Luxury Floor Coverings', 'Designer Rugs Ltd',
    'Home Décor Specialists', 'Premium Textiles Inc', 'Global Carpets Network',
    'Elite Interior Solutions', 'Artisan Rug Gallery', 'Contemporary Living Co',
    'Traditional Crafts Ltd', 'Fine Floor Furnishings', 'Exclusive Carpets Inc',
    'Royal Rug Collection', 'Boutique Home Accents'
  ];
  
  // Colors
  const colorCombinations = [
    { primary: 'Deep Red', secondary: 'Navy Blue', full: 'Deep Red & Navy Blue' },
    { primary: 'Sky Blue', secondary: 'Pure White', full: 'Sky Blue & White Pattern' },
    { primary: 'Cream', secondary: 'Antique Gold', full: 'Cream & Gold Accents' },
    { primary: 'Charcoal Gray', secondary: 'Silver', full: 'Charcoal & Silver' },
    { primary: 'Deep Burgundy', secondary: 'Antique Ivory', full: 'Burgundy & Ivory' },
    { primary: 'Natural Beige', secondary: 'Pure White', full: 'Natural Beige & White' },
    { primary: 'Forest Green', secondary: 'Gold', full: 'Forest Green & Gold' },
    { primary: 'Sapphire Blue', secondary: 'Cream', full: 'Sapphire & Cream' },
    { primary: 'Rose Pink', secondary: 'Sage Green', full: 'Rose Pink & Sage' },
    { primary: 'Terracotta', secondary: 'Ivory', full: 'Terracotta & Ivory' },
    { primary: 'Midnight Black', secondary: 'Silver', full: 'Midnight Black & Silver' },
    { primary: 'Emerald Green', secondary: 'Gold', full: 'Emerald & Gold' }
  ];
  
  // Sizes
  const sizes = [
    { size: '4x6 ft', area: 2.23 },
    { size: '5x7 ft', area: 3.25 },
    { size: '6x8 ft', area: 4.46 },
    { size: '6x9 ft', area: 5.02 },
    { size: '8x10 ft', area: 7.43 },
    { size: '9x12 ft', area: 10.03 },
    { size: '10x14 ft', area: 13.01 },
    { size: '12x15 ft', area: 16.72 },
    { size: '5x8 ft', area: 3.72 },
    { size: '7x10 ft', area: 6.50 }
  ];
  
  // Material types
  const materials = [
    { name: 'Wool - Merino Premium', rate: 1200, type: 'warp' },
    { name: 'Wool - New Zealand', rate: 1400, type: 'warp' },
    { name: 'Wool - Himalayan Premium', rate: 1800, type: 'warp' },
    { name: 'Silk - Kashmiri Grade A', rate: 4500, type: 'warp' },
    { name: 'Cotton - Fine Grade', rate: 800, type: 'weft' },
    { name: 'Cotton - Extra Fine', rate: 900, type: 'weft' },
    { name: 'Polypropylene - Premium', rate: 850, type: 'warp' },
    { name: 'Nylon - Commercial Grade', rate: 950, type: 'warp' },
    { name: 'Jute - Natural Fiber', rate: 600, type: 'weft' },
    { name: 'Hemp Fiber', rate: 700, type: 'weft' }
  ];
  
  // Generate 90 rugs
  for (let i = 1; i <= 90; i++) {
    const baseId = 1752897730000 + (i * 1000); // Increment based on your existing pattern
    const design = designs[Math.floor(Math.random() * designs.length)];
    const quality = qualities[Math.floor(Math.random() * qualities.length)];
    const construction = constructions[Math.floor(Math.random() * constructions.length)];
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const colorCombo = colorCombinations[Math.floor(Math.random() * colorCombinations.length)];
    const sizeInfo = sizes[Math.floor(Math.random() * sizes.length)];
    
    // Select materials (1-3 materials per rug)
    const rugMaterials = [];
    const numMaterials = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numMaterials; j++) {
      const material = materials[Math.floor(Math.random() * materials.length)];
      rugMaterials.push({
        id: `mat-${i}-${j + 1}`,
        name: material.name,
        type: material.type,
        consumption: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
        rate: material.rate + Math.floor(Math.random() * 200 - 100),
        dyeingCost: Math.floor(Math.random() * 200 + 50),
        handSpinningCost: quality.includes('Hand') ? Math.floor(Math.random() * 300) : 0,
        costPerSqM: Math.round((Math.random() * 500 + 200) * 100) / 100,
        plyCount: Math.floor(Math.random() * 4) + 1,
        isDyed: Math.random() > 0.3,
        hasHandSpinning: quality.includes('Hand') && Math.random() > 0.4
      });
    }
    
    // Calculate costs
    const totalMaterialCost = rugMaterials.reduce((sum, mat) => sum + mat.costPerSqM, 0);
    const weavingCost = Math.floor(Math.random() * 400 + 200);
    const finishingCost = Math.floor(Math.random() * 200 + 100);
    const packingCost = Math.floor(Math.random() * 50 + 20);
    const totalDirectCost = totalMaterialCost + weavingCost + finishingCost + packingCost;
    const overheadPercentage = Math.floor(Math.random() * 10 + 10);
    const profitPercentage = Math.floor(Math.random() * 15 + 15);
    const finalCostPSM = totalDirectCost * (1 + overheadPercentage/100) * (1 + profitPercentage/100);
    const totalRugCost = finalCostPSM * sizeInfo.area;
    
    // Generate process flow
    const baseProcesses = [
      'Raw Material Purchase',
      'Dyeing',
      'Weaving',
      'Clipping',
      'Stretching',
      'Packing'
    ];
    
    const additionalProcesses = [
      'Hand Spinning', 'Washing', 'Faafi (Final Clipping)', 
      'Action Backing', 'Cotton Backing', 'Binding', 'Futki'
    ];
    
    const processFlow = baseProcesses.map((process, index) => ({
      process,
      step: index + 1
    }));
    
    // Add random additional processes
    const numAdditional = Math.floor(Math.random() * 4);
    for (let k = 0; k < numAdditional; k++) {
      const additionalProcess = additionalProcesses[Math.floor(Math.random() * additionalProcesses.length)];
      if (!processFlow.find(p => p.process === additionalProcess)) {
        processFlow.push({
          process: additionalProcess,
          step: processFlow.length + 1
        });
      }
    }
    
    // Create timestamp variations
    const baseDate = new Date('2025-01-01');
    const createdDate = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000));
    const updatedDate = new Date(createdDate.getTime() + (Math.random() * 5 * 24 * 60 * 60 * 1000));
    
    const rug = {
      // Core Identification
      id: baseId.toString(),
      designName: `${design} #${i.toString().padStart(3, '0')}`,
      construction: construction,
      quality: quality,
      color: colorCombo.full,
      primaryColor: colorCombo.primary,
      secondaryColor: colorCombo.secondary,
      selectedColors: [colorCombo.primary, colorCombo.secondary, 'Accent Color 1', 'Accent Color 2'].slice(0, Math.floor(Math.random() * 3) + 2),
      orderType: ['Custom Order', 'Standard Production', 'Luxury Collection', 'Commercial Contract'][Math.floor(Math.random() * 4)],
      buyerName: buyer,
      opsNo: `OPS-2025-${i.toString().padStart(3, '0')}`,
      carpetNo: `${buyer.split(' ')[0].toUpperCase()}-${i.toString().padStart(3, '0')}`,
      
      // GSM & Measurements
      finishedGSM: Math.floor(Math.random() * 2000 + 2000),
      unfinishedGSM: Math.floor(Math.random() * 1800 + 1800),
      pileGSM: Math.floor(Math.random() * 1000 + 1200),
      size: sizeInfo.size,
      area: sizeInfo.area,
      
      // Production Details
      typeOfDyeing: ['Natural Dyes', 'Synthetic Dyes', 'Natural & Synthetic Mix', 'Solution Dyed', 'Undyed Natural'][Math.floor(Math.random() * 5)],
      contractorType: Math.random() > 0.6 ? 'contractor' : 'inhouse',
      contractorName: Math.random() > 0.6 ? `Contractor ${i}` : '',
      weaverName: `Weaver Team ${String.fromCharCode(65 + (i % 26))}`,
      submittedBy: ['Sampling Team', 'Quality Control', 'Design Department', 'Production Manager'][Math.floor(Math.random() * 4)],
      washingContractor: Math.random() > 0.5 ? `Wash House ${i % 10 + 1}` : '',
      hasWashing: Math.random() > 0.4 ? 'yes' : 'no',
      
      // Technical Specifications
      warpIn6Inches: Math.floor(Math.random() * 30 + 30),
      weftIn6Inches: Math.floor(Math.random() * 30 + 32),
      pileHeightMM: Math.round((Math.random() * 6 + 4) * 10) / 10,
      totalThicknessMM: Math.round((Math.random() * 8 + 7) * 10) / 10,
      edgeLongerSide: Math.random() > 0.5 ? 'Loom Binding' : 'Binding',
      edgeShortSide: ['Fringes', 'Binding', 'Hem'][Math.floor(Math.random() * 3)],
      fringesHemLength: Math.random() > 0.5 ? `${Math.floor(Math.random() * 4 + 2)} inches` : '',
      fringesHemMaterial: Math.random() > 0.5 ? ['Cotton', 'Silk', 'Wool', 'Polyester'][Math.floor(Math.random() * 4)] : '',
      shadeCardNo: `SC-${i.toString().padStart(3, '0')}-2025`,
      reedNoQuality: `Reed ${Math.floor(Math.random() * 8 + 12)}/2`,
      
      // Materials & Costing
      materials: rugMaterials,
      weavingCost: weavingCost,
      finishingCost: finishingCost,
      packingCost: packingCost,
      overheadPercentage: overheadPercentage,
      profitPercentage: profitPercentage,
      totalMaterialCost: Math.round(totalMaterialCost * 100) / 100,
      totalDirectCost: Math.round(totalDirectCost * 100) / 100,
      finalCostPSM: Math.round(finalCostPSM * 100) / 100,
      totalRugCost: Math.round(totalRugCost * 100) / 100,
      
      // Process & Currency
      processFlow: processFlow,
      unit: 'PSM',
      currency: 'INR',
      exchangeRate: 83.25 + Math.random() * 2 - 1, // Small variation
      
      // Images & Documentation (using existing image paths for first 6, placeholders for others)
      images: i <= 6 ? {
        rugImage1: `/uploads/rugs/${[1752897730251, 1752899966131, 1752901115713, 1752902133647, 1752903935427, 1753165676640][i-1]}/rugImage1.jpg`,
        frontPhoto: `/uploads/rugs/${[1752897730251, 1752899966131, 1752901115713, 1752902133647, 1752903935427, 1753165676640][i-1]}/rugImage1.jpg`,
        shadeCard: '',
        backPhoto: '',
        masterHank: '',
        masterSample: ''
      } : {
        rugImage1: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EACIQAAIBAwQCAwAAAAAAAAAAAAECAAMRIQQSMRNBUWGB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAXEQEBAQEAAAAAAAAAAAAAAAABAAIR/9oADAMBAAIRAxEAPwDraUpSClKUApSlAKUpQH/2Q==`,
        frontPhoto: '',
        shadeCard: '',
        backPhoto: '',
        masterHank: '',
        masterSample: ''
      },
      
      // Timestamps
      createdAt: createdDate,
      updatedAt: updatedDate
    };
    
    rugs.push(rug);
  }
  
  return rugs;
}

async function create90RugsDataset() {
  console.log('🔄 Creating comprehensive dataset of 90+ rugs...');
  
  try {
    const rugsData = generateRugsDataset();
    
    // Check if Firebase Admin is available
    if (!db) {
      console.log('❌ Firebase Admin not initialized');
      console.log('📁 Creating 90+ rugs data locally...');
      
      // Create a comprehensive JSON file with 90+ rugs
      const fs = await import('fs');
      fs.writeFileSync('./comprehensive-90-rugs.json', JSON.stringify(rugsData, null, 2));
      console.log(`✅ Generated ${rugsData.length} rugs saved to comprehensive-90-rugs.json`);
      return;
    }
    
    // If Firebase is available, add to Firestore in batches
    console.log('🔥 Adding rugs to Firebase in batches...');
    
    const batchSize = 10;
    for (let i = 0; i < rugsData.length; i += batchSize) {
      const batch = rugsData.slice(i, i + batchSize);
      
      // Process batch
      const promises = batch.map(rug => db.collection('rugs').doc(rug.id).set(rug));
      await Promise.all(promises);
      
      console.log(`✅ Added batch ${Math.floor(i/batchSize) + 1}: rugs ${i + 1}-${Math.min(i + batchSize, rugsData.length)}`);
      
      // Small delay to avoid overwhelming Firebase
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`🎉 Successfully created ${rugsData.length} comprehensive rugs with complete schema!`);
    console.log(`📊 Dataset includes:`);
    console.log(`   - ${new Set(rugsData.map(r => r.quality)).size} different quality types`);
    console.log(`   - ${new Set(rugsData.map(r => r.buyerName)).size} different buyers`);
    console.log(`   - ${new Set(rugsData.map(r => r.size)).size} different sizes`);
    console.log(`   - Full material costing and process flows`);
    console.log(`   - Realistic technical specifications`);
    
  } catch (error: any) {
    console.error('❌ Error creating 90+ rugs dataset:', error.message);
    
    // Fallback: create local file
    const rugsData = generateRugsDataset();
    const fs = await import('fs');
    fs.writeFileSync('./comprehensive-90-rugs.json', JSON.stringify(rugsData, null, 2));
    console.log(`📁 Created comprehensive-90-rugs.json as fallback with ${rugsData.length} rugs`);
  }
}

create90RugsDataset();