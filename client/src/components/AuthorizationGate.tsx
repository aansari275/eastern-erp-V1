import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, Mail, Shield } from 'lucide-react';
// Import the Eastern Mills logo
const easternMillsLogo = '/attached_assets/NEW EASTERN LOGO (transparent background))v copy (3)_1753322709558.png';

interface AuthorizationGateProps {
  children: React.ReactNode;
}

interface AuthorizedUser {
  id: string;
  email: string;
  department: string;
  departmentId: string;
  role: string;
  tier: string;
  allowedTabs: string[];
}

export function AuthorizationGate({ children }: AuthorizationGateProps) {
  const { user, logout } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authorizedUser, setAuthorizedUser] = useState<AuthorizedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    checkAuthorization(user.email);
  }, [user]);

  const checkAuthorization = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/check-authorization/${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (response.ok && data.authorized) {
        setIsAuthorized(true);
        setAuthorizedUser(data.user);
        
        // Store user authorization data in localStorage for easy access
        localStorage.setItem('authorizedUser', JSON.stringify(data.user));
      } else {
        setIsAuthorized(false);
        setError(data.message || 'Authorization failed');
      }
    } catch (error) {
      console.error('Authorization check failed:', error);
      setIsAuthorized(false);
      setError('Failed to check authorization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img 
            src={easternMillsLogo} 
            alt="Eastern Mills" 
            className="h-20 w-auto mx-auto mb-6"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Let the auth system handle this
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <img 
              src={easternMillsLogo} 
              alt="Eastern Mills" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <CardTitle className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <Mail className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-700 font-medium">
                Your email is not authorized for this system
              </p>
              <p className="text-xs text-red-600 mt-1">
                {user.email}
              </p>
            </div>
            
            {error && (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {error}
              </p>
            )}
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>To gain access:</p>
              <div className="text-left bg-gray-50 p-3 rounded text-xs space-y-1">
                <p>• Contact your administrator</p>
                <p>• Request access for your department</p>
                <p>• Wait for email authorization</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => checkAuthorization(user.email!)}
                className="flex-1"
              >
                Check Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (logout) {
                    logout();
                  }
                }}
                className="flex-1"
              >
                Sign Out
              </Button>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
                className="w-full text-sm text-gray-600"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthorized && authorizedUser) {
    // Store department and role info for routing
    localStorage.setItem('userDepartment', authorizedUser.department);
    localStorage.setItem('userRole', authorizedUser.role);
    localStorage.setItem('userTier', authorizedUser.tier);
    localStorage.setItem('allowedTabs', JSON.stringify(authorizedUser.allowedTabs));
  }

  // User is authorized, render the protected content
  return <>{children}</>;
}