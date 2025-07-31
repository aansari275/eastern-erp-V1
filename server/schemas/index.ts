import { z } from 'zod';

// Base schema for common fields
export const BaseSchema = z.object({
  id: z.string().optional(),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
});

// User Schema
export const UserSchema = BaseSchema.extend({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  department: z.enum(['sampling', 'quality', 'merchandising', 'admin']).optional(),
  role: z.enum(['user', 'supervisor', 'manager', 'admin']).default('user'),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  lastLogin: z.union([z.date(), z.string()]).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.string().default('en'),
    notifications: z.object({
      email: z.boolean().default(true),
      browser: z.boolean().default(true),
      mobile: z.boolean().default(false),
    }).default({}),
  }).default({}),
});

// Material Schema
export const MaterialSchema = BaseSchema.extend({
  name: z.string().min(1, 'Material name is required'),
  type: z.enum(['warp', 'weft', 'pile', 'backing', 'other']),
  category: z.string().optional(),
  supplier: z.string().optional(),
  rate: z.number().min(0, 'Rate must be positive'),
  unit: z.enum(['kg', 'meter', 'yard', 'piece']).default('kg'),
  currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),
  stockQuantity: z.number().min(0).default(0),
  reorderLevel: z.number().min(0).default(0),
  description: z.string().optional(),
  specifications: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});

// Buyer Schema
export const BuyerSchema = BaseSchema.extend({
  name: z.string().min(1, 'Buyer name is required'),
  code: z.string().min(1, 'Buyer code is required'),
  contactPerson: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  merchantId: z.string().optional(),
  reference: z.string().optional(),
  currency: z.enum(['INR', 'USD', 'EUR']).default('USD'),
  paymentTerms: z.string().optional(),
  deliveryAddress: z.string().optional(),
  invoiceAddress: z.string().optional(),
  shipmentMethod: z.string().optional(),
  articleNumbers: z.array(z.string()).default([]),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});

// Rug/Sample Schema
export const RugSchema = BaseSchema.extend({
  articleNumber: z.string().min(1, 'Article number is required'),
  buyerCode: z.string().min(1, 'Buyer code is required'),
  buyerName: z.string().optional(),
  construction: z.string().min(1, 'Construction is required'),
  quality: z.string().optional(),
  designName: z.string().min(1, 'Design name is required'),
  colour: z.string().min(1, 'Colour is required'),
  selectedColors: z.array(z.string()).default([]),
  size: z.string().min(1, 'Size is required'),
  material: z.string().min(1, 'Material is required'),
  description: z.string().optional(),
  status: z.enum(['Draft', 'Active', 'Inactive', 'Archived']).default('Draft'),
  
  // Production details
  orderType: z.string().optional(),
  opsNo: z.string().optional(),
  carpetNo: z.string().optional(),
  finishedGSM: z.number().min(0).optional(),
  unfinishedGSM: z.number().min(0).optional(),
  typeOfDyeing: z.string().optional(),
  contractorType: z.enum(['contractor', 'inhouse']).optional(),
  contractorName: z.string().optional(),
  weaverName: z.string().optional(),
  submittedBy: z.string().optional(),
  washingContractor: z.string().optional(),
  hasWashing: z.enum(['yes', 'no']).default('no'),
  
  // Technical specifications
  warpIn6Inches: z.number().min(0).optional(),
  weftIn6Inches: z.number().min(0).optional(),
  pileHeightMM: z.number().min(0).optional(),
  totalThicknessMM: z.number().min(0).optional(),
  edgeLongerSide: z.string().optional(),
  edgeShortSide: z.string().optional(),
  fringesHemLength: z.string().optional(),
  fringesHemMaterial: z.string().optional(),
  shadeCardNo: z.string().optional(),
  
  // Materials and costs
  materials: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['warp', 'weft']),
    consumption: z.number().min(0),
    rate: z.number().min(0),
    dyeingCost: z.number().min(0).default(0),
    handSpinningCost: z.number().min(0).default(0),
    costPerSqM: z.number().min(0),
    plyCount: z.number().optional(),
  })).default([]),
  
  weavingCost: z.number().min(0).default(0),
  finishingCost: z.number().min(0).default(0),
  packingCost: z.number().min(0).default(125),
  overheadPercentage: z.number().min(0).max(100).default(5),
  profitPercentage: z.number().min(0).max(100).default(0),
  
  processFlow: z.array(z.object({
    process: z.string(),
    step: z.number().min(1).max(10),
  })).default([]),
  
  totalMaterialCost: z.number().min(0).default(0),
  totalDirectCost: z.number().min(0).default(0),
  finalCostPSM: z.number().min(0).default(0),
  area: z.number().min(0).default(0),
  unit: z.enum(['PSM', 'PSF']).default('PSM'),
  currency: z.enum(['INR', 'USD']).default('INR'),
  exchangeRate: z.number().min(0).default(83),
  
  // Images and attachments
  images: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).default([]),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  isTemplate: z.boolean().default(false),
});

