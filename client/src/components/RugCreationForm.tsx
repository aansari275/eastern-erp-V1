import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Upload, X, Plus, FileImage, Save, RotateCcw } from 'lucide-react';
import { rugDataService, type RugData } from '../services/rugDataService';

interface RugCreationFormProps {
  onSave?: (rugData: RugData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<RugData>;
}

const RugCreationForm: React.FC<RugCreationFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<RugData>>({
    articleNumber: '',
    buyerCode: '',
    construction: '',
    designName: '',
    colour: '',
    size: '',
    material: '',
    description: '',
    status: 'draft',
    images: [],
    ...initialData
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const constructionOptions = [
    'Hand Knotted',
    'Nepali',
    'Punja',
    'Pitloom',
    'Handloom',
    'Tufted',
    'Table Tufted',
    'VDW',
    'Jaquard'
  ];

  const sizeOptions = [
    '2x3',
    '3x5',
    '4x6',
    '5x8',
    '6x9',
    '8x10',
    '9x12',
    '10x14',
    'Custom'
  ];

  const materialOptions = [
    'Wool',
    'Cotton',
    'Silk',
    'Viscose',
    'Jute',
    'Wool & Cotton',
    'Wool & Silk',
    'Cotton & Jute',
    'Mixed Materials'
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'production', label: 'In Production' },
    { value: 'completed', label: 'Completed' }
  ];

  const colorOptions = [
    'Ivory', 'White', 'Cream', 'Beige', 'Sand', 'Camel', 'Brown',
    'Grey', 'Charcoal', 'Black', 'Red', 'Blue', 'Navy', 'Green',
    'Olive', 'Gold', 'Yellow', 'Orange', 'Pink', 'Purple', 'Multi'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.articleNumber?.trim()) {
      newErrors.articleNumber = 'Article number is required';
    }
    if (!formData.buyerCode?.trim()) {
      newErrors.buyerCode = 'Buyer code is required';
    }
    if (!formData.designName?.trim()) {
      newErrors.designName = 'Design name is required';
    }
    if (!formData.construction) {
      newErrors.construction = 'Construction is required';
    }
    if (!formData.colour) {
      newErrors.colour = 'Colour is required';
    }
    if (!formData.size) {
      newErrors.size = 'Size is required';
    }
    if (!formData.material) {
      newErrors.material = 'Material is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RugData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - imageFiles.length); // Limit to 5 images total
    setImageFiles(prev => [...prev, ...newFiles]);

    // Convert to base64 for preview and storage
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), base64]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const rugData: RugData = {
        id: initialData?.id || crypto.randomUUID(),
        articleNumber: formData.articleNumber!,
        buyerCode: formData.buyerCode!,
        construction: formData.construction!,
        designName: formData.designName!,
        colour: formData.colour!,
        size: formData.size!,
        material: formData.material!,
        description: formData.description || '',
        status: formData.status || 'draft',
        images: formData.images || [],
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user', // This should come from auth context
        specifications: formData.specifications,
        costingData: formData.costingData,
        productionNotes: formData.productionNotes
      };

      if (onSave) {
        await onSave(rugData);
      } else {
        // Default save to service
        if (initialData?.id) {
          await rugDataService.updateRug(initialData.id, rugData);
        } else {
          await rugDataService.createRug(rugData);
        }
      }

      // Reset form after successful save
      handleReset();
    } catch (error) {
      console.error('Failed to save rug:', error);
      alert('Failed to save rug. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      articleNumber: '',
      buyerCode: '',
      construction: '',
      designName: '',
      colour: '',
      size: '',
      material: '',
      description: '',
      status: 'draft',
      images: []
    });
    setImageFiles([]);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            {initialData?.id ? 'Edit Rug' : 'Create New Rug'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Article Number *
              </label>
              <Input
                value={formData.articleNumber || ''}
                onChange={(e) => handleInputChange('articleNumber', e.target.value)}
                placeholder="Enter article number"
                className={errors.articleNumber ? 'border-red-500' : ''}
              />
              {errors.articleNumber && (
                <p className="text-sm text-red-500">{errors.articleNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Buyer Code *
              </label>
              <Input
                value={formData.buyerCode || ''}
                onChange={(e) => handleInputChange('buyerCode', e.target.value)}
                placeholder="Enter buyer code"
                className={errors.buyerCode ? 'border-red-500' : ''}
              />
              {errors.buyerCode && (
                <p className="text-sm text-red-500">{errors.buyerCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Design Name *
              </label>
              <Input
                value={formData.designName || ''}
                onChange={(e) => handleInputChange('designName', e.target.value)}
                placeholder="Enter design name"
                className={errors.designName ? 'border-red-500' : ''}
              />
              {errors.designName && (
                <p className="text-sm text-red-500">{errors.designName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Construction *
              </label>
              <Select 
                value={formData.construction || ''} 
                onValueChange={(value) => handleInputChange('construction', value)}
              >
                <SelectTrigger className={errors.construction ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select construction" />
                </SelectTrigger>
                <SelectContent>
                  {constructionOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.construction && (
                <p className="text-sm text-red-500">{errors.construction}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Colour *
              </label>
              <Select 
                value={formData.colour || ''} 
                onValueChange={(value) => handleInputChange('colour', value)}
              >
                <SelectTrigger className={errors.colour ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select colour" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(color => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.colour && (
                <p className="text-sm text-red-500">{errors.colour}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Size *
              </label>
              <Select 
                value={formData.size || ''} 
                onValueChange={(value) => handleInputChange('size', value)}
              >
                <SelectTrigger className={errors.size ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map(size => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.size && (
                <p className="text-sm text-red-500">{errors.size}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Material *
              </label>
              <Select 
                value={formData.material || ''} 
                onValueChange={(value) => handleInputChange('material', value)}
              >
                <SelectTrigger className={errors.material ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materialOptions.map(material => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.material && (
                <p className="text-sm text-red-500">{errors.material}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <Select 
                value={formData.status || 'draft'} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          status.value === 'completed' ? 'default' :
                          status.value === 'approved' ? 'secondary' :
                          status.value === 'production' ? 'destructive' :
                          'outline'
                        }>
                          {status.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter detailed description of the rug..."
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              Images (Max: 5)
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
              />
              
              {imageFiles.length === 0 ? (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageFiles.length >= 5}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Images
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, JPEG up to 10MB each
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {imageFiles.length < 5 && (
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add More Images
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {initialData?.id ? 'Update Rug' : 'Create Rug'}
                </div>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RugCreationForm;