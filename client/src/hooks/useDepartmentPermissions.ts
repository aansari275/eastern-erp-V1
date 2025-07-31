import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserRole, canAccessDepartment, canAccessTab, type DepartmentRole } from '../lib/departmentPermissions';

interface DepartmentPermissions {
  role: DepartmentRole;
  isLoading: boolean;
  error: string | null;
}

export function useDepartmentPermissions(): DepartmentPermissions {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<DepartmentPermissions>({
    role: {
      id: 'viewer',
      name: 'Viewer',
      department: 'none',
      tier: 'staff',
      description: 'Limited access',
      defaultTabs: {},
    },
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (authLoading) {
      setPermissions(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (!isAuthenticated || !user?.email) {
      setPermissions({
        role: {
          id: 'viewer',
          name: 'Viewer',
          department: 'none',
          tier: 'staff',
          description: 'Limited access',
          defaultTabs: {},
        },
        isLoading: false,
        error: null,
      });
      return;
    }

    // Get user role based on email
    try {
      const userRole = getUserRole(user.email);
      setPermissions({
        role: userRole,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error getting user role:', error);
      setPermissions({
        role: {
          id: 'viewer',
          name: 'Viewer',
          department: 'none',
          tier: 'staff',
          description: 'Limited access',
          defaultTabs: {},
        },
        isLoading: false,
        error: 'Failed to load permissions',
      });
    }
  }, [user, authLoading, isAuthenticated]);

  return permissions;
}

// Hook to check if user can access a specific department
export function useCanAccessDepartment(department: string): boolean {
  const { role } = useDepartmentPermissions();
  return canAccessDepartment(role, department);
}

// Hook to check if user can access a specific tab
export function useCanAccessTab(department: string, tabId: string) {
  const { role } = useDepartmentPermissions();
  return canAccessTab(role, department, tabId);
}