// Lab Inspection Schema
export const LabInspectionSchema = BaseSchema.extend({
  inspectionType: z.enum(['dyed', 'undyed', 'cotton']),
  company: z.enum(['EHI', 'EM', 'RG']),
  dateOfIncoming: z.string(),
  challanInvoiceNo: z.string().min(1, 'Challan/Invoice number is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  transportCondition: z.enum(['ok', 'not_ok']),
  
  // Common fields
  noOfBales: z.number().min(0).optional(),
  actualWeight: z.number().min(0).optional(),
  supplierWeight: z.number().min(0).optional(),
  
  // Dyed material specific
  color: z.string().optional(),
  shade: z.string().optional(),
  
  // Cotton specific  
  cottonType: z.string().optional(),
  grade: z.string().optional(),
  
  // Test parameters (dynamic based on inspection type)
  testParameters: z.record(z.any()).optional(),
  
  // Sample results
  sampleResults: z.array(z.object({
    id: z.string(),
    sampleId: z.string(),
    testParameters: z.array(z.object({
      name: z.string(),
      value: z.union([z.string(), z.number()]),
      unit: z.string().optional(),
      status: z.enum(['pass', 'fail', 'na']),
      remarks: z.string().optional(),
    })),
    overallStatus: z.enum(['pass', 'fail']),
    remarks: z.string().optional(),
  })).default([]),
  
  remarks: z.string().optional(),
  status: z.enum(['draft', 'submitted']).default('draft'),
  overallStatus: z.enum(['ok', 'not_ok']).optional(),
  checkedBy: z.string(),
  verifiedBy: z.string().optional(),
  
  // Auto-save support
  lastSaved: z.union([z.date(), z.string()]).optional(),
  autoSaveData: z.record(z.any()).optional(),
});

// Compliance Audit Schema
export const ComplianceAuditSchema = BaseSchema.extend({
  company: z.enum(['EHI', 'EM', 'RG']),
  auditDate: z.string(),
  auditType: z.enum(['internal', 'external', 'customer']).default('internal'),
  auditor: z.string().min(1, 'Auditor name is required'),
  department: z.string().optional(),
  
  // Audit sections
  sections: z.array(z.object({
    id: z.string(),
    name: z.string(),
    questions: z.array(z.object({
      id: z.string(),
      question: z.string(),
      response: z.enum(['yes', 'no', 'na']),
      evidence: z.string().optional(),
      remarks: z.string().optional(),
      weight: z.number().min(0).max(10).default(1),
    })),
    score: z.number().min(0).max(100).optional(),
    maxScore: z.number().min(0).optional(),
  })).default([]),
  
  // Overall results
  totalScore: z.number().min(0).max(100).optional(),
  complianceScore: z.number().min(0).max(100).optional(),
  status: z.enum(['draft', 'submitted']).default('draft'),
  
  // Action items
  actionItems: z.array(z.object({
    id: z.string(),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    assignee: z.string().optional(),
    dueDate: z.string().optional(),
    status: z.enum(['open', 'in_progress', 'closed']).default('open'),
  })).default([]),
  
  // Attachments
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })).default([]),
  
  remarks: z.string().optional(),
  nextAuditDate: z.string().optional(),
});

