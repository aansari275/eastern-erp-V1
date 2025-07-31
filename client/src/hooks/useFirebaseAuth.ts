
import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useFirebaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Check for redirect result first
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          console.log('Redirect authentication successful:', result.user.email);
          // Handle successful redirect authentication
          try {
            const idToken = await result.user.getIdToken();
            const response = await fetch('/api/auth/firebase/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken }),
            });

            if (response.ok) {
              const data = await response.json();
              console.log('Backend authentication successful:', data.user);
            }
          } catch (error) {
            console.error('Error verifying redirect token with backend:', error);
          }
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get the ID token and send to backend for verification
          const idToken = await user.getIdToken();
          
          const response = await fetch('/api/auth/firebase/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Backend authentication successful:', data.user);
          } else {
            console.error('Backend authentication failed');
          }
        } catch (error) {
          console.error('Error verifying token with backend:', error);
        }
      }

      setAuthState({
        user,
        loading: false,
        error: null
      });
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Current domain for Firebase:', window.location.hostname);
      console.log('Full URL:', window.location.href);
      
      // Try popup first, fall back to redirect if it fails
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Google sign-in successful (popup):', result.user.email);
        return result.user;
      } catch (popupError: any) {
        console.log('Popup failed, trying redirect method:', popupError.code);
        
        if (popupError.code === 'auth/unauthorized-domain' || 
            popupError.code === 'auth/popup-blocked' ||
            popupError.code === 'auth/popup-closed-by-user') {
          
          console.log('Using redirect sign-in method...');
          await signInWithRedirect(auth, googleProvider);
          // The redirect will handle the rest, so we don't return here
          return null;
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      console.error('Make sure this domain is added to Firebase:', window.location.hostname);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Authentication failed: ${error.message}` 
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Also notify backend to clear session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        error: error.message || 'Logout failed' 
      }));
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle,
    logout,
    isAuthenticated: !!authState.user
  };
};
