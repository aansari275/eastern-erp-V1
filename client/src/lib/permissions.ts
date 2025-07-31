// Temporary permissions file until we fix the shared imports
export const PERMISSIONS = {
  VIEW_QUALITY: 'view_quality',

  VIEW_COMPLIANCE: 'view_compliance',
  MANAGE_USERS: 'manage_users',
  MANAGE_PERMISSIONS: 'manage_permissions',
  EDIT_QUALITY: 'edit_quality',
  CREATE_AUDIT: 'create_audit',
  VIEW_REPORTS: 'view_reports',
} as const;

export const DEPARTMENTS = {
  QUALITY: 'quality',
  SAMPLING: 'sampling',
  PRODUCTION: 'production',
  ADMIN: 'admin',
} as const;

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isAdmin: boolean;
  canAccessDepartments: string[];
}

export const ROLES: Record<string, UserRole> = {
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: [
      PERMISSIONS.VIEW_QUALITY,
      PERMISSIONS.VIEW_COMPLIANCE,
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_PERMISSIONS,
      PERMISSIONS.EDIT_QUALITY,
      PERMISSIONS.CREATE_AUDIT,
      PERMISSIONS.VIEW_REPORTS,
    ],
    isAdmin: true,
    canAccessDepartments: ['quality', 'sampling', 'production', 'admin'],
  },
  QUALITY_MANAGER: {
    id: 'quality-manager',
    name: 'Quality Manager',
    description: 'Quality department management',
    permissions: [
      PERMISSIONS.VIEW_QUALITY,
      PERMISSIONS.VIEW_COMPLIANCE,
      PERMISSIONS.EDIT_QUALITY,
      PERMISSIONS.CREATE_AUDIT,
      PERMISSIONS.VIEW_REPORTS,
    ],
    isAdmin: false,
    canAccessDepartments: ['quality'],
  },
  QUALITY_INSPECTOR: {
    id: 'quality-inspector',
    name: 'Quality Inspector',
    description: 'Quality inspections and audits',
    permissions: [
      PERMISSIONS.VIEW_QUALITY,
      PERMISSIONS.VIEW_COMPLIANCE,
      PERMISSIONS.EDIT_QUALITY,
      PERMISSIONS.CREATE_AUDIT,
    ],
    isAdmin: false,
    canAccessDepartments: ['quality'],
  },

  SAMPLING_MANAGER: {
    id: 'sampling-manager',
    name: 'Sampling Manager',
    description: 'Sampling department management',
    permissions: [
      PERMISSIONS.VIEW_REPORTS,
    ],
    isAdmin: false,
    canAccessDepartments: ['sampling'],
  },
  SAMPLING_TEAM: {
    id: 'sampling-team',
    name: 'Sampling Team',
    description: 'Sampling operations',
    permissions: [],
    isAdmin: false,
    canAccessDepartments: ['sampling'],
  },
  VIEWER: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [],
    isAdmin: false,
    canAccessDepartments: [],
  },
};

export function hasPermission(userRole: UserRole, permission: string): boolean {
  return userRole.permissions.includes(permission);
}

export function canAccessDepartment(userRole: UserRole, department: string): boolean {
  return userRole.canAccessDepartments.includes(department);
}

export function canAccessFeature(userRole: UserRole, feature: string): boolean {
  return userRole.permissions.includes(feature);
}

export function getDefaultRoleForEmail(email: string): string {
  if (email === 'abdulansari@easternmills.com') {
    return 'admin';
  }

  if (email.includes('quality.') || email.includes('quality@')) {
    return 'quality-inspector';
  }
  if (email.includes('@easternmills.com')) {
    return 'quality-inspector'; // Default for Eastern Mills employees
  }
  return 'viewer'; // Default for external users
}

// UserRole interface already exported above