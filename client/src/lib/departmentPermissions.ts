// Comprehensive Department-Based Permission System for Eastern Mills

export const DEPARTMENTS = {
  SAMPLING: 'sampling',
  DESIGNING: 'designing', 
  PRODUCTION: 'production',
  SPINNING: 'spinning',
  QUALITY: 'quality',
  HR: 'hr',
  COMPLIANCE: 'compliance',
  BROADLOOM: 'broadloom',
  MERCHANDISING: 'merchandising',
} as const;

export const TIERS = {
  MANAGER: 'manager',      // Tier 1 - Department head
  SUPERVISOR: 'supervisor', // Tier 2 - Section lead  
  STAFF: 'staff',          // Tier 3 - Individual contributor
} as const;

export const ACCESS_LEVELS = {
  VIEW: 'view',
  EDIT: 'edit',
  ADMIN: 'admin',
} as const;

// Department-specific tabs/sections
export const DEPARTMENT_TABS = {
  quality: {
    LAB: 'lab',
    BAZAAR_INSPECTION: 'bazaar_inspection', 
    FINAL_INSPECTION: 'final_inspection',
    COMPLIANCE: 'compliance',
    AUDITS: 'audits',
  },
  sampling: {
    CREATE_SAMPLES: 'create_samples',
    GALLERY: 'gallery',
    COSTING: 'costing',
    MATERIALS: 'materials',
  },
  production: {
    SCHEDULING: 'scheduling',
    MONITORING: 'monitoring',
    REPORTS: 'reports',
  },
  merchandising: {
    BUYERS: 'buyers',
    ORDERS: 'orders',
    QUOTES: 'quotes',
    PDOCS: 'pdocs',
  },
  designing: {
    CAD: 'cad',
    PATTERNS: 'patterns',
    REVISIONS: 'revisions',
  },
  spinning: {
    YARN_SPECS: 'yarn_specs',
    INVENTORY: 'inventory',
    QUALITY_CHECK: 'quality_check',
  },
  hr: {
    EMPLOYEES: 'employees',
    ATTENDANCE: 'attendance',
    PAYROLL: 'payroll',
  },
  compliance: {
    CERTIFICATIONS: 'certifications',
    AUDITS: 'audits',
    REPORTS: 'reports',
  },
  broadloom: {
    LOOMS: 'looms',
    PRODUCTION: 'production',
    MAINTENANCE: 'maintenance',
  },
} as const;

export interface UserPermission {
  userId: string;
  email: string;
  department: string;
  tier: string;
  accessibleTabs: {
    [tabId: string]: {
      canView: boolean;
      canEdit: boolean;
      canAdmin: boolean;
    };
  };
  crossDepartmentAccess?: {
    [department: string]: {
      canView: boolean;
      tabs?: string[];
    };
  };
}

export interface DepartmentRole {
  id: string;
  name: string;
  department: string;
  tier: string;
  description: string;
  defaultTabs: {
    [tabId: string]: {
      canView: boolean;
      canEdit: boolean;
      canAdmin: boolean;
    };
  };
  crossDepartmentAccess?: {
    [department: string]: {
      canView: boolean;
      tabs?: string[];
    };
  };
}

// Pre-defined roles for specific positions
export const PREDEFINED_ROLES: Record<string, DepartmentRole> = {
  // Quality Department
  LAB_TECHNICIAN: {
    id: 'lab-technician',
    name: 'Lab Technician',
    department: DEPARTMENTS.QUALITY,
    tier: TIERS.STAFF,
    description: 'Laboratory testing only',
    defaultTabs: {
      'lab': {
        canView: true,
        canEdit: true,
        canAdmin: false,
      },
    },
  },
  
  FINAL_INSPECTOR: {
    id: 'final-inspector',
    name: 'Final Inspector',
    department: DEPARTMENTS.QUALITY,
    tier: TIERS.STAFF,
    description: 'Final inspection only',
    defaultTabs: {
      'final_inspection': {
        canView: true,
        canEdit: true,
        canAdmin: false,
      },
    },
  },
  
  QUALITY_SUPERVISOR: {
    id: 'quality-supervisor',
    name: 'Quality Supervisor',
    department: DEPARTMENTS.QUALITY,
    tier: TIERS.SUPERVISOR,
    description: 'Quality department supervision',
    defaultTabs: {
      'lab': {
        canView: true,
        canEdit: true,
        canAdmin: false,
      },
      'bazaar_inspection': {
        canView: true,
        canEdit: true,
        canAdmin: false,
      },
      'final_inspection': {
        canView: true,
        canEdit: true,
        canAdmin: false,
      },
    },
  },
  
  QUALITY_MANAGER: {
    id: 'quality-manager',
    name: 'Quality Manager',
    department: DEPARTMENTS.QUALITY,
    tier: TIERS.MANAGER,
    description: 'Full quality department access',
    defaultTabs: {
      'lab': { canView: true, canEdit: true, canAdmin: true },
      'bazaar_inspection': { canView: true, canEdit: true, canAdmin: true },
      'final_inspection': { canView: true, canEdit: true, canAdmin: true },
      'compliance': { canView: true, canEdit: true, canAdmin: true },
      'audits': { canView: true, canEdit: true, canAdmin: true },
    },
  },
  
  // Admin with cross-department access
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    department: 'admin',
    tier: TIERS.MANAGER,
    description: 'Full system access',
    defaultTabs: {},
    crossDepartmentAccess: {
      quality: { canView: true, tabs: ['lab', 'bazaar_inspection', 'final_inspection', 'compliance', 'audits'] },
      sampling: { canView: true, tabs: ['create_samples', 'gallery', 'costing', 'materials'] },
      production: { canView: true, tabs: ['scheduling', 'monitoring', 'reports'] },
      merchandising: { canView: true, tabs: ['buyers', 'orders', 'quotes', 'pdocs'] },
      designing: { canView: true, tabs: ['cad', 'patterns', 'revisions'] },
      spinning: { canView: true, tabs: ['yarn_specs', 'inventory', 'quality_check'] },
      hr: { canView: true, tabs: ['employees', 'attendance', 'payroll'] },
      compliance: { canView: true, tabs: ['certifications', 'audits', 'reports'] },
      broadloom: { canView: true, tabs: ['looms', 'production', 'maintenance'] },
    },
  },
};

