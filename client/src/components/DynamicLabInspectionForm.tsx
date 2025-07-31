import React from 'react';
import CleanLabInspectionForm from './forms/CleanLabInspectionForm';
import { useToast } from '../hooks/use-toast';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

type Company = 'EHI' | 'EM' | 'RG';

interface DynamicLabInspectionFormProps {
  selectedCompany?: Company;
  editingInspectionId?: string | null;
  onFormClose?: () => void;
  initialData?: any;
}

const DynamicLabInspectionForm: React.FC<DynamicLabInspectionFormProps> = ({ 
  selectedCompany = 'EHI',
  editingInspectionId,
  onFormClose,
  initialData
}) => {
  const { toast } = useToast();
  const isEditing = !!editingInspectionId;

  const handleSubmit = async (data: any) => {
    try {
      const processedData = {
        ...data,
        company: selectedCompany,
        createdAt: isEditing ? initialData?.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (isEditing && editingInspectionId) {
        // Update existing inspection
        const docRef = doc(db, 'labInspections', editingInspectionId);
        await updateDoc(docRef, processedData);
        
        toast({
          title: "Success",
          description: "Lab inspection updated successfully",
        });
      } else {
        // Create new inspection
        await addDoc(collection(db, 'labInspections'), processedData);
        
        toast({
          title: "Success",
          description: "Lab inspection created successfully",
        });
      }

      // Close form if callback provided
      if (onFormClose) {
        onFormClose();
      }
    } catch (error) {
      console.error('Error saving lab inspection:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} lab inspection. Please try again.`,
        variant: "destructive",
      });
      throw error; // Re-throw to prevent form from clearing
    }
  };

  return (
    <CleanLabInspectionForm
      mode={isEditing ? 'edit' : 'create'}
      onSubmit={handleSubmit}
      onCancel={onFormClose}
      initialData={{
        company: selectedCompany,
        ...initialData,
      }}
    />
  );
};

export default DynamicLabInspectionForm;