import React from 'react';
import CleanLabInspectionForm from './forms/CleanLabInspectionForm';
import { useToast } from '../hooks/use-toast';
import { firestore } from '../lib/firebase';

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
        createdAt: isEditing ? initialData?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: data.status || 'draft'
      };

      if (isEditing && editingInspectionId) {
        // Update existing inspection
        await firestore.collection('labInspections').doc(editingInspectionId).update(processedData);
        
        toast({
          title: "Success",
          description: "Lab inspection updated successfully",
        });
      } else {
        // Create new inspection
        const result = await firestore.collection('labInspections').add(processedData);
        console.log('Lab inspection created with ID:', result.id);
        
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