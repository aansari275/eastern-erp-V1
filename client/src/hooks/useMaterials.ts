import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { auth, firestore as db } from '../lib/firebase';
import { MaterialDatabaseItem } from '../types/rug';

export const useMaterials = () => {
  const [materials, setMaterials] = useState<MaterialDatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const appId = 'rug-tracker';
    
    const materialsRef = collection(db, `artifacts/${appId}/users/${userId}/materials`);
    const q = query(materialsRef, orderBy('name', 'asc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const materialsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as MaterialDatabaseItem[];
        
        setMaterials(materialsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching materials:', err);
        setError('Failed to fetch materials');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth.currentUser]);

  const addMaterial = async (materialData: Omit<MaterialDatabaseItem, 'id'>) => {
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    const userId = auth.currentUser.uid;
    const appId = 'rug-tracker';
    
    const materialsRef = collection(db, `artifacts/${appId}/users/${userId}/materials`);
    await addDoc(materialsRef, materialData);
  };

  const updateMaterial = async (materialId: string, materialData: Partial<MaterialDatabaseItem>) => {
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    const userId = auth.currentUser.uid;
    const appId = 'rug-tracker';
    
    const materialRef = doc(db, `artifacts/${appId}/users/${userId}/materials`, materialId);
    await updateDoc(materialRef, materialData);
  };

  const deleteMaterial = async (materialId: string) => {
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    const userId = auth.currentUser.uid;
    const appId = 'rug-tracker';
    
    const materialRef = doc(db, `artifacts/${appId}/users/${userId}/materials`, materialId);
    await deleteDoc(materialRef);
  };

  const getWarpMaterials = () => materials.filter(m => m.type === 'warp');
  const getWeftMaterials = () => materials.filter(m => m.type === 'weft');

  return {
    materials,
    loading,
    error,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getWarpMaterials,
    getWeftMaterials,
  };
};
