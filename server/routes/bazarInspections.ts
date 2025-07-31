import { Router } from 'express';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const router = Router();

interface BazarInspectionData {
  inspectionDate: string;
  opsNo: string;
  totalPcs: number;
  passPcs: number;
  reworkPcs: number;
  failPcs: number;
  defectType: string;
  defectPhotos: string[];
  createdAt: any;
}

// Create new bazar inspection
router.post('/', async (req, res) => {
  try {
    const inspectionData: BazarInspectionData = {
      ...req.body,
      createdAt: serverTimestamp()
    };

    console.log('🔍 Creating bazar inspection:', {
      opsNo: inspectionData.opsNo,
      totalPcs: inspectionData.totalPcs,
      photosCount: inspectionData.defectPhotos?.length || 0
    });

    const docRef = await addDoc(collection(db, 'quality_inspections_bazar'), inspectionData);
    
    console.log('✅ Bazar inspection created with ID:', docRef.id);
    
    res.status(201).json({
      success: true,
      id: docRef.id,
      message: 'Bazar inspection created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating bazar inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bazar inspection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all bazar inspections
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching all bazar inspections...');
    
    const querySnapshot = await getDocs(collection(db, 'quality_inspections_bazar'));
    const inspections: any[] = [];
    
    querySnapshot.forEach((doc) => {
      inspections.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${inspections.length} bazar inspections`);
    
    res.status(200).json({
      success: true,
      data: inspections,
      count: inspections.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching bazar inspections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bazar inspections',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single bazar inspection by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching bazar inspection:', id);
    
    const docRef = doc(db, 'quality_inspections_bazar', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Bazar inspection not found'
      });
    }
    
    console.log('✅ Bazar inspection found:', id);
    
    res.status(200).json({
      success: true,
      data: {
        id: docSnap.id,
        ...docSnap.data()
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching bazar inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bazar inspection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update bazar inspection
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: serverTimestamp()
    };
    
    console.log('🔍 Updating bazar inspection:', id);
    
    const docRef = doc(db, 'quality_inspections_bazar', id);
    await updateDoc(docRef, updateData);
    
    console.log('✅ Bazar inspection updated:', id);
    
    res.status(200).json({
      success: true,
      message: 'Bazar inspection updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating bazar inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bazar inspection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete bazar inspection
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Deleting bazar inspection:', id);
    
    const docRef = doc(db, 'quality_inspections_bazar', id);
    await deleteDoc(docRef);
    
    console.log('✅ Bazar inspection deleted:', id);
    
    res.status(200).json({
      success: true,
      message: 'Bazar inspection deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting bazar inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bazar inspection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;