import { Router } from 'express';
import { getMaterials, getMaterialRate } from '../erpDatabase';

const router = Router();

// GET /api/materials - Get all materials from ERP
router.get('/', async (req, res) => {
  try {
    console.log('Fetching materials from ERP database...');
    const materials = await getMaterials();
    res.json(materials);
  } catch (error: any) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ 
      error: 'Failed to fetch materials from ERP database',
      details: error.message 
    });
  }
});

// GET /api/materials/rate/:name - Get rate for specific material
router.get('/rate/:name', async (req, res) => {
  try {
    const materialName = decodeURIComponent(req.params.name);
    console.log(`Fetching rate for material: ${materialName}`);
    
    const materialInfo = await getMaterialRate(materialName);
    res.json(materialInfo);
  } catch (error: any) {
    console.error('Error fetching material rate:', error);
    res.status(500).json({ 
      error: 'Failed to fetch material rate from ERP database',
      details: error.message 
    });
  }
});

export default router;