// Utility functions
export function getUserRole(email: string): DepartmentRole {
  // Specific user mappings
  if (email === 'abdulansari@easternmills.com') {
    return PREDEFINED_ROLES.ADMIN;
  }
  
  // Pattern-based role assignment
  if (email.includes('lab.') || email.includes('lab@')) {
    return PREDEFINED_ROLES.LAB_TECHNICIAN;
  }
  
  if (email.includes('quality.manager') || email.includes('qm@')) {
    return PREDEFINED_ROLES.QUALITY_MANAGER;
  }
  
  if (email.includes('quality.') || email.includes('quality@')) {
    return PREDEFINED_ROLES.QUALITY_SUPERVISOR;
  }
  
  // Default for Eastern Mills employees
  if (email.includes('@easternmills.com')) {
    return PREDEFINED_ROLES.QUALITY_SUPERVISOR;
  }
  
  // External users get limited access
  return {
    id: 'viewer',
    name: 'Viewer',
    department: 'none',
    tier: TIERS.STAFF,
    description: 'Limited read-only access',
    defaultTabs: {},
  };
}

export function canAccessDepartment(userRole: DepartmentRole, department: string): boolean {
  // User's own department
  if (userRole.department === department) {
    return true;
  }
  
  // Cross-department access
  if (userRole.crossDepartmentAccess && userRole.crossDepartmentAccess[department]) {
    return userRole.crossDepartmentAccess[department].canView;
  }
  
  return false;
}

export function canAccessTab(userRole: DepartmentRole, department: string, tabId: string): {
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
} {
  // Default no access
  const noAccess = { canView: false, canEdit: false, canAdmin: false };
  
  // Own department tabs
  if (userRole.department === department && userRole.defaultTabs[tabId]) {
    return userRole.defaultTabs[tabId];
  }
  
  // Cross-department access
  if (userRole.crossDepartmentAccess && userRole.crossDepartmentAccess[department]) {
    const crossAccess = userRole.crossDepartmentAccess[department];
    if (crossAccess.tabs && crossAccess.tabs.includes(tabId)) {
      return { canView: true, canEdit: false, canAdmin: false };
    }
  }
  
  return noAccess;
}

export function getDepartmentName(departmentId: string): string {
  const names: Record<string, string> = {
    'sampling': 'Sampling',
    'designing': 'Designing',
    'production': 'Production',
    'spinning': 'Spinning',
    'quality': 'Quality',
    'hr': 'Human Resources',
    'compliance': 'Compliance',
    'broadloom': 'Broadloom',
    'merchandising': 'Merchandising',
    'none': 'No Department',
    'admin': 'Administration',
  };
  
  return names[departmentId] || departmentId;
}

export function getTabName(departmentId: string, tabId: string): string {
  const tabNames: Record<string, Record<string, string>> = {
    'quality': {
      'lab': 'Laboratory',
      'bazaar_inspection': 'Bazaar Inspection',
      'final_inspection': 'Final Inspection',
      'compliance': 'Compliance',
      'audits': 'Audits',
    },
    'sampling': {
      'create_samples': 'Create Samples',
      'gallery': 'Sample Gallery',
      'costing': 'Costing',
      'materials': 'Materials',
    },
    'production': {
      'scheduling': 'Production Scheduling',
      'monitoring': 'Process Monitoring',
      'reports': 'Production Reports',
    },
    'merchandising': {
      'buyers': 'Buyer Management',
      'orders': 'Order Processing',
      'quotes': 'Quotations',
      'pdocs': 'Product Documents',
    },
    'designing': {
      'cad': 'CAD Design',
      'patterns': 'Pattern Library',
      'revisions': 'Design Revisions',
    },
    'spinning': {
      'yarn_specs': 'Yarn Specifications',
      'inventory': 'Yarn Inventory',
      'quality_check': 'Quality Control',
    },
    'hr': {
      'employees': 'Employee Management',
      'attendance': 'Attendance Tracking',
      'payroll': 'Payroll Management',
    },
    'compliance': {
      'certifications': 'Certifications',
      'audits': 'Audit Management',
      'reports': 'Compliance Reports',
    },
    'broadloom': {
      'looms': 'Loom Management',
      'production': 'Broadloom Production',
      'maintenance': 'Equipment Maintenance',
    },
  };
  
  return tabNames[departmentId]?.[tabId] || tabId;
}