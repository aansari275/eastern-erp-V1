import React from 'react';
import { AlertTriangle, ExternalLink, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';

interface FirebaseAuthHelperProps {
  error?: any;
  isVisible: boolean;
  onClose: () => void;
}

const FirebaseAuthHelper: React.FC<FirebaseAuthHelperProps> = ({ error, isVisible, onClose }) => {
  const { toast } = useToast();
  const currentDomain = window.location.hostname;
  const isUnauthorizedDomain = error?.code === 'auth/unauthorized-domain';

  const copyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    toast({
      title: "Domain Copied",
      description: `${currentDomain} copied to clipboard`,
    });
  };

  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/rugcraftpro/authentication/settings', '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Authentication Setup Required</h3>
        </div>
        
        {isUnauthorizedDomain ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your domain <code className="bg-gray-100 px-2 py-1 rounded">{currentDomain}</code> is not authorized for Firebase authentication.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Quick Fix:</h4>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. Copy your domain below</li>
                <li>2. Open Firebase Console</li>
                <li>3. Go to Authentication → Settings → Authorized domains</li>
                <li>4. Add your domain and save</li>
                <li>5. Wait 5 minutes and try again</li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-3 py-2 rounded flex-1 text-sm">{currentDomain}</code>
                <Button onClick={copyDomain} size="sm" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={openFirebaseConsole} className="w-full" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Firebase Console
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Google authentication failed. This might be due to:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Popup blocked by browser</li>
              <li>Network connectivity issues</li>
              <li>Firebase configuration problems</li>
            </ul>
            <p className="text-sm text-gray-600">
              Please try again or contact support if the issue persists.
            </p>
          </div>
        )}
        
        <div className="flex gap-2 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
          <Button onClick={() => window.location.reload()} className="flex-1">
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseAuthHelper;