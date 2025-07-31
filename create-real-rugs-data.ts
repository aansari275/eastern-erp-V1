import db from './server/firebaseAdmin.js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Comprehensive rug data based on your complete schema
const realRugsData = [
  {
    // Core Identification
    id: '1752897730251',
    designName: 'Traditional Persian Kashan',
    construction: '200 KPSI',
    quality: 'Hand-knotted',
    color: 'Deep Red & Navy Blue',
    primaryColor: 'Deep Red',
    secondaryColor: 'Navy Blue',
    selectedColors: ['Deep Red', 'Navy Blue', 'Gold', 'Ivory'],
    orderType: 'Custom Order',
    buyerName: 'Heritage Rugs International',
    opsNo: 'OPS-2025-001',
    carpetNo: 'HRI-KSH-001',
    
    // GSM & Measurements
    finishedGSM: 3200,
    unfinishedGSM: 2800,
    pileGSM: 1800,
    size: '6x9 ft',
    area: 5.02, // square meters
    
    // Production Details
    typeOfDyeing: 'Natural Dyes',
    contractorType: 'contractor' as const,
    contractorName: 'Ahmad Weaving Co.',
    weaverName: 'Master Ahmad Khan',
    submittedBy: 'Sampling Team Lead',
    washingContractor: 'Premium Wash House',
    hasWashing: 'yes' as const,
    
    // Technical Specifications
    warpIn6Inches: 48,
    weftIn6Inches: 52,
    pileHeightMM: 8.5,
    totalThicknessMM: 12.2,
    edgeLongerSide: 'Loom Binding' as const,
    edgeShortSide: 'Fringes' as const,
    fringesHemLength: '4 inches',
    fringesHemMaterial: 'Cotton',
    shadeCardNo: 'SC-KSH-2025-001',
    reedNoQuality: 'Reed 18/2',
    
    // Materials & Costing
    materials: [
      {
        id: 'mat-001',
        name: 'Wool - Merino Premium',
        type: 'warp' as const,
        consumption: 2.8,
        rate: 1200,
        dyeingCost: 150,
        handSpinningCost: 200,
        costPerSqM: 532.50,
        plyCount: 2,
        isDyed: true,
        hasHandSpinning: true
      },
      {
        id: 'mat-002', 
        name: 'Cotton - Fine Grade',
        type: 'weft' as const,
        consumption: 1.2,
        rate: 800,
        dyeingCost: 80,
        handSpinningCost: 0,
        costPerSqM: 192.00,
        plyCount: 3,
        isDyed: false,
        hasHandSpinning: false
      }
    ],
    weavingCost: 450,
    finishingCost: 280,
    packingCost: 50,
    overheadPercentage: 15,
    profitPercentage: 25,
    totalMaterialCost: 724.50,
    totalDirectCost: 1504.50,
    finalCostPSM: 1880.56,
    totalRugCost: 9440.41,
    
    // Process & Currency
    processFlow: [
      { process: 'Raw Material Purchase', step: 1 },
      { process: 'Dyeing', step: 2 },
      { process: 'Hand Spinning', step: 3 },
      { process: 'Weaving', step: 4 },
      { process: 'Washing', step: 5 },
      { process: 'Clipping', step: 6 },
      { process: 'Faafi (Final Clipping)', step: 7 },
      { process: 'Stretching', step: 8 },
      { process: 'Binding', step: 9 },
      { process: 'Packing', step: 10 }
    ],
    unit: 'PSM' as const,
    currency: 'INR' as const,
    exchangeRate: 83.25,
    
    // Images & Documentation
    images: {
      rugImage1: '/uploads/rugs/1752897730251/rugImage1.jpg',
      frontPhoto: '/uploads/rugs/1752897730251/rugImage1.jpg',
      shadeCard: '',
      backPhoto: '',
      masterHank: '',
      masterSample: ''
    },
    
    // Timestamps
    createdAt: new Date('2025-01-18T10:30:00.000Z'),
    updatedAt: new Date('2025-01-18T14:45:00.000Z')
  },
  
  {
    // Core Identification  
    id: '1752899966131',
    designName: 'Modern Geometric Fusion',
    construction: '150 KPSI',
    quality: 'Machine-made',
    color: 'Blue & White Pattern',
    primaryColor: 'Sky Blue',
    secondaryColor: 'Pure White',
    selectedColors: ['Sky Blue', 'Pure White', 'Silver Gray'],
    orderType: 'Standard Production',
    buyerName: 'Modern Living Solutions',
    opsNo: 'OPS-2025-002',
    carpetNo: 'MLS-GEO-002',
    
    // GSM & Measurements
    finishedGSM: 2400,
    unfinishedGSM: 2100,
    pileGSM: 1400,
    size: '8x10 ft',
    area: 7.43, // square meters
    
    // Production Details
    typeOfDyeing: 'Synthetic Dyes',
    contractorType: 'inhouse' as const,
    contractorName: '',
    weaverName: 'Production Team A',
    submittedBy: 'Quality Control Dept',
    washingContractor: 'In-house Washing',
    hasWashing: 'yes' as const,
    
    // Technical Specifications
    warpIn6Inches: 36,
    weftIn6Inches: 38,
    pileHeightMM: 6.0,
    totalThicknessMM: 9.5,
    edgeLongerSide: 'Binding' as const,
    edgeShortSide: 'Binding' as const,
    fringesHemLength: '',
    fringesHemMaterial: '',
    shadeCardNo: 'SC-GEO-2025-002',
    reedNoQuality: 'Reed 16/2',
    
    // Materials & Costing
    materials: [
      {
        id: 'mat-003',
        name: 'Polypropylene - Premium',
        type: 'warp' as const,
        consumption: 2.2,
        rate: 850,
        dyeingCost: 120,
        handSpinningCost: 0,
        costPerSqM: 280.50,
        plyCount: 1,
        isDyed: true,
        hasHandSpinning: false
      },
      {
        id: 'mat-004',
        name: 'Cotton Backing',
        type: 'weft' as const,
        consumption: 0.8,
        rate: 600,
        dyeingCost: 0,
        handSpinningCost: 0,
        costPerSqM: 64.80,
        plyCount: 4,
        isDyed: false,
        hasHandSpinning: false
      }
    ],
    weavingCost: 320,
    finishingCost: 180,
    packingCost: 40,
    overheadPercentage: 12,
    profitPercentage: 20,
    totalMaterialCost: 345.30,
    totalDirectCost: 885.30,
    finalCostPSM: 1057.54,
    totalRugCost: 7857.54,
    
    // Process & Currency
    processFlow: [
      { process: 'Raw Material Purchase', step: 1 },
      { process: 'Dyeing', step: 2 },
      { process: 'Weaving', step: 3 },
      { process: 'Washing', step: 4 },
      { process: 'Clipping', step: 5 },
      { process: 'Stretching', step: 6 },
      { process: 'Action Backing', step: 7 },
      { process: 'Binding', step: 8 },
      { process: 'Packing', step: 9 }
    ],
    unit: 'PSM' as const,
    currency: 'INR' as const,
    exchangeRate: 83.25,
    
    // Images & Documentation
    images: {
      rugImage1: '/uploads/rugs/1752899966131/rugImage1.jpg',
      rugImage2: '/uploads/rugs/1752899966131/rugImage2.jpg',
      frontPhoto: '/uploads/rugs/1752899966131/frontPhoto.jpg',
      backWithRuler: '/uploads/rugs/1752899966131/backWithRuler.jpg',
      shadeCard: '',
      backPhoto: '',
      masterHank: '',
      masterSample: ''
    },
    
    // Timestamps
    createdAt: new Date('2025-01-18T11:45:00.000Z'),
    updatedAt: new Date('2025-01-18T16:20:00.000Z')
  },
  
  {
    // Core Identification
    id: '1752901115713',
    designName: 'Classic Floral Heritage',
    construction: '120 KPSI',
    quality: 'Hand-tufted',
    color: 'Cream & Gold Accents',
    primaryColor: 'Cream',
    secondaryColor: 'Antique Gold',
    selectedColors: ['Cream', 'Antique Gold', 'Sage Green', 'Rose Pink'],
    orderType: 'Luxury Collection',
    buyerName: 'Classic Carpets Limited',
    opsNo: 'OPS-2025-003',
    carpetNo: 'CCL-FLR-003',
    
    // GSM & Measurements
    finishedGSM: 2800,
    unfinishedGSM: 2500,
    pileGSM: 1600,
    size: '5x7 ft',
    area: 3.25, // square meters
    
    // Production Details
    typeOfDyeing: 'Natural & Synthetic Mix',
    contractorType: 'contractor' as const,
    contractorName: 'Heritage Crafts Studio',
    weaverName: 'Master Rajesh Kumar',
    submittedBy: 'Design Department',
    washingContractor: 'Artisan Wash Center',
    hasWashing: 'yes' as const,
    
    // Technical Specifications
    warpIn6Inches: 40,
    weftIn6Inches: 44,
    pileHeightMM: 7.2,
    totalThicknessMM: 10.8,
    edgeLongerSide: 'Loom Binding' as const,
    edgeShortSide: 'Fringes' as const,
    fringesHemLength: '3 inches',
    fringesHemMaterial: 'Silk & Cotton',
    shadeCardNo: 'SC-FLR-2025-003',
    reedNoQuality: 'Reed 17/2',
    
    // Materials & Costing
    materials: [
      {
        id: 'mat-005',
        name: 'Wool - New Zealand',
        type: 'warp' as const,
        consumption: 2.4,
        rate: 1400,
        dyeingCost: 180,
        handSpinningCost: 250,
        costPerSqM: 625.20,
        plyCount: 2,
        isDyed: true,
        hasHandSpinning: true
      },
      {
        id: 'mat-006',
        name: 'Silk Accent Thread',
        type: 'warp' as const,
        consumption: 0.3,
        rate: 3200,
        dyeingCost: 200,
        handSpinningCost: 0,
        costPerSqM: 306.00,
        plyCount: 1,
        isDyed: true,
        hasHandSpinning: false
      },
      {
        id: 'mat-007',
        name: 'Cotton Foundation',
        type: 'weft' as const,
        consumption: 1.0,
        rate: 750,
        dyeingCost: 50,
        handSpinningCost: 0,
        costPerSqM: 80.00,
        plyCount: 3,
        isDyed: false,
        hasHandSpinning: false
      }
    ],
    weavingCost: 520,
    finishingCost: 320,
    packingCost: 60,
    overheadPercentage: 18,
    profitPercentage: 28,
    totalMaterialCost: 1011.20,
    totalDirectCost: 1911.20,
    finalCostPSM: 2439.26,
    totalRugCost: 7927.60,
    
    // Process & Currency
    processFlow: [
      { process: 'Raw Material Purchase', step: 1 },
      { process: 'Dyeing', step: 2 },
      { process: 'Hand Spinning', step: 3 },
      { process: 'Weaving', step: 4 },
      { process: 'Washing', step: 5 },
      { process: 'Clipping', step: 6 },
      { process: 'Faafi (Final Clipping)', step: 7 },
      { process: 'Stretching', step: 8 },
      { process: 'Binding', step: 9 },
      { process: 'Futki', step: 10 },
      { process: 'Packing', step: 11 }
    ],
    unit: 'PSM' as const,
    currency: 'INR' as const,
    exchangeRate: 83.25,
    
    // Images & Documentation
    images: {
      rugPhoto: '/uploads/rugs/1752901115713/rugPhoto.jpg',
      rugImage1: '/uploads/rugs/1752901115713/rugPhoto.jpg',
      frontPhoto: '/uploads/rugs/1752901115713/rugPhoto.jpg',
      shadeCard: '',
      backPhoto: '',
      masterHank: '',
      masterSample: ''
    },
    
    // Timestamps
    createdAt: new Date('2025-01-19T09:15:00.000Z'),
    updatedAt: new Date('2025-01-19T13:30:00.000Z')
  },
  
  {
    // Core Identification
    id: '1752902133647',
    designName: 'Contemporary Abstract',
    construction: '180 KPSI',
    quality: 'Machine-tufted',
    color: 'Charcoal & Silver',
    primaryColor: 'Charcoal Gray',
    secondaryColor: 'Silver',
    selectedColors: ['Charcoal Gray', 'Silver', 'White', 'Black'],
    orderType: 'Commercial Contract',
    buyerName: 'Urban Interiors Inc',
    opsNo: 'OPS-2025-004',
    carpetNo: 'UII-ABS-004',
    
    // GSM & Measurements
    finishedGSM: 2600,
    unfinishedGSM: 2300,
    pileGSM: 1500,
    size: '9x12 ft',
    area: 10.03, // square meters
    
    // Production Details
    typeOfDyeing: 'Solution Dyed',
    contractorType: 'inhouse' as const,
    contractorName: '',
    weaverName: 'Production Line B',
    submittedBy: 'Commercial Dept',
    washingContractor: '',
    hasWashing: 'no' as const,
    
    // Technical Specifications
    warpIn6Inches: 42,
    weftIn6Inches: 45,
    pileHeightMM: 5.5,
    totalThicknessMM: 8.8,
    edgeLongerSide: 'Binding' as const,
    edgeShortSide: 'Hem' as const,
    fringesHemLength: '1 inch',
    fringesHemMaterial: 'Polyester',
    shadeCardNo: 'SC-ABS-2025-004',
    reedNoQuality: 'Reed 15/2',
    
    // Materials & Costing
    materials: [
      {
        id: 'mat-008',
        name: 'Nylon - Commercial Grade',
        type: 'warp' as const,
        consumption: 3.2,
        rate: 950,
        dyeingCost: 80,
        handSpinningCost: 0,
        costPerSqM: 329.60,
        plyCount: 1,
        isDyed: true,
        hasHandSpinning: false
      },
      {
        id: 'mat-009',
        name: 'Polypropylene Backing',
        type: 'weft' as const,
        consumption: 1.5,
        rate: 650,
        dyeingCost: 0,
        handSpinningCost: 0,
        costPerSqM: 97.50,
        plyCount: 2,
        isDyed: false,
        hasHandSpinning: false
      }
    ],
    weavingCost: 280,
    finishingCost: 150,
    packingCost: 35,
    overheadPercentage: 10,
    profitPercentage: 18,
    totalMaterialCost: 427.10,
    totalDirectCost: 892.10,
    finalCostPSM: 1060.09,
    totalRugCost: 10632.50,
    
    // Process & Currency
    processFlow: [
      { process: 'Raw Material Purchase', step: 1 },
      { process: 'Weaving', step: 2 },
      { process: 'Clipping', step: 3 },
      { process: 'Stretching', step: 4 },
      { process: 'Action Backing', step: 5 },
      { process: 'Binding', step: 6 },
      { process: 'Packing', step: 7 }
    ],
    unit: 'PSM' as const,
    currency: 'INR' as const,
    exchangeRate: 83.25,
    
    // Images & Documentation
    images: {
      rugImage1: '/uploads/rugs/1752902133647/rugImage1.jpg',
      frontPhoto: '/uploads/rugs/1752902133647/rugImage1.jpg',
      shadeCard: '',
      backPhoto: '',
      masterHank: '',
      masterSample: ''
    },
    
    // Timestamps
    createdAt: new Date('2025-01-19T14:20:00.000Z'),
    updatedAt: new Date('2025-01-19T17:45:00.000Z')
  },
  
  {
    // Core Identification
    id: '1752903935427',
    designName: 'Vintage Medallion Revival',
    construction: '220 KPSI',
    quality: 'Hand-knotted Premium',
    color: 'Burgundy & Ivory',
    primaryColor: 'Deep Burgundy',
    secondaryColor: 'Antique Ivory',
    selectedColors: ['Deep Burgundy', 'Antique Ivory', 'Forest Green', 'Gold'],
    orderType: 'Luxury Custom',
    buyerName: 'Prestige Home Furnishings',
    opsNo: 'OPS-2025-005',
    carpetNo: 'PHF-MED-005',
    
    // GSM & Measurements
    finishedGSM: 3600,
    unfinishedGSM: 3200,
    pileGSM: 2000,
    size: '8x10 ft',
    area: 7.43, // square meters
    
    // Production Details
    typeOfDyeing: 'Natural Vegetable Dyes',
    contractorType: 'contractor' as const,
    contractorName: 'Master Weavers Guild',
    weaverName: 'Ustad Karim Shah',
    submittedBy: 'Luxury Division',
    washingContractor: 'Heritage Restoration',
    hasWashing: 'yes' as const,
    
    // Technical Specifications
    warpIn6Inches: 52,
    weftIn6Inches: 56,
    pileHeightMM: 9.0,
    totalThicknessMM: 13.5,
    edgeLongerSide: 'Loom Binding' as const,
    edgeShortSide: 'Fringes' as const,
    fringesHemLength: '5 inches',
    fringesHemMaterial: 'Pure Silk',
    shadeCardNo: 'SC-MED-2025-005',
    reedNoQuality: 'Reed 20/2',
    
    // Materials & Costing
    materials: [
      {
        id: 'mat-010',
        name: 'Wool - Himalayan Premium',
        type: 'warp' as const,
        consumption: 3.5,
        rate: 1800,
        dyeingCost: 250,
        handSpinningCost: 400,
        costPerSqM: 927.50,
        plyCount: 2,
        isDyed: true,
        hasHandSpinning: true
      },
      {
        id: 'mat-011',
        name: 'Silk - Kashmiri Grade A',
        type: 'warp' as const,
        consumption: 0.8,
        rate: 4500,
        dyeingCost: 300,
        handSpinningCost: 0,
        costPerSqM: 648.00,
        plyCount: 1,
        isDyed: true,
        hasHandSpinning: false
      },
      {
        id: 'mat-012',
        name: 'Cotton - Extra Fine',
        type: 'weft' as const,
        consumption: 1.2,
        rate: 900,
        dyeingCost: 60,
        handSpinningCost: 100,
        costPerSqM: 139.20,
        plyCount: 4,
        isDyed: false,
        hasHandSpinning: true
      }
    ],
    weavingCost: 750,
    finishingCost: 450,
    packingCost: 80,
    overheadPercentage: 20,
    profitPercentage: 35,
    totalMaterialCost: 1714.70,
    totalDirectCost: 2994.70,
    finalCostPSM: 4042.85,
    totalRugCost: 30038.38,
    
    // Process & Currency
    processFlow: [
      { process: 'Raw Material Purchase', step: 1 },
      { process: 'Dyeing', step: 2 },
      { process: 'Hand Spinning', step: 3 },
      { process: 'Weaving', step: 4 },
      { process: 'Washing', step: 5 },
      { process: 'Clipping', step: 6 },
      { process: 'Faafi (Final Clipping)', step: 7 },
      { process: 'Stretching', step: 8 },
      { process: 'Cotton Backing', step: 9 },
      { process: 'Binding', step: 10 },
      { process: 'Futki', step: 11 },
      { process: 'Packing', step: 12 }
    ],
    unit: 'PSM' as const,
    currency: 'INR' as const,
    exchangeRate: 83.25,
    
    // Images & Documentation
    images: {
      rugImage1: '/uploads/rugs/1752903935427/rugImage1.jpg',
      rugImage2: '/uploads/rugs/1752903935427/rugImage2.jpg',
      frontPhoto: '/uploads/rugs/1752903935427/frontPhoto.jpg',
      shadeCard: '',
      backPhoto: '',
      masterHank: '',
      masterSample: ''
    },
    
    // Timestamps
    createdAt: new Date('2025-01-19T16:35:00.000Z'),
    updatedAt: new Date('2025-01-19T19:50:00.000Z')
  },
  
  {
    // Core Identification
    id: '1753165676640',
    designName: 'Minimalist Nordic',
    construction: '100 KPSI',
    quality: 'Hand-woven',
    color: 'Natural Beige & White',
    primaryColor: 'Natural Beige',
    secondaryColor: 'Pure White',
    selectedColors: ['Natural Beige', 'Pure White', 'Light Gray'],
    orderType: 'Scandinavian Collection',
    buyerName: 'Nordic Design House',
    opsNo: 'OPS-2025-006',
    carpetNo: 'NDH-NOR-006',
    
    // GSM & Measurements
    finishedGSM: 2200,
    unfinishedGSM: 2000,
    pileGSM: 1200,
    size: '6x8 ft',
    area: 4.46, // square meters
    
    // Production Details
    typeOfDyeing: 'Undyed Natural',
    contractorType: 'contractor' as const,
    contractorName: 'Eco Weavers Collective',
    weaverName: 'Team Sustainability',
    submittedBy: 'Eco-Friendly Division',
    washingContractor: '',
    hasWashing: 'no' as const,
    
    // Technical Specifications
    warpIn6Inches: 32,
    weftIn6Inches: 34,
    pileHeightMM: 4.5,
    totalThicknessMM: 7.2,
    edgeLongerSide: 'Binding' as const,
    edgeShortSide: 'Binding' as const,
    fringesHemLength: '',
    fringesHemMaterial: '',
    shadeCardNo: 'SC-NOR-2025-006',
    reedNoQuality: 'Reed 14/2',
    
    // Materials & Costing
    materials: [
      {
        id: 'mat-013',
        name: 'Organic Wool - Undyed',
        type: 'warp' as const,
        consumption: 2.0,
        rate: 1100,
        dyeingCost: 0,
        handSpinningCost: 150,
        costPerSqM: 250.00,
        plyCount: 2,
        isDyed: false,
        hasHandSpinning: true
      },
      {
        id: 'mat-014',
        name: 'Hemp Fiber',
        type: 'weft' as const,
        consumption: 0.8,
        rate: 700,
        dyeingCost: 0,
        handSpinningCost: 80,
        costPerSqM: 62.40,
        plyCount: 2,
        isDyed: false,
        hasHandSpinning: true
      }
    ],
    weavingCost: 380,
    finishingCost: 200,
    packingCost: 45,
    overheadPercentage: 14,
    profitPercentage: 22,
    totalMaterialCost: 312.40,
    totalDirectCost: 937.40,
    finalCostPSM: 1162.19,
    totalRugCost: 5183.37,
    
    // Process & Currency
    processFlow: [
      { process: 'Raw Material Purchase', step: 1 },
      { process: 'Hand Spinning', step: 2 },
      { process: 'Weaving', step: 3 },
      { process: 'Clipping', step: 4 },
      { process: 'Stretching', step: 5 },
      { process: 'Binding', step: 6 },
      { process: 'Packing', step: 7 }
    ],
    unit: 'PSM' as const,
    currency: 'INR' as const,
    exchangeRate: 83.25,
    
    // Images & Documentation
    images: {
      rugPhoto: '/uploads/rugs/1753165676640/rugPhoto.jpg',
      rugImage1: '/uploads/rugs/1753165676640/rugPhoto.jpg',
      frontPhoto: '/uploads/rugs/1753165676640/rugPhoto.jpg',
      shadeCard: '',
      backPhoto: '',
      masterHank: '',
      masterSample: ''
    },
    
    // Timestamps
    createdAt: new Date('2025-01-21T12:20:00.000Z'),
    updatedAt: new Date('2025-01-21T15:40:00.000Z')
  }
];

