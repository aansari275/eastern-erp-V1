import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { useAuth } from './useAuth';
import type { LabInspection, CreateLabInspection } from '@shared/schema';

export function useLabInspection() {
  const [inspections, setInspections] = useState<LabInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch lab inspections
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('🔬 Setting up lab inspections query for user:', user.email);
    console.log('🔬 Auth state:', { uid: user.uid, email: user.email });
    
    const inspectionsRef = collection(firestore, 'labInspections');
    
    // Try a simple query first without orderBy to avoid index issues
    const q = query(
      inspectionsRef,
      where('materialType', '==', 'dyed')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('📋 Lab inspections snapshot received:', snapshot.size, 'documents');
        
        const inspectionsList: LabInspection[] = snapshot.docs.map(doc => {
          const data = doc.data();
          
          // Convert Firestore timestamps to strings
          const convertTimestamp = (timestamp: any) => {
            if (timestamp && typeof timestamp.toDate === 'function') {
              return timestamp.toDate().toISOString();
            }
            return timestamp;
          };
          
          return {
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
            submittedAt: convertTimestamp(data.submittedAt)
          } as LabInspection;
        });
        
        // Sort by creation date manually
        inspectionsList.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA; // Newest first
        });
        
        setInspections(inspectionsList);
        setLoading(false);
        setError(null);
        
        console.log('✅ Lab inspections updated:', inspectionsList.length, 'total');
      },
      (err) => {
        console.error('❌ Error fetching lab inspections:', err);
        console.error('❌ Full error details:', {
          code: err.code,
          message: err.message,
          stack: err.stack
        });
        
        // Try to provide more context about the error
        if (err.code === 'permission-denied') {
          console.error('❌ Permission denied - check Firestore rules');
          console.error('❌ User auth state:', user ? 'authenticated' : 'not authenticated');
          console.error('❌ User UID:', user?.uid);
        }
        
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Create new lab inspection
  const createInspection = async (inspectionData: CreateLabInspection): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('🔬 Creating new lab inspection...', inspectionData);
      
      const docData = {
        ...inspectionData,
        createdBy: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        materialType: 'dyed' as const
      };

      const docRef = await addDoc(collection(firestore, 'labInspections'), docData);
      console.log('✅ Lab inspection created with ID:', docRef.id);
      
      return docRef.id;
    } catch (err: any) {
      console.error('❌ Error creating lab inspection:', err);
      throw new Error(`Failed to create inspection: ${err.message}`);
    }
  };

  // Update existing lab inspection
  const updateInspection = async (id: string, updates: Partial<LabInspection>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('🔬 Updating lab inspection:', id, updates);
      
      const docRef = doc(firestore, 'labInspections', id);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);
      console.log('✅ Lab inspection updated successfully');
    } catch (err: any) {
      console.error('❌ Error updating lab inspection:', err);
      throw new Error(`Failed to update inspection: ${err.message}`);
    }
  };

  // Submit lab inspection
  const submitInspection = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('🔬 Submitting lab inspection:', id);
      
      const docRef = doc(firestore, 'labInspections', id);
      await updateDoc(docRef, {
        status: 'submitted',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Lab inspection submitted successfully');
    } catch (err: any) {
      console.error('❌ Error submitting lab inspection:', err);
      throw new Error(`Failed to submit inspection: ${err.message}`);
    }
  };

  // Auto-save functionality
  const autoSaveInspection = async (id: string, updates: Partial<LabInspection>): Promise<void> => {
    if (!user) return;

    try {
      const docRef = doc(firestore, 'labInspections', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('💾 Auto-saved lab inspection:', id);
    } catch (err: any) {
      console.error('❌ Auto-save failed:', err);
      // Don't throw error for auto-save failures
    }
  };

  return {
    inspections,
    loading,
    error,
    createInspection,
    updateInspection,
    submitInspection,
    autoSaveInspection
  };
}