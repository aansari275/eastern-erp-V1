import { Router } from 'express';
import { getAllRugs, getRugsByUser, getRugById, createRug, updateRug, deleteRug } from '../firestoreHelpers';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();

// GET /api/rugs - Get all rugs
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all rugs from Firebase...');
    const rugs = await getAllRugs();
    console.log(`Found ${rugs.length} rugs`);
    res.json(rugs);
  } catch (error: any) {
    console.error('Error fetching rugs from Firebase:', error);
    
    // Fallback to comprehensive dataset if Firebase is not available
    try {
      console.log('🔄 Fallback: Loading comprehensive rugs dataset...');
      const comprehensivePath = join(process.cwd(), 'comprehensive-90-rugs.json');
      const comprehensiveData = readFileSync(comprehensivePath, 'utf-8');
      const comprehensiveRugs = JSON.parse(comprehensiveData);
      console.log(`✅ Loaded ${comprehensiveRugs.length} comprehensive rugs`);
      res.json(comprehensiveRugs);
    } catch (fallbackError: any) {
      console.error('Error loading sample data:', fallbackError);
      res.status(500).json({ error: 'Unable to load rugs data. Please check Firebase configuration.' });
    }
  }
});

// GET /api/rugs/:userId - Get rugs for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const rugs = await getRugsByUser(userId);
    res.json(rugs);
  } catch (error: any) {
    console.error('Error fetching user rugs:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rugs/:id - Get a specific rug
router.get('/:id', async (req, res) => {
  try {
    const rugId = req.params.id;
    const rug = await getRugById(rugId);
    if (!rug) {
      return res.status(404).json({ error: 'Rug not found' });
    }
    res.json(rug);
  } catch (error: any) {
    console.error('Error fetching rug:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rugs - Create a new rug
router.post('/', async (req, res) => {
  try {
    const rugData = req.body;
    const newRug = await createRug(rugData);
    res.status(201).json(newRug);
  } catch (error: any) {
    console.error('Error creating rug:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/rugs/:id - Update a rug
router.put('/:id', async (req, res) => {
  try {
    const rugId = req.params.id;
    const updateData = req.body;
    const updatedRug = await updateRug(rugId, updateData);
    if (!updatedRug) {
      return res.status(404).json({ error: 'Rug not found' });
    }
    res.json(updatedRug);
  } catch (error: any) {
    console.error('Error updating rug:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/rugs/:id - Delete a rug
router.delete('/:id', async (req, res) => {
  try {
    const rugId = req.params.id;
    await deleteRug(rugId);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting rug:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;