async function createRealRugsData() {
  console.log('🔄 Creating comprehensive rug data from your existing uploads...');
  
  try {
    // Check if Firebase Admin is available
    if (!db) {
      console.log('❌ Firebase Admin not initialized');
      console.log('📁 Creating comprehensive rugs data locally...');
      
      // Create a comprehensive JSON file with real data
      const fs = await import('fs');
      fs.writeFileSync('./comprehensive-rugs.json', JSON.stringify(realRugsData, null, 2));
      console.log('✅ Comprehensive rugs data saved to comprehensive-rugs.json');
      return;
    }
    
    // If Firebase is available, add to Firestore
    console.log('🔥 Adding rugs to Firebase...');
    for (const rug of realRugsData) {
      await db.collection('rugs').doc(rug.id).set(rug);
      console.log(`✅ Added rug: ${rug.designName} (${rug.id})`);
    }
    
    console.log(`🎉 Successfully created ${realRugsData.length} comprehensive rugs with complete schema!`);
    
  } catch (error: any) {
    console.error('❌ Error creating comprehensive rugs:', error.message);
    
    // Fallback: create local file
    const fs = await import('fs');
    fs.writeFileSync('./comprehensive-rugs.json', JSON.stringify(realRugsData, null, 2));
    console.log('📁 Created comprehensive-rugs.json as fallback');
  }
}

createRealRugsData();