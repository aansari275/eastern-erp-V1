
import { z } from 'zod';

// Clean Compliance Audit Schema with single checklist[] structure
export const ChecklistItemSchema = z.object({
  code: z.string(),
  question: z.string(),
  response: z.enum(['Yes', 'No', 'NA']).optional(),
  remark: z.string().default(''),
  evidence: z.array(z.string()).default([])
});

export const ComplianceAuditSchema = z.object({
  id: z.string().optional(),
  auditDate: z.string(),
  company: z.enum(['EHI', 'EMPL']).default('EHI'),
  auditorName: z.string().default(''),
  location: z.string().default(''),
  auditScope: z.string().default(''),
  checklist: z.array(ChecklistItemSchema),
  status: z.enum(['draft', 'submitted']).default('draft'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  submittedAt: z.string().optional(),
  createdBy: z.string().optional()
});

export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type ComplianceAuditZod = z.infer<typeof ComplianceAuditSchema>;
export type InsertComplianceAuditZod = z.infer<typeof ComplianceAuditSchema>;

// Clean audit data structure for the new 'audit' collection  
export interface AuditData {
  id?: string;
  auditDate: string;
  company: 'EHI' | 'EMPL';
  auditor: string;
  status: 'draft' | 'submitted';
  checklist: ChecklistItem[];
  createdAt: string;
  submittedAt?: string;
}

// Unified Lab Inspection Schema for all material types
export const LabInspectionSchema = z.object({
  id: z.string().optional(),
  
  // Section 1: Basic Information
  materialIncomingDate: z.string(),
  challanNumber: z.string(),
  supplierName: z.string(),
  transportCondition: z.enum(['Ok', 'Not Ok']),
  
  // Section 2: Material Details (conditional based on type)
  materialName: z.string().default(''),
  lotNumber: z.string(),
  tagNumber: z.string().optional(), // Only for dyed materials
  shadeNumber: z.string().optional(), // Only for dyed materials
  
  // Section 3: Process Verification
  processRemarks: z.string().default(''),
  
  // Section 4: Testing Parameters (different for each material type)
  testingParameters: z.array(z.object({
    testName: z.string(),
    result: z.string(),
    hankResults: z.array(z.string()).optional()
  })),
  
  // For undyed materials: Material Samples
  materialSamples: z.array(z.object({
    materialDetails: z.string(),
    numberOfBundles: z.string(),
    lotNumber: z.string(),
    selectedSampleFromLots: z.string(),
    quantity: z.string(),
  })).optional(),
  
  // Testing results for undyed materials
  testingResults: z.array(z.object({
    parameterName: z.string(),
    standard: z.string(),
    sampleResults: z.array(z.object({
      sampleIndex: z.number(),
      result: z.string().optional(),
    })),
  })).optional(),
  
  // Moisture Content fields
  moistureContentPercent: z.string().default(''),
  moistureContentTolerance: z.object({
    maxPercentageInWinter: z.string().default('12'),
    maxPercentageInRainy: z.string().default('16'),
    remarks: z.string().optional(),
  }).optional(),
  
  smellResult: z.string().default(''),
  testingParametersRemarks: z.string().default(''),
  
  // Section 5: Sign-off
  checkedBy: z.string(),
  verifiedBy: z.string(),
  
  // Section 6: Photos
  photos: z.array(z.string()).default([]),
  
  // System fields
  status: z.enum(['draft', 'submitted']).default('draft'),
  company: z.enum(['EHI', 'EMPL']).default('EHI'),
  materialType: z.enum(['dyed', 'undyed', 'cotton']).default('dyed'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  submittedAt: z.string().optional(),
  createdBy: z.string().optional()
});

export type LabInspection = z.infer<typeof LabInspectionSchema>;
export type CreateLabInspection = Omit<LabInspection, 'id' | 'createdAt' | 'updatedAt'>;

// Legacy undyed schema - now handled by unified LabInspectionSchema
// Keep for backward compatibility
export const UndyedLabInspectionSchema = LabInspectionSchema.extend({
  materialType: z.literal('undyed').default('undyed'),
});

export type UndyedLabInspection = z.infer<typeof UndyedLabInspectionSchema>;
export type CreateUndyedLabInspection = Omit<UndyedLabInspection, 'id' | 'createdAt' | 'updatedAt'>;

// Zod validation schemas for new 3-tiered user model
export const insertUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  department: z.string().min(1),
  subDepartment: z.string().nullable().optional(),
  tabs: z.array(z.string()),
  permissions: z.array(z.string()),
  role: z.string().min(1),
  isActive: z.boolean().optional().default(true),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  department_id: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Zod validation schemas for department operations
export const insertDepartmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

// User Tab Permission Types
export interface UserTabPermission {
  id: string;
  user_id: string;
  tab_id: string;
  department_id?: string;
  permission: 'view' | 'edit' | 'admin';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// New 3-tiered user model
export interface User {
  uid: string;
  email: string;
  department: string;                    // Tier 1: quality, production, merchandising
  subDepartment?: string | null;         // Tier 2: inspection, compliance, packing (optional)
  tabs: string[];                        // Tier 3: lab, final, bazaar, dispatch, audit
  permissions: string[];                 // view_lab, edit_final, manage_compliance
  role: string;                          // staff, supervisor, manager
  isActive: boolean;
  first_name?: string;
  last_name?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Compliance Audit Schema
export interface ComplianceAuditItem {
  id: string;
  question: string;
  response: 'Yes' | 'No' | 'NA' | '';
  remark: string;
  evidenceImages: string[]; // Array of image URLs
}

export interface ComplianceAuditPart {
  id: string;
  title: string;
  items: ComplianceAuditItem[];
  weight: number;
  maxPoints: number;
}

export interface ComplianceAudit {
  id: string;
  auditDate: string;
  auditorName: string;
  company: 'EHI' | 'EMPL';
  location: string;
  auditScope: string;
  parts: ComplianceAuditPart[];
  checklist?: Array<{
    code: string;
    question: string;
    response?: 'Yes' | 'No' | 'NA';
    remark?: string;
    evidence: string[];
  }>;
  status: 'draft' | 'submitted';
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  scoreData?: {
    totalItems: number;
    yesCount: number;
    noCount: number;
    naCount: number;
    applicableItems: number;
    score: number;
  };
}



// Validation schemas
export const insertComplianceAuditSchema = z.object({
  auditDate: z.string(),
  auditorName: z.string().min(1),
  company: z.enum(['EHI', 'EMPL']),
  location: z.string().min(1),
  auditScope: z.string().min(1),
  parts: z.array(z.any()),
  checklist: z.array(z.object({
    code: z.string(),
    question: z.string(),
    response: z.enum(['Yes', 'No', 'NA']).optional(),
    remark: z.string().optional(),
    evidence: z.array(z.string()).default([])
  })).optional(),
  status: z.enum(['draft', 'submitted']).default('draft'),
});



export type InsertComplianceAuditSchema = z.infer<typeof insertComplianceAuditSchema>;

// Legacy user interface for backward compatibility
export interface LegacyUser {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  department_id?: string;
  role?: string;
  isActive: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Zod validation schemas for user permissions
export const insertUserTabPermissionSchema = z.object({
  userId: z.string(),
  tabId: z.string(),
  permission: z.enum(['view', 'edit', 'admin']),
  is_active: z.boolean().optional(),
});

// Zod validation schemas for buyers
export const insertBuyerSchema = z.object({
  buyerName: z.string().min(1),
  buyerCode: z.string().min(1),
  merchantId: z.string().optional(),
  reference: z.string().optional(),
  currency: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryAddress: z.string().optional(),
  invoiceAddress: z.string().optional(),
  shipmentMethod: z.string().optional(),
  articleNumbers: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Zod validation schemas for Sample Dispatch Inspection
export const insertSampleDispatchInspectionSchema = z.object({
  buyer: z.string().min(1, "Buyer is required"),
  articleDesign: z.string().min(1, "Article/Design is required"),
  inspectionDate: z.string().min(1, "Inspection date is required"),
  size: z.string().min(1, "Size is required"),
  quality: z.string().min(1, "Quality is required"),
  construction: z.string().min(1, "Construction is required"),
  color: z.string().min(1, "Color is required"),
  weight: z.string().optional(),
  gsm: z.string().optional(),
  pile: z.string().optional(),
  gauge: z.string().optional(),
  defects: z.array(z.object({
    type: z.string(),
    severity: z.enum(['Minor', 'Major', 'Critical']),
    description: z.string(),
    location: z.string().optional(),
  })).optional(),
  overallGrade: z.enum(['A', 'B', 'C', 'D']),
  comments: z.string().optional(),
  inspectorName: z.string().min(1, "Inspector name is required"),
  inspectorEmail: z.string().email("Valid email is required"),
  images: z.array(z.object({
    url: z.string(),
    type: z.enum(['defect', 'label', 'back', 'front', 'overall']),
    description: z.string().optional(),
  })).optional(),
  approvedForDispatch: z.boolean(),
  timestamp: z.string(),
});

export type InsertSampleDispatchInspection = z.infer<typeof insertSampleDispatchInspectionSchema>;

// TypeScript interfaces for legacy compatibility
export interface LegacyUserInterface {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  department_id?: string;
  role?: string;
  isActive?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Department interface moved up to avoid conflicts

export interface SampleDispatchInspection {
  id: string;
  buyer: string;
  articleDesign: string;
  inspectionDate: string;
  size: string;
  quality: string;
  construction: string;
  color: string;
  weight?: string;
  gsm?: string;
  pile?: string;
  gauge?: string;
  defects?: Array<{
    type: string;
    severity: 'Minor' | 'Major' | 'Critical';
    description: string;
    location?: string;
  }>;
  overallGrade: 'A' | 'B' | 'C' | 'D';
  comments?: string;
  inspectorName: string;
  inspectorEmail: string;
  images?: Array<{
    url: string;
    type: 'defect' | 'label' | 'back' | 'front' | 'overall';
    description?: string;
  }>;
  approvedForDispatch: boolean;
  timestamp: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserTabPermission {
  id: string;
  user_id: string;
  tab_id: string;
  department_id?: string;
  permission: 'view' | 'edit' | 'admin';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Buyer {
  id: number | string;
  buyerName: string;
  buyerCode: string;
  merchantId?: string;
  reference?: string;
  currency?: string;
  paymentTerms?: string;
  deliveryAddress?: string;
  invoiceAddress?: string;
  shipmentMethod?: string;
  articleNumbers?: string[];
  notes?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Zod validation schema for buyer article numbers (OPS line items)
export const insertBuyerArticleNoSchema = z.object({
  buyer_article_no: z.string().min(1),
  department_id: z.string().min(1),
  created_by: z.string().min(1),
  rug_id: z.string().min(1),
});

// Type aliases for insert operations
// InsertUser already defined above
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertUserTabPermission = z.infer<typeof insertUserTabPermissionSchema>;
export type InsertBuyer = z.infer<typeof insertBuyerSchema>;
export type InsertBuyerArticleNo = z.infer<typeof insertBuyerArticleNoSchema>;
// Zod schema for quotes
export const insertQuoteSchema = z.object({
  buyerId: z.string().min(1),
  rugId: z.string().min(1),
  price: z.number(),
  currency: z.string().min(1),
  notes: z.string().optional(),
});

// Type alias
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
