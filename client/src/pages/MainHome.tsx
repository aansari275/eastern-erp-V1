import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import HomePage from '../pages/HomePage';
import FirebaseAuthHelper from '../components/FirebaseAuthHelper';

// Updated Eastern logo
const easternMillsLogo = '/attached_assets/NEW EASTERN LOGO (transparent background) copy_1753240686257.png';

// Department to route mapping
const DEPARTMENT_ROUTES: Record<string, string> = {
  'admin': '/admin',
  'quality': '/quality', 
  'sampling': '/sampling',
  'merchandising': '/merchandising',
  'production': '/production',
  // Legacy department IDs
  'dept001': '/sampling',
  'dept002': '/quality',
  'dept003': '/merchandising',
};

export default function MainHome() {
  const { user, userDoc, login, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [redirecting, setRedirecting] = useState(false);
  const [authError, setAuthError] = useState<any>(null);
  const [showAuthHelper, setShowAuthHelper] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      if (login) {
        await login();
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setAuthError(error);
      setShowAuthHelper(true);
    }
  };

  // Dynamic redirect logic - runs once when user and userDoc are both available
  useEffect(() => {
    if (!user || !userDoc || redirecting) return;

    console.log('🎯 Dynamic redirect check:', {
      email: user.email,
      userDoc: userDoc,
      DepartmentId: userDoc.DepartmentId,
      department_id: userDoc.department_id,
      department: userDoc.department
    });

    // Get department ID from various possible fields
    const departmentId = userDoc.DepartmentId || userDoc.department_id || userDoc.department;
    
    if (departmentId) {
      const targetRoute = DEPARTMENT_ROUTES[departmentId.toLowerCase()];
      
      if (targetRoute) {
        console.log(`🚀 Redirecting to ${departmentId} department: ${targetRoute}`);
        setRedirecting(true);
        
        // Show welcome toast
        const departmentName = departmentId.charAt(0).toUpperCase() + departmentId.slice(1);
        toast({
          title: `Welcome to ${departmentName} Department`,
          description: `Redirecting to your department dashboard...`,
        });
        
        // Redirect after short delay to show toast
        setTimeout(() => {
          navigate(targetRoute);
        }, 1500);
        
        return;
      }
    }

    // Fallback for users without valid department - show unauthorized page
    console.log('⚠️ No valid department found, showing unauthorized access');
    toast({
      title: "Department Not Assigned",
      description: "Please contact admin to assign your department access.",
      variant: "destructive"
    });
    
    // Don't redirect, show the home page instead for now
    // navigate('/unauthorized');
  }, [user, userDoc, navigate, toast, redirecting]);

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show redirecting state when user is authenticated and we're redirecting to their department
  if (redirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your department...</p>
        </div>
      </div>
    );
  }

  // Show homepage if user is authenticated
  if (user) {
    return <HomePage />;
  }

  // Show login page matching the provided design
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md p-8">
          <div className="text-center">
            {/* Eastern Mills Logo */}
            <div className="mb-8">
              <img 
                src={easternMillsLogo} 
                alt="Eastern Mills Logo" 
                className="h-28 w-auto mx-auto mb-4"
              />
            </div>
            
            {/* Welcome Text */}
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Welcome to Eastern Mills
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Rug Manufacturing Management System
            </p>
            
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md text-base font-medium mb-6"
              size="lg"
            >
              <div className="flex items-center justify-center">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                ) : (
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Sign in with Google
              </div>
            </Button>
            
            {/* Help Text */}
            <p className="text-gray-500 text-sm mb-2">
              Sign in with your Google account to access the system
            </p>
            <p className="text-gray-400 text-xs">
              If popup is blocked, you'll be redirected to Google sign-in page
            </p>
          </div>
        </div>
        
        {/* Firebase Authentication Helper Modal */}
        <FirebaseAuthHelper
          error={authError}
          isVisible={showAuthHelper}
          onClose={() => setShowAuthHelper(false)}
        />
      </div>
    );
  }

  // Fallback return (should not reach here)
  return null;
}