import React from 'react';
import EnhancedCreateRugForm from './forms/EnhancedCreateRugForm';
import { useToast } from '../hooks/use-toast';
import { firestore } from '../lib/firebase';

interface CreateRugFormProps {
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

const CreateRugForm: React.FC<CreateRugFormProps> = ({ 
  onSave, 
  onCancel, 
  initialData 
}) => {
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      // Add to Firestore
      const result = await firestore.collection('rugs').add({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Rug sample created successfully",
      });

      // Call parent callback if provided
      if (onSave) {
        onSave({ ...data, id: result.id });
      }
    } catch (error) {
      console.error('Error saving rug:', error);
      toast({
        title: "Error",
        description: "Failed to create rug sample. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to prevent form from clearing
    }
  };

  return (
    <EnhancedCreateRugForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      initialData={initialData}
    />
  );
};

export default CreateRugForm;