// Order Schema
export const OrderSchema = BaseSchema.extend({
  orderNumber: z.string().min(1, 'Order number is required'),
  buyerCode: z.string().min(1, 'Buyer code is required'),
  buyerName: z.string().optional(),
  orderDate: z.string(),
  deliveryDate: z.string(),
  status: z.enum(['draft', 'confirmed', 'in_production', 'completed', 'cancelled']).default('draft'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  
  // Order items
  items: z.array(z.object({
    id: z.string(),
    articleNumber: z.string(),
    designName: z.string(),
    size: z.string(),
    color: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),
    specifications: z.record(z.any()).optional(),
  })),
  
  // Financial details
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  currency: z.enum(['INR', 'USD', 'EUR']).default('USD'),
  exchangeRate: z.number().min(0).default(1),
  
  // Shipping details
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
  }).optional(),
  
  shippingMethod: z.string().optional(),
  shippingCost: z.number().min(0).default(0),
  
  // Production tracking
  productionStatus: z.enum(['not_started', 'sampling', 'weaving', 'finishing', 'quality_check', 'packing', 'shipped']).default('not_started'),
  estimatedCompletion: z.string().optional(),
  actualCompletion: z.string().optional(),
  
  // Quality checks
  qualityChecks: z.array(z.object({
    id: z.string(),
    checkDate: z.string(),
    inspector: z.string(),
    result: z.enum(['pass', 'fail', 'conditional']),
    remarks: z.string().optional(),
  })).default([]),
  
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// Production Schema
export const ProductionSchema = BaseSchema.extend({
  orderNumber: z.string(),
  articleNumber: z.string(),
  batchNumber: z.string().min(1, 'Batch number is required'),
  quantity: z.number().min(1),
  status: z.enum(['queued', 'in_progress', 'completed', 'on_hold', 'cancelled']).default('queued'),
  
  // Production stages
  stages: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['pending', 'in_progress', 'completed', 'skipped']).default('pending'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    assignee: z.string().optional(),
    remarks: z.string().optional(),
    qualityCheck: z.object({
      required: z.boolean().default(false),
      completed: z.boolean().default(false),
      result: z.enum(['pass', 'fail']).optional(),
      inspector: z.string().optional(),
      date: z.string().optional(),
    }).optional(),
  })).default([]),
  
  // Resource allocation
  resources: z.array(z.object({
    type: z.enum(['material', 'machine', 'labor']),
    name: z.string(),
    quantity: z.number().min(0),
    unit: z.string(),
    cost: z.number().min(0).optional(),
  })).default([]),
  
  // Quality metrics
  qualityMetrics: z.object({
    defectRate: z.number().min(0).max(100).optional(),
    reworkRequired: z.boolean().default(false),
    inspectionResults: z.array(z.object({
      date: z.string(),
      inspector: z.string(),
      result: z.enum(['pass', 'fail', 'conditional']),
      defects: z.array(z.string()).default([]),
      remarks: z.string().optional(),
    })).default([]),
  }).optional(),
  
  // Cost tracking
  costs: z.object({
    materialCost: z.number().min(0).default(0),
    laborCost: z.number().min(0).default(0),
    overheadCost: z.number().min(0).default(0),
    totalCost: z.number().min(0).default(0),
  }).optional(),
  
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedDuration: z.number().min(0).optional(), // in hours
  actualDuration: z.number().min(0).optional(), // in hours
  efficiency: z.number().min(0).max(200).optional(), // percentage
  
  notes: z.string().optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })).default([]),
});

// Export all schemas
export {
  BaseSchema,
  UserSchema,
  MaterialSchema,
  BuyerSchema,
  RugSchema,
  LabInspectionSchema,
  ComplianceAuditSchema,
  OrderSchema,
  ProductionSchema,
};

// Type definitions
export type User = z.infer<typeof UserSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type Buyer = z.infer<typeof BuyerSchema>;
export type Rug = z.infer<typeof RugSchema>;
export type LabInspection = z.infer<typeof LabInspectionSchema>;
export type ComplianceAudit = z.infer<typeof ComplianceAuditSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Production = z.infer<typeof ProductionSchema>;