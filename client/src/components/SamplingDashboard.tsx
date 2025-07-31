import React, { useState, useCallback } from 'react';
import { Badge } from './ui/badge';
import { Plus, Grid, Package, LogOut, Building2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { useAccessControl } from '../hooks/useAccessControl';
import RugForm from './RugForm';
import RugGallery from './RugGallery';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';

const SamplingDashboard = () => {
  const { user, logout } = useAuth();
  const { canViewTab, canEdit } = useAccessControl();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('create');
  const [editingRug, setEditingRug] = useState<any>(null);

  // Fetch rugs data
  const { data: rugs = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/rugs'],
    queryFn: async () => {
      const response = await fetch('/api/rugs');
      if (!response.ok) throw new Error('Failed to fetch rugs');
      return response.json();
    },
  });

  const handleSaveRug = async (rugData: any) => {
    try {
      const url = editingRug ? `/api/rugs/${editingRug.id}` : '/api/rugs';
      const method = editingRug ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rugData),
      });

      if (!response.ok) {
        throw new Error('Failed to save rug');
      }

      const result = await response.json();
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/rugs'] });
      
      toast({
        title: editingRug ? 'Rug Updated' : 'Rug Created',
        description: `${rugData.designName} has been ${editingRug ? 'updated' : 'created'} successfully.`,
      });

      // Clear editing state and switch to gallery
      setEditingRug(null);
      setActiveTab('gallery');
      
      return result;
    } catch (error) {
      console.error('Error saving rug:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rug. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleEditRug = (rug: any) => {
    setEditingRug(rug);
    setActiveTab('create');
  };

  const handleResetForm = () => {
    setEditingRug(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading Sampling Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Clean Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sampling Department</h1>
        <p className="text-gray-600">Create and manage rug samples with technical specifications</p>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {canViewTab('gallery') && (
            <Button 
              variant={activeTab === 'gallery' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('gallery')}
              className="flex items-center gap-2"
            >
              <Grid className="h-4 w-4" />
              <span>View Gallery</span>
              {rugs.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {rugs.length}
                </Badge>
              )}
            </Button>
          )}
          {canViewTab('quotes') && (
            <Button 
              variant={activeTab === 'quotes' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('quotes')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span>Quote History</span>
            </Button>
          )}
        </div>
        {activeTab !== 'create' && canViewTab('create') && (
          <Button onClick={() => setActiveTab('create')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>{editingRug ? 'Continue Editing' : 'Create New Rug'}</span>
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="w-full">

        {/* Create Rug Form - Default View */}
        {activeTab === 'create' && canViewTab('create') && (
          <div className="bg-white rounded-lg shadow-sm border-0">
            <RugForm
              rug={editingRug}
              onSave={handleSaveRug}
              onReset={handleResetForm}
              onBack={() => setActiveTab('gallery')}
            />
          </div>
        )}

        {/* Rug Gallery */}
        {activeTab === 'gallery' && canViewTab('gallery') && (
          <RugGallery
            rugs={rugs}
            onEditRug={canEdit('gallery') ? handleEditRug : undefined}
            onDeleteRugs={canEdit('gallery') ? async (rugIds) => {
              // Implementation for bulk delete
              for (const rugId of rugIds) {
                await fetch(`/api/rugs/${rugId}`, { method: 'DELETE' });
              }
              await queryClient.invalidateQueries({ queryKey: ['/api/rugs'] });
              toast({
                title: 'Rugs Deleted',
                description: `${rugIds.length} rug(s) have been deleted.`,
              });
            } : undefined}
            onImageUpload={canEdit('gallery') ? async (rugId, imageIndex, file) => {
              try {
                console.log(`🔄 Direct upload ${imageIndex} for rug ${rugId}:`, file.name, `(${Math.round(file.size/1024)}KB)`);
                
                // COMPRESSION: Use same aggressive compression as RugForm
                const compressImage = (file: File, maxSizeKB = 200): Promise<string> => {
                  return new Promise((resolve, reject) => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    
                    img.onload = () => {
                      // AGGRESSIVE: Use small dimensions (400x300)
                      const maxWidth = 400;
                      const maxHeight = 300;
                      let { width, height } = img;
                      
                      // Calculate new dimensions maintaining aspect ratio
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
                      
                      // Draw image
                      ctx?.drawImage(img, 0, 0, width, height);
                      
                      // AGGRESSIVE: Start with 0.7 quality and reduce iteratively
                      let quality = 0.7;
                      let attempts = 0;
                      const maxAttempts = 10;
                      
                      const compress = () => {
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                        const sizeKB = (compressedDataUrl.length * 3) / 4 / 1024;
                        
                        console.log(`Compression attempt ${attempts + 1}: ${Math.round(sizeKB)}KB at quality ${quality.toFixed(2)}`);
                        
                        if (sizeKB <= maxSizeKB || attempts >= maxAttempts || quality <= 0.1) {
                          console.log(`Final compression: ${Math.round(sizeKB)}KB`);
                          resolve(compressedDataUrl);
                        } else {
                          // Reduce quality more aggressively
                          quality = Math.max(0.1, quality * 0.8);
                          attempts++;
                          compress();
                        }
                      };
                      
                      compress();
                    };
                    img.onerror = () => reject(new Error('Failed to load image'));
                    img.src = URL.createObjectURL(file);
                  });
                };

                // Validate file type
                if (!file.type.startsWith('image/')) {
                  toast({
                    title: "Invalid File Type",
                    description: "Please select a valid image file (JPG, PNG, GIF, etc.)",
                    variant: "destructive"
                  });
                  return;
                }

                // Compress image
                const compressedBase64 = await compressImage(file, 200);
                const finalSizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
                
                console.log(`✅ Compressed to ${finalSizeKB}KB for direct upload`);
                
                // Strict size check
                if (finalSizeKB > 200) {
                  toast({
                    title: "Compression Failed", 
                    description: `Unable to compress under 200KB (current: ${finalSizeKB}KB). Please use a smaller image.`,
                    variant: "destructive"
                  });
                  return;
                }
                
                // Map imageIndex to field name
                const imageFields = ['rugImage1', 'rugImage1', 'rugImage2', 'rugImage3', 'rugImage4', 'rugImage5'];
                const fieldName = imageFields[imageIndex] || 'rugImage1';
                
                // Update rug via API
                const response = await fetch(`/api/rugs/${rugId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    images: {
                      [fieldName]: compressedBase64
                    }
                  }),
                });
                
                if (!response.ok) throw new Error('Failed to upload image');
                
                await queryClient.invalidateQueries({ queryKey: ['/api/rugs'] });
                toast({
                  title: '✅ Image Uploaded',
                  description: `${fieldName} compressed to ${finalSizeKB}KB and saved successfully.`,
                });
              } catch (error) {
                console.error('Error uploading image:', error);
                toast({
                  title: 'Upload Error',
                  description: 'Failed to upload image. Please try again.',
                  variant: 'destructive',
                });
              }
            } : undefined}
            onImageDelete={canEdit('gallery') ? async (rugId, imageIndex) => {
              try {
                // Map imageIndex to field name
                const imageFields = ['rugImage1', 'rugImage1', 'rugImage2', 'rugImage3', 'rugImage4', 'rugImage5'];
                const fieldName = imageFields[imageIndex] || 'rugImage1';
                
                const response = await fetch(`/api/rugs/${rugId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    images: {
                      [fieldName]: null
                    }
                  }),
                });
                
                if (!response.ok) throw new Error('Failed to delete image');
                
                await queryClient.invalidateQueries({ queryKey: ['/api/rugs'] });
                toast({
                  title: 'Image Deleted',
                  description: `${fieldName} has been removed successfully.`,
                });
              } catch (error) {
                console.error('Error deleting image:', error);
                toast({
                  title: 'Delete Error', 
                  description: 'Failed to delete image. Please try again.',
                  variant: 'destructive',
                });
              }
            } : undefined}
          />
        )}

        {/* Quote History */}
        {activeTab === 'quotes' && canViewTab('quotes') && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Quote History</h3>
              <p className="text-gray-500 mb-6">
                Track and manage your rug quotations and pricing history
              </p>
              <div className="space-y-4 max-w-md mx-auto text-left">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Coming Soon Features:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• View all submitted quotations</li>
                    <li>• Track quote status and responses</li>
                    <li>• Historical pricing analytics</li>
                    <li>• Export quote reports</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SamplingDashboard;
