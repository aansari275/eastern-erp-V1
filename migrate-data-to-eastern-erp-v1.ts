import admin from "firebase-admin";
import { Pool } from "pg";
import { readFileSync } from "fs";

// Read service account key for eastern-erp-v1
const serviceAccountPath = "./server/serviceAccountKey.json";
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin with your new eastern-erp-v1 project
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "eastern-erp-v1"
  });
}

const db = admin.firestore();
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateToEasternERP() {
  try {
    console.log("🚀 Starting migration to eastern-erp-v1 Firebase...");

    // Test Firebase connection first
    console.log("🔥 Testing Firebase connection...");
    await db.collection('test').doc('connection-test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: true,
      migrationDate: new Date().toISOString()
    });
    console.log("✅ Firebase connection successful");
    await db.collection('test').doc('connection-test').delete();

    // Test PostgreSQL connection
    try {
      await pool.query('SELECT 1');
      console.log("✅ PostgreSQL connection successful");
    } catch (error) {
      console.error("❌ PostgreSQL connection failed:", error);
      console.log("💡 Make sure your DATABASE_URL environment variable is set correctly");
      process.exit(1);
    }

    // 1. Migrate Buyers
    console.log("\n📋 Migrating buyers...");
    try {
      const buyersRes = await pool.query("SELECT * FROM buyers ORDER BY id");
      console.log(`Found ${buyersRes.rows.length} buyers to migrate`);

      if (buyersRes.rows.length > 0) {
        let migratedBuyers = 0;
        
        for (const buyer of buyersRes.rows) {
          const buyerRef = db.collection("buyers").doc(buyer.id.toString());
          const buyerData: any = {
            id: buyer.id.toString(),
            name: buyer.name || buyer.buyer_name || "",
            code: buyer.code || buyer.buyer_code || "",
            buyerName: buyer.buyer_name || buyer.name || "",
            buyerCode: buyer.buyer_code || buyer.code || "",
            merchantName: buyer.merchant_name || "",
            merchantEmail: buyer.merchant_email || "",
            reference: buyer.reference || "",
            currency: buyer.currency || "USD",
            paymentTerms: buyer.payment_terms || "",
            deliveryAddress: buyer.delivery_address || "",
            invoiceAddress: buyer.invoice_address || "",
            shipmentMethod: buyer.shipment_method || "",
            articleNumbers: buyer.article_numbers || [],
            notes: buyer.notes || "",
            isActive: buyer.is_active ?? true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          await buyerRef.set(buyerData);
          migratedBuyers++;
          console.log(`  ✅ Migrated buyer: ${buyerData.name} (${buyerData.code})`);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`✅ ${migratedBuyers} buyers migrated successfully!`);
      }
    } catch (error) {
      console.error("❌ Error migrating buyers:", error);
    }

    // 2. Migrate Rugs/Samples
    console.log("\n📋 Migrating rugs/samples...");
    try {
      const rugsRes = await pool.query("SELECT * FROM rugs ORDER BY id");
      console.log(`Found ${rugsRes.rows.length} rugs to migrate`);

      if (rugsRes.rows.length > 0) {
        let migratedRugs = 0;
        
        for (const rug of rugsRes.rows) {
          const rugRef = db.collection("rugs").doc(rug.id.toString());
          
          // Create comprehensive rug data
          const rugData: any = {
            id: rug.id.toString(),
            userId: rug.user_id?.toString() || "",
            designName: rug.design_name || "",
            construction: rug.construction || "",
            quality: rug.quality || "",
            color: rug.color || "",
            primaryColor: rug.primary_color || "",
            secondaryColor: rug.secondary_color || "",
            orderType: rug.order_type || "",
            buyerName: rug.buyer_name || "",
            opsNo: rug.ops_no || "",
            carpetNo: rug.carpet_no || "",
            size: rug.size || "",
            typeOfDyeing: rug.type_of_dyeing || "",
            contractorType: rug.contractor_type || "",
            contractorName: rug.contractor_name || "",
            weaverName: rug.weaver_name || "",
            submittedBy: rug.submitted_by || "",
            washingContractor: rug.washing_contractor || "",
            hasWashing: rug.has_washing || false,
            
            // Measurements
            finishedGSM: parseFloat(rug.finished_gsm) || 0,
            unfinishedGSM: parseFloat(rug.unfinished_gsm) || 0,
            pileGSM: parseFloat(rug.pile_gsm) || 0,
            warpIn6Inches: parseFloat(rug.warp_in_6_inches) || 0,
            weftIn6Inches: parseFloat(rug.weft_in_6_inches) || 0,
            pileHeightMM: parseFloat(rug.pile_height_mm) || 0,
            totalThicknessMM: parseFloat(rug.total_thickness_mm) || 0,
            area: parseFloat(rug.area) || 0,
            
            // Costs
            weavingCost: parseFloat(rug.weaving_cost) || 0,
            finishingCost: parseFloat(rug.finishing_cost) || 0,
            packingCost: parseFloat(rug.packing_cost) || 0,
            totalMaterialCost: parseFloat(rug.total_material_cost) || 0,
            totalDirectCost: parseFloat(rug.total_direct_cost) || 0,
            finalCostPSM: parseFloat(rug.final_cost_psm) || 0,
            overheadPercentage: parseFloat(rug.overhead_percentage) || 0,
            profitPercentage: parseFloat(rug.profit_percentage) || 0,
            
            // Details
            edgeLongerSide: rug.edge_longer_side || "",
            edgeShortSide: rug.edge_short_side || "",
            fringesHemLength: rug.fringes_hem_length || "",
            fringesHemMaterial: rug.fringes_hem_material || "",
            shadeCardNo: rug.shade_card_no || "",
            
            // Arrays (with safety checks)
            materials: Array.isArray(rug.materials) ? rug.materials.slice(0, 50) : [],
            processFlow: Array.isArray(rug.process_flow) ? rug.process_flow.slice(0, 50) : [],
            
            // Status
            status: rug.status || "draft",
            isActive: true,
            
            // Timestamps
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          // Handle images safely (only store URLs, not base64 data)
          if (rug.images && typeof rug.images === 'object') {
            rugData.images = {};
            Object.keys(rug.images).forEach(key => {
              const imageValue = rug.images[key];
              if (typeof imageValue === 'string' && imageValue.length < 500) {
                rugData.images[key] = imageValue;
              }
            });
          } else {
            rugData.images = {};
          }

          await rugRef.set(rugData);
          migratedRugs++;
          console.log(`  ✅ Migrated rug: ${rugData.designName} (ID: ${rugData.id})`);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 150));
        }
        
        console.log(`✅ ${migratedRugs} rugs migrated successfully!`);
      }
    } catch (error) {
      console.error("❌ Error migrating rugs:", error);
    }

    // 3. Migrate Materials
    console.log("\n📋 Migrating materials...");
    try {
      const materialsRes = await pool.query("SELECT * FROM materials ORDER BY id");
      console.log(`Found ${materialsRes.rows.length} materials to migrate`);

      if (materialsRes.rows.length > 0) {
        let migratedMaterials = 0;
        
        for (const material of materialsRes.rows) {
          const materialRef = db.collection("materials").doc(material.id.toString());
          const materialData: any = {
            id: material.id.toString(),
            name: material.name || "",
            type: material.type || "",
            rate: parseFloat(material.rate) || 0,
            dyeingCost: parseFloat(material.dyeing_cost) || 0,
            description: material.description || "",
            unit: material.unit || "kg",
            category: material.category || "general",
            isActive: material.is_active ?? true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          await materialRef.set(materialData);
          migratedMaterials++;
          console.log(`  ✅ Migrated material: ${materialData.name}`);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log(`✅ ${migratedMaterials} materials migrated successfully!`);
      }
    } catch (error) {
      console.error("❌ Error migrating materials:", error);
    }

    // 4. Migrate Users
    console.log("\n📋 Migrating users...");
    try {
      const usersRes = await pool.query("SELECT * FROM users ORDER BY id");
      console.log(`Found ${usersRes.rows.length} users to migrate`);

      if (usersRes.rows.length > 0) {
        let migratedUsers = 0;
        
        for (const user of usersRes.rows) {
          const userRef = db.collection("users").doc(user.id.toString());
          const userData: any = {
            UserId: user.id.toString(),
            Email: user.email || "",
            Role: user.role || "viewer",
            Department: user.department || "",
            DepartmentId: user.department_id || "",
            isActive: user.is_active ?? true,
            permissions: user.permissions || [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          await userRef.set(userData);
          migratedUsers++;
          console.log(`  ✅ Migrated user: ${userData.Email}`);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log(`✅ ${migratedUsers} users migrated successfully!`);
      }
    } catch (error) {
      console.error("❌ Error migrating users:", error);
    }

    console.log("\n🎉 Migration to eastern-erp-v1 completed successfully!");
    console.log("📊 Your data is now available in the new Firebase project");
    console.log("🌐 You can view it at: https://console.firebase.google.com/project/eastern-erp-v1/firestore");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    // Close PostgreSQL connection
    await pool.end();
    console.log("📚 Database connections closed");
  }
}

// Run the migration
migrateToEasternERP().catch((error) => {
  console.error("❌ Migration script failed:", error);
  process.exit(1);
});