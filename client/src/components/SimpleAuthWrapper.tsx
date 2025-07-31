import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface SimpleAuthWrapperProps {
  children: React.ReactNode;
}

export function SimpleAuthWrapper({ children }: SimpleAuthWrapperProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading Eastern Mills System...</p>
        </div>
      </div>
    );
  }

  // SIMPLIFIED AUTH: If user is authenticated with Firebase, allow access
  // This bypasses the complex authorization system that was causing issues
  if (user) {
    console.log('✅ User authenticated:', user.email);
    return <>{children}</>;
  }

  // If not authenticated, redirect will be handled by App.tsx routing
  return null;
}