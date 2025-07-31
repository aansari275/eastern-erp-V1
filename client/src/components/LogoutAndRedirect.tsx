import React, { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

const LogoutAndRedirect: React.FC = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear Firebase auth
        await signOut(auth);
        
        // Clear local storage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userDepartment');
        localStorage.removeItem('qualityCompany');
        
        // Clear session storage
        sessionStorage.clear();
        
        // Call auth hook logout if available
        if (logout) {
          logout();
        }
        
        console.log('User logged out successfully');
        
        // Force redirect to home page with reload
        window.location.replace('/');
        
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if logout fails
        window.location.replace('/');
      }
    };

    performLogout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Signing out...</p>
      </div>
    </div>
  );
};

export default LogoutAndRedirect;