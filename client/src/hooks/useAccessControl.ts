import { useAuth } from './useAuth';
import type { User } from '@shared/schema';

// Helper functions for the 3-tiered access control system
export function useAccessControl() {
  const { userDoc } = useAuth();
  
  // Type guard to check if user follows new tiered model
  const isNewUserModel = (user: any): user is User => {
    return user && 
           typeof user.department === 'string' &&
           Array.isArray(user.tabs) &&
           Array.isArray(user.permissions);
  };
  
  // Get user with fallback to legacy fields
  const getUser = (): User | null => {
    if (!userDoc) return null;
    
    if (isNewUserModel(userDoc)) {
      return userDoc;
    }
    
    // Fallback for legacy users - convert to new model temporarily
    const department = userDoc.DepartmentId || userDoc.department_id || userDoc.department || 'quality';
    const role = userDoc.Role || userDoc.role || 'staff';
    
    // Basic tab assignment based on department
    let tabs: string[] = [];
    let permissions: string[] = [];
    
    if (department === 'quality') {
      tabs = ['dashboard', 'compliance'];
      permissions = role === 'supervisor' ? ['view_dashboard', 'edit_dashboard', 'view_compliance'] : ['view_dashboard', 'view_compliance'];
    } else if (department === 'sampling') {
      tabs = ['create', 'gallery'];
      permissions = role === 'supervisor' ? ['view_create', 'edit_create', 'view_gallery', 'edit_gallery'] : ['view_create', 'view_gallery'];
    } else if (department === 'merchandising') {
      tabs = ['buyers', 'pdoc'];
      permissions = role === 'supervisor' ? ['view_buyers', 'edit_buyers', 'view_pdoc', 'edit_pdoc'] : ['view_buyers', 'view_pdoc'];
    }
    
    return {
      uid: userDoc.uid || userDoc.id || '',
      email: userDoc.Email || userDoc.email || '',
      department: department,
      subDepartment: null,
      tabs: tabs,
      permissions: permissions,
      role: role,
      isActive: userDoc.isActive !== false,
      first_name: userDoc.first_name,
      last_name: userDoc.last_name,
      created_at: userDoc.created_at,
      updated_at: userDoc.updated_at
    };
  };
  
  // Tier 3: Check if user can view a specific tab
  const canViewTab = (tabName: string): boolean => {
    const user = getUser();
    if (!user) return false;
    return user.tabs.includes(tabName);
  };
  
  // Permission-based access control
  const canView = (permission: string): boolean => {
    const user = getUser();
    if (!user) return false;
    return user.permissions.includes(`view_${permission}`) || user.permissions.includes(`edit_${permission}`) || user.permissions.includes(`manage_${permission}`);
  };
  
  const canEdit = (permission: string): boolean => {
    const user = getUser();
    if (!user) return false;
    return user.permissions.includes(`edit_${permission}`) || user.permissions.includes(`manage_${permission}`);
  };
  
  const canManage = (permission: string): boolean => {
    const user = getUser();
    if (!user) return false;
    return user.permissions.includes(`manage_${permission}`);
  };
  
  // Check if user has any access to a department
  const canAccessDepartment = (departmentName: string): boolean => {
    const user = getUser();
    if (!user) return false;
    
    // Check if user has access through departments array or primary department
    const userDepartments = userDoc?.departments || [user.department];
    return userDepartments.includes(departmentName) || user.department === 'admin' || userDepartments.includes('admin');
  };
  
  // Get all accessible tabs for navigation
  const getAccessibleTabs = (): string[] => {
    const user = getUser();
    if (!user) return [];
    return user.tabs;
  };
  
  // Get user's department and sub-department info
  const getUserDepartmentInfo = () => {
    const user = getUser();
    if (!user) return null;
    
    return {
      department: user.department,
      subDepartment: user.subDepartment,
      role: user.role
    };
  };
  
  // Check if user is in a specific role
  const hasRole = (roleName: string): boolean => {
    const user = getUser();
    if (!user) return false;
    return user.role === roleName;
  };
  
  return {
    user: getUser(),
    canViewTab,
    canView,
    canEdit,
    canManage,
    canAccessDepartment,
    getAccessibleTabs,
    getUserDepartmentInfo,
    hasRole,
    isLoading: false // Since we're using existing userDoc
  };
}

// Export individual helper functions for use in components
export function canViewTab(user: User | null, tabName: string): boolean {
  return user?.tabs?.includes(tabName) ?? false;
}

export function canView(user: User | null, permission: string): boolean {
  if (!user) return false;
  return (user.permissions?.includes(`view_${permission}`) || 
         user.permissions?.includes(`edit_${permission}`) || 
         user.permissions?.includes(`manage_${permission}`)) ?? false;
}

export function canEdit(user: User | null, permission: string): boolean {
  if (!user) return false;
  return (user.permissions?.includes(`edit_${permission}`) || 
         user.permissions?.includes(`manage_${permission}`)) ?? false;
}

export function canManage(user: User | null, permission: string): boolean {
  if (!user) return false;
  return user.permissions?.includes(`manage_${permission}`) ?? false;
}