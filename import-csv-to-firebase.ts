import admin from "firebase-admin";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";

// Read service account key for eastern-erp-v1
const serviceAccountPath = "./server/serviceAccountKey.json";
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "eastern-erp-v1"
  });
}

const db = admin.firestore();

async function importCSVData() {
  try {
    console.log("🚀 Starting CSV import to eastern-erp-v1 Firebase...");

    // Test Firebase connection
    console.log("🔥 Testing Firebase connection...");
    await db.collection('test').doc('connection-test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: true
    });
    console.log("✅ Firebase connection successful");
    await db.collection('test').doc('connection-test').delete();

    // 1. Import Master Data (Rugs/Samples)
    console.log("\n📋 Importing master data (rugs/samples)...");
    const csvFilePath = "./attached_assets/Master Data list - Sheet16 (1)_1752998958827.csv";
    const csvContent = readFileSync(csvFilePath, "utf8");
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${records.length} records in CSV`);

    // Get unique buyers from the data
    const uniqueBuyerCodes = [...new Set(records.map((record: any) => record["Buyer Code"]))];
    console.log(`Found ${uniqueBuyerCodes.length} unique buyer codes:`, uniqueBuyerCodes);

    // 2. Create Buyers first
    console.log("\n📋 Creating buyers from CSV data...");
    const buyerNames: { [key: string]: string } = {
      "M-06": "MARIEB",
      "N-01": "NIAZ TRADING",
      "A-02": "ATELIER TORTIL",
      "N-02": "NORDIC DESIGN",
      "F-01": "FURNITURE WORLD",
      "R-01": "ROYAL CARPETS",
      "L-01": "LUXURY TEXTILES"
    };

    let createdBuyers = 0;
    for (const buyerCode of uniqueBuyerCodes) {
      if (!buyerCode) continue;
      
      const buyerId = Date.now() + Math.floor(Math.random() * 10000);
      const buyerName = buyerNames[buyerCode] || `Buyer ${buyerCode}`;
      
      await db.collection("buyers").doc(buyerId.toString()).set({
        id: buyerId,
        name: buyerName,
        code: buyerCode,
        buyerName: buyerName,
        buyerCode: buyerCode,
        merchantId: "",
        reference: "",
        currency: "USD",
        paymentTerms: "",
        deliveryAddress: "",
        invoiceAddress: "",
        shipmentMethod: "",
        articleNumbers: [],
        notes: `Imported from CSV data`,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      createdBuyers++;
      console.log(`  ✅ Created buyer: ${buyerName} (${buyerCode})`);
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ ${createdBuyers} buyers created successfully!`);

    // 3. Create Rugs/Samples
    console.log("\n📋 Creating rugs/samples from CSV data...");
    let createdRugs = 0;
    
    for (const record of records) {
      const rugId = Date.now() + Math.floor(Math.random() * 10000);
      const buyerCode = record["Buyer Code"] || "";
      const construction = record["Construction"] || "";
      const designName = record["Design Name"] || "";
      const colour = record["Colour"] || "";
      const size = record["Size"] || "";
      
      // Parse size into dimensions if possible
      const sizeParts = size.split('x');
      let width = "";
      let length = "";
      if (sizeParts.length === 2) {
        width = sizeParts[0].trim();
        length = sizeParts[1].trim();
      }

      const rugData = {
        id: rugId.toString(),
        userId: "system",
        designName: designName,
        construction: construction,
        quality: construction,
        color: colour,
        primaryColor: colour,
        secondaryColor: "",
        orderType: "sample",
        buyerName: buyerNames[buyerCode] || `Buyer ${buyerCode}`,
        buyerCode: buyerCode,
        opsNo: "",
        carpetNo: "",
        size: size,
        width: width,
        length: length,
        typeOfDyeing: "",
        contractorType: "",
        contractorName: "",
        weaverName: "",
        submittedBy: "CSV Import",
        washingContractor: "",
        hasWashing: false,
        
        // Default measurements
        finishedGSM: 0,
        unfinishedGSM: 0,
        pileGSM: 0,
        warpIn6Inches: 0,
        weftIn6Inches: 0,
        pileHeightMM: 0,
        totalThicknessMM: 0,
        area: 0,
        
        // Default costs
        weavingCost: 0,
        finishingCost: 0,
        packingCost: 0,
        totalMaterialCost: 0,
        totalDirectCost: 0,
        finalCostPSM: 0,
        overheadPercentage: 0,
        profitPercentage: 0,
        
        // Details
        edgeLongerSide: "",
        edgeShortSide: "",
        fringesHemLength: "",
        fringesHemMaterial: "",
        shadeCardNo: "",
        
        // Arrays
        materials: [],
        processFlow: [],
        images: {},
        
        // Status
        status: "active",
        isActive: true,
        source: "CSV Import",
        importDate: new Date().toISOString(),
        
        // Timestamps
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection("rugs").doc(rugId.toString()).set(rugData);
      createdRugs++;
      console.log(`  ✅ Created rug: ${designName} (${buyerCode}) - ${size}`);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    console.log(`✅ ${createdRugs} rugs created successfully!`);

    // 4. Create some sample materials
    console.log("\n📋 Creating sample materials...");
    const sampleMaterials = [
      { name: "100% Cotton", type: "Yarn", rate: 25.50, dyeingCost: 5.00, unit: "kg" },
      { name: "Wool Blend", type: "Yarn", rate: 45.00, dyeingCost: 8.00, unit: "kg" },
      { name: "Silk", type: "Yarn", rate: 120.00, dyeingCost: 15.00, unit: "kg" },
      { name: "Jute", type: "Yarn", rate: 18.00, dyeingCost: 3.00, unit: "kg" },
      { name: "Polyester", type: "Yarn", rate: 22.00, dyeingCost: 4.50, unit: "kg" },
      { name: "Bamboo Fiber", type: "Yarn", rate: 35.00, dyeingCost: 6.00, unit: "kg" }
    ];

    let createdMaterials = 0;
    for (const material of sampleMaterials) {
      const materialId = Date.now() + Math.floor(Math.random() * 10000);
      
      await db.collection("materials").doc(materialId.toString()).set({
        id: materialId.toString(),
        name: material.name,
        type: material.type,
        rate: material.rate,
        dyeingCost: material.dyeingCost,
        unit: material.unit,
        description: `${material.name} for textile manufacturing`,
        category: "textiles",
        isActive: true,
        source: "Sample Data",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      createdMaterials++;
      console.log(`  ✅ Created material: ${material.name}`);
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`✅ ${createdMaterials} materials created successfully!`);

    // 5. Create sample lab inspections
    console.log("\n📋 Creating sample lab inspections...");
    const sampleInspections = [
      { materialType: "Cotton", inspectionType: "Incoming", status: "passed", notes: "Quality acceptable" },
      { materialType: "Wool", inspectionType: "Dyed", status: "pending", notes: "Awaiting color fastness test" },
      { materialType: "Silk", inspectionType: "Incoming", status: "failed", notes: "Moisture content too high" }
    ];

    let createdInspections = 0;
    for (const inspection of sampleInspections) {
      const inspectionId = Date.now() + Math.floor(Math.random() * 10000);
      
      await db.collection("labInspections").doc(inspectionId.toString()).set({
        id: inspectionId.toString(),
        materialType: inspection.materialType,
        inspectionType: inspection.inspectionType,
        status: inspection.status,
        notes: inspection.notes,
        inspectorName: "Sample Inspector",
        testResults: {},
        images: [],
        source: "Sample Data",
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      createdInspections++;
      console.log(`  ✅ Created inspection: ${inspection.materialType} - ${inspection.inspectionType}`);
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`✅ ${createdInspections} lab inspections created successfully!`);

    // 6. Create sample operations
    console.log("\n📋 Creating sample operations...");
    const sampleOps = [
      { opsNo: "OP-2025-001", status: "active", description: "Weaving operation for EM-21-MA-2191" },
      { opsNo: "OP-2025-002", status: "completed", description: "Finishing operation for EM-23-CO-4949" },
      { opsNo: "OP-2025-003", status: "pending", description: "Quality check for EM-22-MA-4750 V3" }
    ];

    let createdOps = 0;
    for (const op of sampleOps) {
      const opId = Date.now() + Math.floor(Math.random() * 10000);
      
      await db.collection("ops").doc(opId.toString()).set({
        id: opId.toString(),
        opsNo: op.opsNo,
        status: op.status,
        description: op.description,
        assignedTo: "Production Team",
        priority: "medium",
        source: "Sample Data",
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      createdOps++;
      console.log(`  ✅ Created operation: ${op.opsNo} - ${op.status}`);
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`✅ ${createdOps} operations created successfully!`);

    console.log("\n🎉 CSV import to eastern-erp-v1 completed successfully!");
    console.log("📊 Summary:");
    console.log(`  - ${createdBuyers} buyers created`);
    console.log(`  - ${createdRugs} rugs/samples created`);
    console.log(`  - ${createdMaterials} materials created`);
    console.log(`  - ${createdInspections} lab inspections created`);
    console.log(`  - ${createdOps} operations created`);
    console.log("\n🌐 You can view your data at: https://console.firebase.google.com/project/eastern-erp-v1/firestore");

  } catch (error) {
    console.error("❌ CSV import failed:", error);
    throw error;
  }
}

// Run the import
importCSVData().catch((error) => {
  console.error("❌ Import script failed:", error);
  process.exit(1);
});