import { Router } from 'express';
import { z } from 'zod';
import { listBuyers, createBuyer, updateBuyer, getBuyerById, adminDb } from '../firestoreHelpers';
import { getBuyersFromERP } from '../erpDatabase';

const router = Router();

// GET /api/buyers - Get all buyers (from Firebase and ERP)
router.get('/', async (req, res) => {
  try {
    // Get buyers from Firebase
    const allBuyers = await adminDb.collection("buyers").get();
    const firebaseBuyers: any[] = [];
    allBuyers.forEach(doc => {
      firebaseBuyers.push({ id: doc.id, source: 'firebase', ...doc.data() });
    });

    // Get buyers from ERP
    const erpBuyers = await getBuyersFromERP();
    const formattedERPBuyers = erpBuyers.map(buyer => ({
      id: `erp-${buyer.code}`,
      source: 'erp',
      name: buyer.name,
      code: buyer.code,
      isActive: true
    }));

    // Combine both sources
    const allBuyersData = [...firebaseBuyers, ...formattedERPBuyers];
    res.json(allBuyersData);
  } catch (error) {
    console.error('Error fetching buyers:', error);
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

// POST /api/buyers - Create new buyer
router.post('/', async (req, res) => {
  try {
    const buyerData = {
      name: req.body.name,
      code: req.body.code,
      merchantId: req.body.merchantId,
      reference: req.body.reference || '',
      currency: req.body.currency || 'USD',
      paymentTerms: req.body.paymentTerms || '',
      deliveryAddress: req.body.deliveryAddress || '',
      invoiceAddress: req.body.invoiceAddress || '',
      shipmentMethod: req.body.shipmentMethod || '',
      articleNumbers: req.body.articleNumbers || [],
      notes: req.body.notes || '',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    const newBuyerRef = await adminDb.collection("buyers").add(buyerData);
    const newBuyerDoc = await newBuyerRef.get();
    res.status(201).json({ id: newBuyerDoc.id, ...newBuyerDoc.data() });
  } catch (error) {
    console.error('Error creating buyer:', error);
    res.status(500).json({ error: 'Failed to create buyer' });
  }
});

// PUT /api/buyers/:id - Update buyer
router.put('/:id', async (req, res) => {
  try {
    const buyerId = req.params.id;
    const updateData = {
      name: req.body.name,
      code: req.body.code,
      merchantId: req.body.merchantId,
      reference: req.body.reference || '',
      currency: req.body.currency || 'USD',
      paymentTerms: req.body.paymentTerms || '',
      deliveryAddress: req.body.deliveryAddress || '',
      invoiceAddress: req.body.invoiceAddress || '',
      shipmentMethod: req.body.shipmentMethod || '',
      articleNumbers: req.body.articleNumbers || [],
      notes: req.body.notes || '',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    const buyerRef = adminDb.collection("buyers").doc(buyerId);
    await buyerRef.update(updateData);

    const updatedBuyerDoc = await buyerRef.get();
    if (!updatedBuyerDoc.exists) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    res.json({ id: updatedBuyerDoc.id, ...updatedBuyerDoc.data() });
  } catch (error) {
    console.error('Error updating buyer:', error);
    res.status(500).json({ error: 'Failed to update buyer' });
  }
});

// DELETE /api/buyers/:id - Delete buyer
router.delete('/:id', async (req, res) => {
  try {
    const buyerId = req.params.id;
    const buyerRef = adminDb.collection("buyers").doc(buyerId);
    const buyerDoc = await buyerRef.get();

    if (!buyerDoc.exists) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    await buyerRef.delete();
    res.json({ message: 'Buyer deleted successfully' });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    res.status(500).json({ error: 'Failed to delete buyer' });
  }
});

export default router;