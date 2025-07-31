// Permission System Configuration
export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  canAccessDepartments: string[];
  isAdmin?: boolean;
}

export interface Department {
  id: string;
  name: string;
  displayName: string;
  features: string[];
  requiredPermissions: string[];
}

// Permission constants
export const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_PERMISSIONS: 'manage_permissions',
  VIEW_ALL_DATA: 'view_all_data',
  
  // Quality permissions
  VIEW_QUALITY: 'view_quality',
  EDIT_QUALITY: 'edit_quality',
  VIEW_COMPLIANCE: 'view_compliance',
  EDIT_COMPLIANCE: 'edit_compliance',
  
  // Sampling permissions
  VIEW_SAMPLING: 'view_sampling',
  EDIT_SAMPLING: 'edit_sampling',
  
  // Production permissions
  VIEW_PRODUCTION: 'view_production',
  EDIT_PRODUCTION: 'edit_production',
} as const;

// Predefined roles
export const ROLES: Record<string, UserRole> = {
  ADMIN: {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access',
    permissions: Object.values(PERMISSIONS),
    canAccessDepartments: ['admin', 'quality', 'sampling', 'production'],
    isAdmin: true,
  },
  
  QUALITY_MANAGER: {
    id: 'quality_manager',
    name: 'Quality Manager',
    description: 'Manages quality department',
    permissions: [
      PERMISSIONS.VIEW_QUALITY,
      PERMISSIONS.EDIT_QUALITY,
      PERMISSIONS.VIEW_COMPLIANCE,
      PERMISSIONS.EDIT_COMPLIANCE,
      PERMISSIONS.VIEW_ALL_DATA,
    ],
    canAccessDepartments: ['quality'],
  },
  
  QUALITY_INSPECTOR: {
    id: 'quality_inspector',
    name: 'Quality Inspector',
    description: 'Quality inspection and compliance',
    permissions: [
      PERMISSIONS.VIEW_QUALITY,
      PERMISSIONS.EDIT_QUALITY,
      PERMISSIONS.VIEW_COMPLIANCE,
      PERMISSIONS.EDIT_COMPLIANCE,
    ],
    canAccessDepartments: ['quality'],
  },
  

  
  SAMPLING_MANAGER: {
    id: 'sampling_manager',
    name: 'Sampling Manager',
    description: 'Manages sampling department',
    permissions: [
      PERMISSIONS.VIEW_SAMPLING,
      PERMISSIONS.EDIT_SAMPLING,
      PERMISSIONS.VIEW_ALL_DATA,
    ],
    canAccessDepartments: ['sampling'],
  },
  
  SAMPLING_TEAM: {
    id: 'sampling_team',
    name: 'Sampling Team',
    description: 'Sampling operations',
    permissions: [
      PERMISSIONS.VIEW_SAMPLING,
      PERMISSIONS.EDIT_SAMPLING,
    ],
    canAccessDepartments: ['sampling'],
  },
  
  VIEWER: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      PERMISSIONS.VIEW_QUALITY,
      PERMISSIONS.VIEW_COMPLIANCE,
      PERMISSIONS.VIEW_SAMPLING,
    ],
    canAccessDepartments: ['quality', 'sampling'],
  },
};

// Department definitions
export const DEPARTMENTS: Record<string, Department> = {
  ADMIN: {
    id: 'admin',
    name: 'admin',
    displayName: 'Administration',
    features: ['user_management', 'permissions', 'system_settings'],
    requiredPermissions: [PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_PERMISSIONS],
  },
  
  QUALITY: {
    id: 'quality',
    name: 'quality',
    displayName: 'Quality Control',
    features: ['quality_dashboard', 'compliance_audits'],
    requiredPermissions: [PERMISSIONS.VIEW_QUALITY],
  },
  
  SAMPLING: {
    id: 'sampling',
    name: 'sampling',
    displayName: 'Sampling',
    features: ['rug_creation', 'gallery', 'costing'],
    requiredPermissions: [PERMISSIONS.VIEW_SAMPLING],
  },
  
  PRODUCTION: {
    id: 'production',
    name: 'production',
    displayName: 'Production',
    features: ['production_tracking', 'inventory'],
    requiredPermissions: [PERMISSIONS.VIEW_PRODUCTION],
  },
};

// Helper functions
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission) || userPermissions.includes(PERMISSIONS.VIEW_ALL_DATA);
}

export function canAccessDepartment(userRole: UserRole, departmentId: string): boolean {
  return userRole.canAccessDepartments.includes(departmentId) || userRole.isAdmin === true;
}

export function canAccessFeature(userPermissions: string[], feature: string): boolean {
  const featurePermissionMap: Record<string, string> = {
    'quality_dashboard': PERMISSIONS.VIEW_QUALITY,
    'compliance_audits': PERMISSIONS.VIEW_COMPLIANCE,
    'rug_creation': PERMISSIONS.VIEW_SAMPLING,
    'gallery': PERMISSIONS.VIEW_SAMPLING,
    'costing': PERMISSIONS.VIEW_SAMPLING,
    'user_management': PERMISSIONS.MANAGE_USERS,
    'permissions': PERMISSIONS.MANAGE_PERMISSIONS,
  };
  
  const requiredPermission = featurePermissionMap[feature];
  return requiredPermission ? hasPermission(userPermissions, requiredPermission) : false;
}

// Auto-assign roles based on email patterns (customize for your company)
export function getDefaultRoleForEmail(email: string): string {
  // Handle undefined or null email
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return ROLES.VIEWER.id; // Default to viewer for invalid emails
  }
  
  const domain = email.split('@')[1];
  const localPart = email.split('@')[0].toLowerCase();
  
  // Company domain check
  if (domain !== 'easternmills.com') {
    return ROLES.VIEWER.id; // External users get viewer access
  }
  
  // Admin users
  if (localPart.includes('admin') || localPart === 'abdulansari') {
    return ROLES.ADMIN.id;
  }
  

  
  // Quality roles
  if (localPart.includes('quality')) {
    if (localPart.includes('manager')) {
      return ROLES.QUALITY_MANAGER.id;
    }
    return ROLES.QUALITY_INSPECTOR.id;
  }
  
  // Sampling roles
  if (localPart.includes('sampling')) {
    if (localPart.includes('manager')) {
      return ROLES.SAMPLING_MANAGER.id;
    }
    return ROLES.SAMPLING_TEAM.id;
  }
  
  // Default role for company employees
  return ROLES.VIEWER.id;
}