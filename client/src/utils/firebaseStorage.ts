// Firebase Storage utilities for evidence image uploads
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';

const storage = getStorage();

export const uploadEvidenceImage = async (file: File, auditId: string, itemCode: string): Promise<string> => {
  try {
    const timestamp = Date.now();
    const fileName = `audit-evidence/${auditId}/${itemCode}/${timestamp}-${file.name}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Evidence image uploaded:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ Failed to upload evidence image:', error);
    throw error;
  }
};

export const compressImage = (file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};