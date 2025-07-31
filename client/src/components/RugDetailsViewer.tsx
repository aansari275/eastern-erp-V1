import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ArrowLeft, QrCode, Calendar, Ruler, Palette, Package } from 'lucide-react';

interface RugDetailsViewerProps {
  data?: string; // QR code data as JSON string
  onBack?: () => void;
}

export const RugDetailsViewer: React.FC<RugDetailsViewerProps> = ({ data, onBack }) => {
  const [rugDetails, setRugDetails] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      fetchRugByCarpetNo(data.trim());
    }
  }, [data]);

  const fetchRugByCarpetNo = async (carpetNo: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/rugs');
      if (!response.ok) {
        throw new Error('Failed to fetch rugs');
      }
      
      const rugs = await response.json();
      const foundRug = rugs.find((rug: any) => 
        rug.carpetNo === carpetNo || 
        rug.designName === carpetNo
      );
      
      if (foundRug) {
        setRugDetails(foundRug);
      } else {
        setError(`No rug found with carpet number: ${carpetNo}`);
      }
    } catch (err) {
      setError('Failed to fetch rug details');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <QrCode className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid QR Code</h3>
            <p className="text-gray-600">{error}</p>
            {onBack && (
              <button
                onClick={onBack}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Rug Details</h3>
            <p className="text-gray-600">Searching for rug information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!rugDetails && !loading && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code</h3>
            <p className="text-gray-600">Please scan a rug label QR code to view details</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-4 p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rug Details</h1>
            <p className="text-gray-600">Scanned from QR code</p>
          </div>
        </div>

        {/* Main Details Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-blue-900">
                {rugDetails.designName || 'N/A'}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                <QrCode className="w-3 h-3 mr-1" />
                QR Scanned
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Construction & Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Construction</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {rugDetails.construction || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Palette className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Color</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {rugDetails.color || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Ruler className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Size</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {rugDetails.size || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Pile GSM</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {rugDetails.pileGSM || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Total GSM</p>
                  <p className="text-2xl font-bold text-green-600">
                    {rugDetails.totalGSM || rugDetails.finishedGSM || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Carpet No.</p>
                  <p className="text-lg font-mono text-gray-900">
                    {rugDetails.carpetNo || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Details */}
            {(rugDetails.quality || rugDetails.buyer || rugDetails.ops) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rugDetails.quality && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Quality</p>
                    <p className="text-base text-gray-900">{rugDetails.quality}</p>
                  </div>
                )}
                {rugDetails.buyer && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Buyer</p>
                    <p className="text-base text-gray-900">{rugDetails.buyer}</p>
                  </div>
                )}
                {rugDetails.ops && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">OPS No.</p>
                    <p className="text-base font-mono text-gray-900">{rugDetails.ops}</p>
                  </div>
                )}
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 pt-4 border-t">
              <Calendar className="w-4 h-4" />
              <span>
                Scanned on {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">QR Code Information</h3>
                <p className="text-sm text-gray-600">
                  This rug sample has been digitally tagged for easy identification and tracking.
                  For more information, contact Eastern Mills.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};