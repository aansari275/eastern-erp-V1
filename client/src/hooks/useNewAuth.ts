import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { User, getUserRole } from '../lib/newPermissions';

export function useNewAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            const appUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: getUserRole(firebaseUser.email || ''),
              isActive: true
            };
            setUser(appUser);
          } else {
            setUser(null);
          }
          setError(null);
        } catch (err) {
          console.error('Auth error:', err);
          setError('Authentication error occurred');
          setUser(null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError('Authentication error occurred');
        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const isAuthenticated = !!user;
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isSuperAdmin,
    isAdmin
  };
}