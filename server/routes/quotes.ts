
import { Router } from 'express';
import { z } from 'zod';
import { insertQuoteSchema } from '@shared/schema';
import { adminDb } from '../firestoreHelpers';

const router = Router();

// Helper functions for quotes
async function getQuotes() {
  const snapshot = await adminDb.collection('quotes').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getQuoteById(id: number) {
  const doc = await adminDb.collection('quotes').doc(id.toString()).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function createQuote(quoteData: any) {
  const docRef = await adminDb.collection('quotes').add({
    ...quoteData,
    created_at: new Date(),
    updated_at: new Date()
  });
  const newDoc = await docRef.get();
  return { id: newDoc.id, ...newDoc.data() };
}

async function updateQuote(id: number, updateData: any) {
  const docRef = adminDb.collection('quotes').doc(id.toString());
  await docRef.update({
    ...updateData,
    updated_at: new Date()
  });
  const updatedDoc = await docRef.get();
  if (!updatedDoc.exists) return null;
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteQuote(id: number) {
  await adminDb.collection('quotes').doc(id.toString()).delete();
  return true;
}

// Get all quotes
router.get('/', async (req, res) => {
  try {
    const quotes = await getQuotes();
    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get a specific quote by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid quote ID' });
    }

    const quote = await getQuoteById(id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Create a new quote
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/quotes - Received quote creation request');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
    
    const validatedData = insertQuoteSchema.parse(req.body);
    console.log('✅ Validation successful! Validated data:', JSON.stringify(validatedData, null, 2));
    
    const quote = await createQuote(validatedData);
    console.log('✅ Quote created successfully in storage:', quote);
    
    res.status(201).json(quote);
  } catch (error) {
    console.error('❌ Error in POST /api/quotes:', error);
    
    if (error instanceof z.ZodError) {
      console.error('❌ Zod validation failed:', error.errors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('❌ Unexpected error creating quote:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create quote',
      message: error.message 
    });
  }
});

// Update a quote
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid quote ID' });
    }

    const validatedData = insertQuoteSchema.partial().parse(req.body);
    const quote = await updateQuote(id, validatedData);
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(quote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating quote:', error);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// Delete a quote
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid quote ID' });
    }

    const success = await deleteQuote(id);
    if (!success) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

export default router;
