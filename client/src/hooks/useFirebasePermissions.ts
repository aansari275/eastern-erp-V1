// client/src/hooks/useFirebasePermissions.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Department, Role, UserPermission, DepartmentTab, DEPARTMENT_TABS } from '@shared/permissions';

interface FirebaseUser {
  id: string;
  email: string;
  role: string;
  departmentId?: string;
  departments?: Department[];
  isActive: boolean;
  lastLogin?: string;
}

// Convert Firebase user to UserPermission format
const convertFirebaseUserToPermission = (firebaseUser: FirebaseUser): UserPermission => {
  // Parse the role - default to 'Viewer' if not recognized
  const role: Role = firebaseUser.role === 'Editor' ? 'Editor' : 'Viewer';
  
  // Get departments from the departments array or fallback to departmentId
  let departments: Department[] = [];
  if (firebaseUser.departments && Array.isArray(firebaseUser.departments)) {
    departments = firebaseUser.departments.filter((dept): dept is Department => 
      ['Products', 'Production', 'Quality', 'Compliance'].includes(dept)
    );
  } else if (firebaseUser.departmentId) {
    // Map legacy departmentId to new department system
    switch (firebaseUser.departmentId) {
      case 'dept001':
        departments = ['Products'];
        break;
      case 'dept002':
        departments = ['Production'];
        break;
      case 'dept003':
        departments = ['Quality'];
        break;
      case 'dept004':
        departments = ['Compliance'];
        break;
      default:
        departments = ['Products']; // Default fallback
    }
  }

  return {
    userId: firebaseUser.id,
    name: firebaseUser.email.split('@')[0], // Extract name from email
    email: firebaseUser.email,
    role,
    departments,
    isActive: firebaseUser.isActive
  };
};

export const useFirebasePermissions = (userId?: string) => {
  const [userPermission, setUserPermission] = useState<UserPermission | null>(null);
  const queryClient = useQueryClient();

  // Fetch Firebase users
  const { data: firebaseUsers = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async (): Promise<FirebaseUser[]> => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  // Convert Firebase users to permission format
  const users: UserPermission[] = firebaseUsers.map(convertFirebaseUserToPermission);

  // Get current user permission (default to first user if not specified)
  useEffect(() => {
    const currentUserId = userId || (users.length > 0 ? users[0].userId : null);
    if (currentUserId) {
      const permission = users.find(u => u.userId === currentUserId) || null;
      setUserPermission(permission);
    }
  }, [users, userId]);

  // Mutation to update user role
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to update user role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  // Mutation to update user departments
  const updateUserDepartmentsMutation = useMutation({
    mutationFn: async ({ userId, departments }: { userId: string; departments: Department[] }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departments }),
      });
      if (!response.ok) throw new Error('Failed to update user departments');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  // Mutation to toggle user active status
  const toggleUserActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to update user status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  // Permission checking functions
  const canAccessDepartment = (department: Department): boolean => {
    if (!userPermission || !userPermission.isActive) return false;
    return userPermission.departments.includes(department);
  };

  const canEditInDepartment = (department: Department): boolean => {
    if (!userPermission || !userPermission.isActive) return false;
    return userPermission.departments.includes(department) && userPermission.role === 'Editor';
  };

  const canAccessTab = (tabId: string): boolean => {
    if (!userPermission || !userPermission.isActive) return false;

    // Find the tab in all departments
    for (const [department, tabs] of Object.entries(DEPARTMENT_TABS)) {
      const tab = tabs.find(t => t.id === tabId);
      if (tab) {
        // Check department access
        if (!userPermission.departments.includes(department as Department)) return false;
        
        // Check edit access if required
        if (tab.requiresEditAccess && userPermission.role !== 'Editor') return false;
        
        return true;
      }
    }
    return false;
  };

  const getAccessibleTabs = (): DepartmentTab[] => {
    if (!userPermission || !userPermission.isActive) return [];

    const accessibleTabs: DepartmentTab[] = [];
    
    for (const department of userPermission.departments) {
      const departmentTabs = DEPARTMENT_TABS[department] || [];
      for (const tab of departmentTabs) {
        // Include tab if user has access (either no edit requirement or user is Editor)
        if (!tab.requiresEditAccess || userPermission.role === 'Editor') {
          accessibleTabs.push(tab);
        }
      }
    }
    
    return accessibleTabs;
  };

  const getAccessibleDepartments = (): Department[] => {
    if (!userPermission || !userPermission.isActive) return [];
    return userPermission.departments;
  };

  return {
    // Current user permissions
    userPermission,
    canAccessDepartment,
    canEditInDepartment,
    canAccessTab,
    getAccessibleTabs,
    getAccessibleDepartments,
    
    // All users (for admin)
    users,
    isLoading,
    
    // Mutations
    updateUserRole: (userId: string, role: Role) => 
      updateUserRoleMutation.mutate({ userId, role }),
    updateUserDepartments: (userId: string, departments: Department[]) => 
      updateUserDepartmentsMutation.mutate({ userId, departments }),
    toggleUserActive: (userId: string, isActive: boolean) => 
      toggleUserActiveMutation.mutate({ userId, isActive }),
  };
};