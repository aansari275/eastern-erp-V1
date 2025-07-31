import express from 'express';
import { getOPSOrders, getOPSOrderDetails } from '../erpDatabase';
const router = express.Router();
// GET /api/ops - Fetch all OPS orders from ERP database
router.get('/', async (req, res) => {
    try {
        console.log('🔍 API /api/ops called - Fetching OPS orders from ERP...');
        const orders = await getOPSOrders();
        console.log(`📊 Found ${orders.length} OPS orders, sending JSON response`);
        res.setHeader('Content-Type', 'application/json');
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching OPS orders:', error);
        res.status(500).json({ error: 'Failed to fetch OPS orders' });
    }
});
// GET /api/ops/:boId/details - Fetch order details for specific bo_id
router.get('/:boId/details', async (req, res) => {
    try {
        const { boId } = req.params;
        console.log(`🔍 API /api/ops/${boId}/details called - Fetching order details...`);
        const orderDetails = await getOPSOrderDetails(boId);
        console.log(`📊 Found ${orderDetails.length} items for OPS ${boId}`);
        res.setHeader('Content-Type', 'application/json');
        res.json(orderDetails);
    }
    catch (error) {
        console.error('Error fetching OPS order details:', error);
        res.status(500).json({ error: 'Failed to fetch OPS order details' });
    }
});
export default router;
