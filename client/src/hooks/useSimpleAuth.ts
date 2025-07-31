import { useState, useEffect } from 'react';

// Simple, reliable auth system that doesn't break
export const useSimpleAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false); // Set to false by default
  
  useEffect(() => {
    // Create a default user with full access for development
    const defaultUser = {
      uid: 'dev-user',
      email: 'developer@easternmills.com',
      displayName: 'Developer User',
      department: 'admin',
      role: 'admin',
      permissions: ['all'],
      isActive: true,
    };
    
    setUser(defaultUser);
    setLoading(false);
  }, []);

  const login = async () => {
    // Simple login - just set the user
    const defaultUser = {
      uid: 'dev-user',
      email: 'developer@easternmills.com',
      displayName: 'Developer User',
      department: 'admin',
      role: 'admin',
      permissions: ['all'],
      isActive: true,
    };
    setUser(defaultUser);
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    userDoc: user,
    loading,
    login,
    logout,
  };
};

// Simple access control - always allow access in development
export const useSimpleAccessControl = () => {
  const { user } = useSimpleAuth();
  
  const canAccessDepartment = (department: string) => {
    // Always allow access in development
    return true;
  };
  
  const canViewTab = (tab: string) => {
    return true;
  };
  
  const canView = (permission: string) => {
    return true;
  };
  
  const canEdit = (permission: string) => {
    return true;
  };
  
  const canManage = (permission: string) => {
    return true;
  };
  
  const hasRole = (role: string) => {
    return true;
  };
  
  return {
    user,
    canAccessDepartment,
    canViewTab,
    canView,
    canEdit,
    canManage,
    hasRole,
    getAccessibleTabs: () => ['all'],
    getUserDepartmentInfo: () => ({ department: 'admin', role: 'admin' }),
    isLoading: false,
  };
};