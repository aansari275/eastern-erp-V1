
import React from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { Button } from './ui/button';

export const AuthButton: React.FC = () => {
  const { user, loading, signInWithGoogle, logout, error } = useFirebaseAuth();

  if (loading) {
    return (
      <Button disabled className="min-w-[120px]">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-gray-700">
            {user.displayName || user.email}
          </span>
        </div>
        <Button 
          onClick={logout}
          variant="outline"
          size="sm"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={signInWithGoogle}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </Button>
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
};
