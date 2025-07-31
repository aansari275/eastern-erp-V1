import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { setupFirebaseAuth } from "./firebaseAuth";
// Using Firestore helpers directly
import { Pool } from "pg";
import { adminDb } from './firestoreHelpers';
import rugRoutes from "./routes/rugs";
import materialRoutes from "./routes/materials";
import opsRoutes from "./routes/ops";
import ocrRoutes from "./routes/ocr-fixed";
import opsLineItemRoutes from "./routes/ops-line-items";
import buyerArticlesRoutes from "./routes/buyer-articles";
import buyersRoutes from "./routes/buyers";
import quotesRoutes from "./routes/quotes";
import qualityRoutes from "./routes/quality";
import qualityComplianceRoutes from "./routes/qualityCompliance";
import notificationRoutes from "./routes/notifications";
import qcPermissionsRoutes from "./routes/qcPermissions";
import auditRoutes from './routes/audits';
import labInspectionRoutes from './routes/labInspections';
import testLabRoutes from './routes/test-lab';
import { sendTestEmail } from "./emailService";
const app = express();
const server = createServer(app);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// Serve uploaded images statically with better CORS and caching headers
app.use("/uploads", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    next();
}, express.static("uploads"));
// CORS middleware - allow all origins in development
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
// PostgreSQL connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// Assign User Role
async function assignUserRole(userId, email, roleId, departmentId) {
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.set({
        UserId: userId,
        Email: email,
        Role: roleId,
        DepartmentId: departmentId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    console.log(`User ${userId} assigned role ${roleId}`);
}
// Check Permission
async function checkPermission(userId, action, collection) {
    const userSnap = await adminDb.collection("users").doc(userId).get();
    if (userSnap.exists) {
        const user = userSnap.data();
        const permissionsSnap = await adminDb
            .collection("permissions")
            .where("RoleId", "==", user.Role)
            .where("Action", "==", action)
            .where("Collection", "==", collection)
            .get();
        return !permissionsSnap.empty;
    }
    return false;
}
// Secure Data Access (Example for rugs)
async function getRugs(userId) {
    if (await checkPermission(userId, "read", "rugs")) {
        const rugsSnap = await adminDb.collection("rugs").get();
        const rugs = rugsSnap.docs.map((doc) => doc.data());
        console.log(`Rugs access granted for user ${userId}:`, rugs.length, "rugs found");
    }
    else {
        console.log(`Permission denied for rugs! User: ${userId}`);
    }
}
// Secure Data Access (Example for buyers)
async function getBuyers(userId) {
    if (await checkPermission(userId, "read", "buyers")) {
        const buyersSnap = await adminDb.collection("buyers").get();
        const buyers = buyersSnap.docs.map((doc) => doc.data());
        console.log(`Buyers access granted for user ${userId}:`, buyers.length, "buyers found");
    }
    else {
        console.log(`Permission denied for buyers! User: ${userId}`);
    }
}
// Check Firestore Collections
async function checkFirestoreCollections() {
    console.log("🔍 Checking Firestore collections...");
    try {
        // Check users collection
        const usersSnap = await adminDb.collection("users").get();
        console.log(`📊 Users collection: ${usersSnap.size} documents found`);
        usersSnap.forEach((doc) => {
            console.log(`  - User ${doc.id}:`, {
                Email: doc.data().Email,
                Role: doc.data().Role,
                DepartmentId: doc.data().DepartmentId,
                isActive: doc.data().isActive,
            });
        });
        // Check permissions collection
        const permissionsSnap = await adminDb.collection("permissions").get();
        console.log(`🔑 Permissions collection: ${permissionsSnap.size} documents found`);
        permissionsSnap.forEach((doc) => {
            console.log(`  - Permission ${doc.id}:`, {
                RoleId: doc.data().RoleId,
                Action: doc.data().Action,
                Collection: doc.data().Collection,
            });
        });
    }
    catch (error) {
        console.error("❌ Error checking Firestore collections:", error);
    }
}
// Set Permissions
async function setPermissions() {
    // Rugs permissions
    await adminDb.collection("permissions").doc("perm001").set({
        PermissionId: "perm001",
        RoleId: "role001", // Admin
        Action: "read",
        Collection: "rugs",
    });
    await adminDb.collection("permissions").doc("perm002").set({
        PermissionId: "perm002",
        RoleId: "role001", // Admin
        Action: "write",
        Collection: "rugs",
    });
    await adminDb.collection("permissions").doc("perm003").set({
        PermissionId: "perm003",
        RoleId: "role002", // Editor
        Action: "write",
        Collection: "rugs",
    });
    await adminDb.collection("permissions").doc("perm004").set({
        PermissionId: "perm004",
        RoleId: "role003", // Viewer
        Action: "read",
        Collection: "rugs",
    });
    // Buyers permissions
    await adminDb.collection("permissions").doc("perm005").set({
        PermissionId: "perm005",
        RoleId: "role001", // Admin
        Action: "read",
        Collection: "buyers",
    });
    await adminDb.collection("permissions").doc("perm006").set({
        PermissionId: "perm006",
        RoleId: "role001", // Admin
        Action: "write",
        Collection: "buyers",
    });
    await adminDb.collection("permissions").doc("perm007").set({
        PermissionId: "perm007",
        RoleId: "role002", // Editor
        Action: "read",
        Collection: "buyers",
    });
    console.log("Permissions set for rugs and buyers collections!");
}
async function initializeServer() {
    try {
        console.log("🔧 Starting server initialization...");
        console.log("🔧 Environment:", process.env.NODE_ENV);
        console.log("🔧 Firebase Project ID:", process.env.FIREBASE_PROJECT_ID || "Not set");
        console.log("🔧 Port:", process.env.PORT || "5000");
        // Setup Firebase authentication
        await setupFirebaseAuth(app);
        console.log("✓ Authentication setup complete");
        // Add CORS middleware for all routes
        app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            next();
        });
        // Storage is now handled directly in routes via Firestore helpers
        // Register API routes FIRST before Vite setup
        app.use("/api/rugs", rugRoutes);
        app.use("/api/materials", materialRoutes);
        // app.use("/api/users", userRoutes); // Commented out - route doesn't exist yet
        app.use("/api/ops", opsRoutes);
        app.use("/api/ocr", ocrRoutes);
        app.use("/api/ops-line-items", opsLineItemRoutes);
        app.use("/api/buyer-articles", buyerArticlesRoutes);
        app.use("/api/buyers", buyersRoutes); // Add missing buyers route
        app.use("/api/quotes", quotesRoutes); // Add missing quotes route
        // Quality routes - direct import since it doesn't need storage
        app.use("/api/quality", qualityRoutes);
        // Quality Compliance routes
        app.use("/api/quality-compliance", qualityComplianceRoutes);
        // Notification routes for email alerts
        app.use("/api/quality", notificationRoutes);
        // QC Permissions routes
        app.use("/api/qc", qcPermissionsRoutes);
        // Audit routes for PDF generation
        app.use("/api/audits", auditRoutes);
        // Lab inspections routes for incoming material testing
        app.use("/api/lab-inspections", labInspectionRoutes);
        // Test lab route for debugging
        app.use("/api/test-lab", testLabRoutes);
        // Test email endpoint
        app.post("/api/test-email", async (req, res) => {
            try {
                const result = await sendTestEmail();
                res.json({ success: result, message: "Test email sent successfully!" });
            }
            catch (error) {
                console.error("Test email error:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
        console.log("✓ Routes registered");
        // Add explicit materials route for debugging (BEFORE Vite setup)
        app.get("/test-materials", async (req, res) => {
            try {
                const { getMaterials } = await import("./erpDatabase");
                const materials = await getMaterials();
                res.json({ count: materials.length, materials: materials.slice(0, 5) });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        // Setup Vite dev server or serve static files AFTER API routes
        if (process.env.NODE_ENV === "development") {
            await setupVite(app, server);
            console.log("✓ Vite dev server setup complete");
        }
        else {
            serveStatic(app);
            console.log("✓ Static file serving setup complete");
        }
        // Initialize permissions and test users
        console.log("🔧 Setting up permissions and test users...");
        // Example Usage
        await assignUserRole("user123", "user@example.com", "role001", "dept001"); // Admin in Sampling
        await assignUserRole("user456", "user2@example.com", "role003", "dept002"); // Viewer in Merchandising
        await setPermissions();
        // Test permissions for rugs
        await getRugs("user123"); // Admin can read rugs
        await getRugs("user456"); // Viewer can read rugs
        // Test permissions for buyers
        await getBuyers("user123"); // Admin can read buyers
        await getBuyers("user456"); // Viewer cannot read buyers (no permission)
        console.log("✓ Permissions and users setup complete");
        // Check Firestore collections
        await checkFirestoreCollections();
        return true;
    }
    catch (error) {
        console.error("❌ Server initialization failed:", error);
        throw error;
    }
}
const PORT = parseInt(process.env.PORT || "5000", 10);
// Add global error handlers
process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
// Initialize and start server
initializeServer()
    .then(() => {
    console.log("🚀 Starting server...");
    // Try to start on the preferred port, fallback to next available port
    function tryStartServer(port) {
        server
            .listen(port, "0.0.0.0", () => {
            log(`Server running in ${process.env.NODE_ENV} mode on http://0.0.0.0:${port}`);
            console.log(`✅ Server successfully started on port ${port}`);
        })
            .on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.log(`Port ${port} is busy, trying port ${port + 1}`);
                tryStartServer(port + 1);
            }
            else {
                console.error("❌ Server error:", err);
                process.exit(1);
            }
        });
    }
    tryStartServer(PORT);
})
    .catch((err) => {
    console.error("❌ Failed to start server:", err);
    console.error("Error details:", err.message);
    console.error("Stack trace:", err.stack);
    // Still try to start a basic server even if initialization fails
    console.log("🔄 Attempting basic server startup...");
    const basicPort = parseInt(process.env.PORT || "5000", 10);
    // Create a minimal Express app for basic functionality
    const basicApp = express();
    basicApp.use(express.json());
    // Add basic error route that shows what went wrong
    basicApp.get("/", (req, res) => {
        res.status(500).send(`
      <html>
        <head><title>Server Error</title></head>
        <body>
          <h1>Server Initialization Failed</h1>
          <p><strong>Error:</strong> ${err.message}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
          <p><strong>Firebase Project:</strong> ${process.env.FIREBASE_PROJECT_ID || "Not configured"}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <pre>${err.stack}</pre>
        </body>
      </html>
    `);
    });
    basicApp.listen(basicPort, "0.0.0.0", () => {
        console.log(`⚠️  Basic error server running on port ${basicPort}`);
    });
});
