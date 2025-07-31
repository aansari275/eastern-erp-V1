// Eastern ERP - Clean Permission System
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
}

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'user' | 'viewer';

export interface Permission {
  module: string;
  actions: string[];
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    { module: 'home', actions: ['view', 'edit', 'delete', 'manage'] },
    { module: 'sampling', actions: ['view', 'edit', 'delete', 'manage'] },
    { module: 'merchandising', actions: ['view', 'edit', 'delete', 'manage'] },
    { module: 'production', actions: ['view', 'edit', 'delete', 'manage'] },
    { module: 'admin', actions: ['view', 'edit', 'delete', 'manage'] },
    { module: 'orders', actions: ['view', 'edit', 'delete', 'manage'] },
    { module: 'crm', actions: ['view', 'edit', 'delete', 'manage'] },
    { module: 'quality', actions: ['view', 'edit', 'delete', 'manage'] },
    { module: 'inspections', actions: ['view', 'edit', 'delete', 'manage'] }
  ],
  admin: [
    { module: 'home', actions: ['view', 'edit'] },
    { module: 'sampling', actions: ['view', 'edit', 'delete'] },
    { module: 'merchandising', actions: ['view', 'edit', 'delete'] },
    { module: 'production', actions: ['view', 'edit', 'delete'] },
    { module: 'orders', actions: ['view', 'edit', 'delete'] },
    { module: 'crm', actions: ['view', 'edit'] },
    { module: 'quality', actions: ['view', 'edit', 'delete'] },
    { module: 'inspections', actions: ['view', 'edit', 'delete'] }
  ],
  manager: [
    { module: 'home', actions: ['view'] },
    { module: 'sampling', actions: ['view', 'edit'] },
    { module: 'merchandising', actions: ['view', 'edit'] },
    { module: 'production', actions: ['view', 'edit'] },
    { module: 'orders', actions: ['view', 'edit'] },
    { module: 'crm', actions: ['view', 'edit'] },
    { module: 'quality', actions: ['view', 'edit'] },
    { module: 'inspections', actions: ['view', 'edit'] }
  ],
  user: [
    { module: 'home', actions: ['view'] },
    { module: 'sampling', actions: ['view', 'edit'] },
    { module: 'merchandising', actions: ['view'] },
    { module: 'production', actions: ['view'] },
    { module: 'orders', actions: ['view'] },
    { module: 'crm', actions: ['view'] },
    { module: 'quality', actions: ['view', 'edit'] },
    { module: 'inspections', actions: ['view', 'edit'] }
  ],
  viewer: [
    { module: 'home', actions: ['view'] },
    { module: 'sampling', actions: ['view'] },
    { module: 'merchandising', actions: ['view'] },
    { module: 'production', actions: ['view'] },
    { module: 'orders', actions: ['view'] },
    { module: 'crm', actions: ['view'] },
    { module: 'quality', actions: ['view'] },
    { module: 'inspections', actions: ['view'] }
  ]
};

// Module definitions
export const MODULES = {
  HOME: 'home',
  SAMPLING: 'sampling',
  MERCHANDISING: 'merchandising',
  PRODUCTION: 'production',
  ADMIN: 'admin',
  ORDERS: 'orders',
  CRM: 'crm',
  QUALITY: 'quality',
  INSPECTIONS: 'inspections'
} as const;

// Helper functions
export function hasPermission(user: User, module: string, action: string): boolean {
  if (!user) return false;
  
  // Super admin has access to everything
  if (user.role === 'super_admin') return true;
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  const modulePermission = userPermissions.find(p => p.module === module);
  
  return modulePermission ? modulePermission.actions.includes(action) : false;
}

export function canAccessModule(user: User, module: string): boolean {
  return hasPermission(user, module, 'view');
}

export function getUserRole(email: string): UserRole {
  if (!email) return 'viewer';
  
  const lowerEmail = email.toLowerCase();
  
  // Super admin assignments
  if (lowerEmail === 'abdulansari@easternmills.com' || lowerEmail.includes('superadmin')) {
    return 'super_admin';
  }
  
  // Admin assignments
  if (lowerEmail.includes('admin') || lowerEmail.includes('director')) {
    return 'admin';
  }
  
  // Manager assignments
  if (lowerEmail.includes('manager') || lowerEmail.includes('head')) {
    return 'manager';
  }
  
  // Default company user
  if (lowerEmail.endsWith('@easternmills.com')) {
    return 'user';
  }
  
  // External or unknown users
  return 'viewer';
}

export function getAccessibleModules(user: User): string[] {
  if (!user) return [];
  
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions
    .filter(p => p.actions.includes('view'))
    .map(p => p.module);
}