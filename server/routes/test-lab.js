import express from 'express';
const router = express.Router();
// Simple test route to verify routing works
router.get('/', (req, res) => {
    console.log('🧪 Test lab route hit!');
    res.json({
        message: 'Test lab route working!',
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});
export default router;
