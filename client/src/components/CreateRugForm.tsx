import React from 'react';
import EnhancedCreateRugForm from './forms/EnhancedCreateRugForm';
import { useToast } from '../hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

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
      // Add to Firebase
      const docRef = await addDoc(collection(db, 'rugs'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Success",
        description: "Rug sample created successfully",
      });

      // Call parent callback if provided
      if (onSave) {
        onSave({ ...data, id: docRef.id });
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