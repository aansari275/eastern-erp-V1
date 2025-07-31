import React, { useRef, useEffect, useState } from 'react';
// Import the necessary barcode reader and exception class from the ZXing library
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  // This ref will hold the ZXing code reader instance
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    // Initialize the code reader when the component mounts
    codeReaderRef.current = new BrowserMultiFormatReader();

    if (isOpen) {
      startScanning();
    } else {
      // Clean up when the component is closed or unmounts
      stopScanning();
    }

    // This is a cleanup function that React runs when the component unmounts
    return () => {
      stopScanning();
    };
  }, [isOpen]); // This effect re-runs whenever the 'isOpen' prop changes

  const startScanning = async () => {
    if (!videoRef.current || !codeReaderRef.current) {
      return;
    }

    try {
      setError(null);
      // **THE CORE LOGIC IS HERE**
      // This function from ZXing asks for camera permission, gets the stream,
      // and continuously decodes the video feed for barcodes.
      await codeReaderRef.current.decodeFromVideoDevice(
        null, // 'null' lets the user choose the camera
        videoRef.current,
        (result, err) => {
          // This is a callback function that runs for every frame
          if (result) {
            // A barcode was successfully found!
            console.log('Barcode found:', result.getText());
            onScan(result.getText()); // Send the result to the parent component
            onClose(); // Close the scanner modal
          }

          // Check for errors, but specifically ignore NotFoundException,
          // which is thrown every frame a barcode isn't found. This is normal.
          if (err && !(err instanceof NotFoundException)) {
            console.error('Barcode scan error:', err);
            setError('An error occurred while scanning.');
          }
        }
      );
    } catch (err: any) {
      console.error('Error starting camera:', err);
      // Handle common camera permission errors gracefully
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else {
        setError('Failed to access camera. Please ensure it is not in use by another application.');
      }
    }
  };

  const stopScanning = () => {
    // This function cleanly stops the video stream and releases the camera
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
  };

  const handleManualInput = () => {
    const barcode = prompt('Enter barcode manually:');
    if (barcode) {
      onScan(barcode);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Scan Barcode</h3>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={onClose}
            >
              <i className="material-icons">close</i>
            </button>
          </div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
            {/* The video element is where the camera feed will be displayed */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
            />
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                <div className="text-center p-4">
                  <i className="material-icons text-4xl text-red-400 mb-2">error</i>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              onClick={handleManualInput}
            >
              <i className="material-icons text-sm mr-1">keyboard</i>
              Manual Input
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;