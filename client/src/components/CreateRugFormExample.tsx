import React, { useState } from 'react';
import CreateRugForm from './CreateRugForm';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, ArrowLeft, Package } from 'lucide-react';

/**
 * Example component demonstrating how to use the CreateRugForm
 * This shows different integration patterns and success handling
 */
const CreateRugFormExample: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [createdRugId, setCreatedRugId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = (rugId: string) => {
    setCreatedRugId(rugId);
    setShowSuccess(true);
    setShowForm(false);
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setCreatedRugId(null);
    }, 5000);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (showSuccess && createdRugId) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  Rug Created Successfully!
                </h3>
                <p className="text-green-700 mt-2">
                  Your new rug sample has been created with ID: <code className="bg-green-200 px-2 py-1 rounded text-sm">{createdRugId}</code>
                </p>
              </div>
              <div className="flex justify-center space-x-3">
                <Button onClick={() => setShowForm(true)} variant="outline">
                  Create Another Rug
                </Button>
                <Button onClick={() => console.log('Navigate to rug gallery')}>
                  View in Gallery
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
          </div>

          {/* Form */}
          <CreateRugForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  // Landing/Overview State
  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Rug Creation Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Create New Rug Sample
              </h3>
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                Use our comprehensive form to create detailed rug samples with specifications, 
                images, and all necessary production information. All data is automatically 
                saved to Firebase Firestore.
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              size="lg"
              className="mt-6"
            >
              Start Creating Rug
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Comprehensive Fields</h4>
              <p className="text-sm text-gray-600">
                Article number, buyer code, construction type, design name, and more
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Color Palette</h4>
              <p className="text-sm text-gray-600">
                Visual color selector with predefined rug colors
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Image Upload</h4>
              <p className="text-sm text-gray-600">
                Multiple image upload with preview and Firebase storage
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Real-time Validation</h4>
              <p className="text-sm text-gray-600">
                Form validation with helpful error messages
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Firebase Integration</h4>
              <p className="text-sm text-gray-600">
                Automatic saving to Firestore with user authentication
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Responsive Design</h4>
              <p className="text-sm text-gray-600">
                Works perfectly on desktop, tablet, and mobile devices
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateRugFormExample;