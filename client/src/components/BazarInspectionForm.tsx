import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Calendar, Upload, X, Save, ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface BazarInspectionData {
  inspectionDate: string;
  opsNo: string;
  totalPcs: number;
  passPcs: number;
  reworkPcs: number;
  failPcs: number;
  defectType: string;
  defectPhotos: string[];
}

interface BazarInspectionFormProps {
  onBack?: () => void;
}

export function BazarInspectionForm({ onBack }: BazarInspectionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<{ [key: number]: boolean }>({});
  
  const [formData, setFormData] = useState<BazarInspectionData>({
    inspectionDate: new Date().toISOString().split('T')[0],
    opsNo: '',
    totalPcs: 0,
    passPcs: 0,
    reworkPcs: 0,
    failPcs: 0,
    defectType: '',
    defectPhotos: []
  });

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.inspectionDate) {
      newErrors.inspectionDate = 'Inspection date is required';
    }
    
    if (!formData.opsNo.trim()) {
      newErrors.opsNo = 'OPS No. is required';
    }
    
    if (formData.totalPcs <= 0) {
      newErrors.totalPcs = 'Total pieces must be greater than 0';
    }
    
    if (formData.passPcs + formData.reworkPcs + formData.failPcs !== formData.totalPcs) {
      newErrors.calculation = 'Pass + Rework + Fail pieces must equal Total pieces';
    }
    
    if (!formData.defectType.trim()) {
      newErrors.defectType = 'Type of defect is required';
    }
    
    if (photoFiles.length === 0) {
      newErrors.photos = 'At least one defect photo is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BazarInspectionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotoFiles(prev => [...prev, file]);
          setPhotoPreviewUrls(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Clear the input
    event.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotosToFirebase = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < photoFiles.length; i++) {
      setUploadingPhotos(prev => ({ ...prev, [i]: true }));
      
      try {
        const formData = new FormData();
        formData.append('file', photoFiles[i]);
        formData.append('path', `bazar_inspections/${Date.now()}`);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          uploadedUrls.push(result.url);
        } else {
          throw new Error('Failed to upload photo');
        }
      } catch (error) {
        console.error('Photo upload failed:', error);
        throw error;
      } finally {
        setUploadingPhotos(prev => ({ ...prev, [i]: false }));
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload photos first
      const photoUrls = await uploadPhotosToFirebase();
      
      // Prepare data for Firebase
      const inspectionData = {
        ...formData,
        defectPhotos: photoUrls,
        createdAt: new Date().toISOString()
      };
      
      // Save to Firestore
      const response = await fetch('/api/bazar-inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inspectionData)
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Bazar inspection saved successfully!",
          variant: "default"
        });
        
        // Clear form
        setFormData({
          inspectionDate: new Date().toISOString().split('T')[0],
          opsNo: '',
          totalPcs: 0,
          passPcs: 0,
          reworkPcs: 0,
          failPcs: 0,
          defectType: '',
          defectPhotos: []
        });
        setPhotoFiles([]);
        setPhotoPreviewUrls([]);
        setErrors({});
        
      } else {
        throw new Error('Failed to save inspection');
      }
      
    } catch (error) {
      console.error('Submission failed:', error);
      toast({
        title: "Error",
        description: "Failed to save inspection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      inspectionDate: new Date().toISOString().split('T')[0],
      opsNo: '',
      totalPcs: 0,
      passPcs: 0,
      reworkPcs: 0,
      failPcs: 0,
      defectType: '',
      defectPhotos: []
    });
    setPhotoFiles([]);
    setPhotoPreviewUrls([]);
    setErrors({});
    
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bazar Inspection Form</h1>
          <p className="text-gray-600">Quality control inspection for market-ready products</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Inspection Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inspectionDate">Inspection Date *</Label>
              <Input
                id="inspectionDate"
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
                className={errors.inspectionDate ? 'border-red-500' : ''}
              />
              {errors.inspectionDate && (
                <p className="text-sm text-red-600">{errors.inspectionDate}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="opsNo">OPS No. *</Label>
              <Input
                id="opsNo"
                placeholder="Enter OPS number"
                value={formData.opsNo}
                onChange={(e) => handleInputChange('opsNo', e.target.value)}
                className={errors.opsNo ? 'border-red-500' : ''}
              />
              {errors.opsNo && (
                <p className="text-sm text-red-600">{errors.opsNo}</p>
              )}
            </div>
          </div>

          {/* Piece Counts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Piece Counts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalPcs">Total Pcs *</Label>
                <Input
                  id="totalPcs"
                  type="number"
                  min="0"
                  value={formData.totalPcs}
                  onChange={(e) => handleInputChange('totalPcs', parseInt(e.target.value) || 0)}
                  className={errors.totalPcs ? 'border-red-500' : ''}
                />
                {errors.totalPcs && (
                  <p className="text-sm text-red-600">{errors.totalPcs}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passPcs">Pass Pcs</Label>
                <Input
                  id="passPcs"
                  type="number"
                  min="0"
                  value={formData.passPcs}
                  onChange={(e) => handleInputChange('passPcs', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reworkPcs">Re-work/Re-inspection Pcs</Label>
                <Input
                  id="reworkPcs"
                  type="number"
                  min="0"
                  value={formData.reworkPcs}
                  onChange={(e) => handleInputChange('reworkPcs', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="failPcs">Fail Pcs</Label>
                <Input
                  id="failPcs"
                  type="number"
                  min="0"
                  value={formData.failPcs}
                  onChange={(e) => handleInputChange('failPcs', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            {errors.calculation && (
              <p className="text-sm text-red-600">{errors.calculation}</p>
            )}
          </div>

          {/* Defect Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Defect Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="defectType">Type of Defect *</Label>
              <Textarea
                id="defectType"
                placeholder="Describe the type of defects found..."
                rows={4}
                value={formData.defectType}
                onChange={(e) => handleInputChange('defectType', e.target.value)}
                className={errors.defectType ? 'border-red-500' : ''}
              />
              {errors.defectType && (
                <p className="text-sm text-red-600">{errors.defectType}</p>
              )}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Defect Photos *</h3>
            
            {/* Photo Previews */}
            {photoPreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photoPreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Defect photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    {uploadingPhotos[index] && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={uploadingPhotos[index]}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add Photo Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="photoUpload"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Label
                htmlFor="photoUpload"
                className="cursor-pointer flex flex-col items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <Plus className="h-8 w-8" />
                <span className="font-medium">Add Photo</span>
                <span className="text-sm">Click to upload defect photos</span>
              </Label>
            </div>
            
            {errors.photos && (
              <p className="text-sm text-red-600">{errors.photos}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.values(uploadingPhotos).some(Boolean)}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Inspection
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}