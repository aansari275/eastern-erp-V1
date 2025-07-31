import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Plus, X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { uploadMultipleEvidenceImages } from '@/utils/firebaseStorage';

// Compress image to reduce file size before upload
const compressImage = (file: File, quality: number = 0.3, maxWidth: number = 400, maxHeight: number = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        } else {
          reject(new Error('Canvas to blob conversion failed'));
        }
      }, 'image/jpeg', quality);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  title?: string;
  className?: string;
  auditId?: string;
  questionCode?: string;
}

export function MultiImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 10, 
  title = "Evidence Images",
  className = "",
  auditId = "",
  questionCode = ""
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFirebaseUpload = async (files: File[]) => {
    if (!auditId || !questionCode) {
      console.warn('Missing auditId or questionCode for Firebase upload');
      return;
    }

    console.log(`🔥 FIREBASE UPLOAD START: Audit ${auditId}, Question ${questionCode}, Files: ${files.length}`);

    setIsUploading(true);
    setUploadProgress({ completed: 0, total: files.length });

    toast({
      title: "Saving evidence...",
      description: `Uploading ${files.length} image(s) to storage`,
      duration: 2000
    });

    try {
      // Upload files to Firebase Storage and get URLs
      const uploadedUrls = await uploadMultipleEvidenceImages(
        files, 
        auditId, 
        questionCode,
        (completed, total) => {
          setUploadProgress({ completed, total });
          console.log(`📊 UPLOAD PROGRESS: ${completed}/${total} files uploaded`);
        }
      );

      console.log(`✅ FIREBASE UPLOAD SUCCESS: Got ${uploadedUrls.length} URLs:`);
      uploadedUrls.forEach((url, index) => {
        console.log(`  URL ${index + 1}: ${url}`);
      });

      // Add the new URLs to existing images
      const newImages = [...images, ...uploadedUrls];
      console.log(`🔄 UPDATING STATE: Question ${questionCode} now has ${newImages.length} total images`);
      onImagesChange(newImages);

      toast({
        title: "Evidence saved",
        description: `${files.length} image(s) uploaded successfully`,
      });

    } catch (error) {
      console.error('❌ FIREBASE UPLOAD ERROR:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({ completed: 0, total: 0 });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({ 
        title: "Too many images", 
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive"
      });
      return;
    }

    // Validate and filter files
    const validFiles: File[] = [];

    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        continue;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB.`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // If we have auditId and questionCode, upload to Firebase Storage
    if (auditId && questionCode) {
      await handleFirebaseUpload(validFiles);
    } else {
      // Fallback to local processing for preview (for older components)
      setIsUploading(true);
      try {
        const newImages: string[] = [];

        for (const file of validFiles) {
          const compressedImage = await compressImage(file, 0.3, 400, 300);

          // Check compressed size
          const sizeKB = (compressedImage.length * 3) / 4 / 1024;
          if (sizeKB > 200) {
            toast({
              title: "Image too large",
              description: `Image ${file.name} is ${Math.round(sizeKB)}KB. Please use smaller images.`,
              variant: "destructive",
            });
            continue;
          }

          newImages.push(compressedImage);
        }

        if (newImages.length > 0) {
          onImagesChange([...images, ...newImages]);
          toast({
            title: "Images uploaded",
            description: `${newImages.length} image(s) added successfully.`,
          });
        }
      } catch (error) {
        console.error('Error processing images:', error);
        toast({
          title: "Upload failed",
          description: "Failed to process images",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast({
      title: "Image removed",
      description: "Image deleted successfully",
    });
  };

  const openFileDialog = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        {isUploading && uploadProgress.total > 0 && (
          <div className="text-xs text-blue-600">
            Uploading {uploadProgress.completed}/{uploadProgress.total}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Existing Images */}
        {images.map((image, index) => (
          <Card key={index} className="relative aspect-square overflow-hidden">
            <img
              src={image}
              alt={`Evidence ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-1 right-1 h-6 w-6 p-0"
              onClick={() => removeImage(index)}
              disabled={isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </Card>
        ))}

        {/* Add New Image Button */}
        {images.length < maxImages && (
          <Card 
            className="aspect-square border-dashed border-2 border-gray-300 hover:border-blue-500 cursor-pointer transition-colors flex items-center justify-center"
            onClick={openFileDialog}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center text-blue-600">
                <Loader2 className="h-6 w-6 animate-spin mb-1" />
                <span className="text-xs">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Plus className="h-6 w-6 mb-1" />
                <span className="text-xs">Add Image</span>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      {/* Image Count Info */}
      {images.length > 0 && (
        <p className="text-xs text-gray-500">
          {images.length} of {maxImages} images uploaded
        </p>
      )}
    </div>
  );
}