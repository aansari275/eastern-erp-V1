import { z } from 'zod';
// Lab Inspection Schema for Firestore - Updated based on user requirements
export const LabInspectionSchema = z.object({
    id: z.string().optional(),
    // Section 1: Incoming & Supplier Info
    materialIncomingDate: z.string(),
    challanNumber: z.string(),
    supplierName: z.string(),
    transportCondition: z.enum(['Ok', 'Not Ok']),
    // Section 2: Drying Details (removed qty, program qty, article name, material details, opened bundle)
    lotNumber: z.string(),
    tagNumber: z.string(),
    shadeNumber: z.string(),
    // Section 3: Process Verification (simplified to just remarks)
    processRemarks: z.string().default(''),
    // Section 4: Testing Parameters (standard and tolerance from attachments)
    testingParameters: z.array(z.object({
        testName: z.string(),
        result: z.string(), // First hank result
        hankResults: z.array(z.string()).optional() // Additional hank results (2nd, 3rd, 4th hanks)
    })),
    testingParametersRemarks: z.string().default(''), // Remarks field after Hank Variations
    // Section 5: Moisture Compliance
    moistureContentTolerance: z.enum(['Ok', 'Not Ok']),
    // Section 6: Sign-off
    checkedBy: z.string(),
    verifiedBy: z.string(),
    // Section 7: Attachments (contains standards and tolerances)
    attachments: z.array(z.string()).default([]), // URLs to Firebase Storage
    // System fields
    status: z.enum(['draft', 'submitted']).default('draft'),
    company: z.enum(['EHI', 'EMPL']).default('EHI'),
    materialType: z.literal('dyed').default('dyed'),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    submittedAt: z.string().optional(),
    createdBy: z.string().optional()
});
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
// Validation schemas
export const insertComplianceAuditSchema = z.object({
    auditDate: z.string(),
    auditorName: z.string().min(1),
    company: z.enum(['EHI', 'EMPL']),
    location: z.string().min(1),
    auditScope: z.string().min(1),
    parts: z.array(z.any()),
    status: z.enum(['draft', 'submitted']).default('draft'),
});
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
// Zod validation schema for buyer article numbers (OPS line items)
export const insertBuyerArticleNoSchema = z.object({
    buyer_article_no: z.string().min(1),
    department_id: z.string().min(1),
    created_by: z.string().min(1),
    rug_id: z.string().min(1),
});
// Zod schema for quotes
export const insertQuoteSchema = z.object({
    buyerId: z.string().min(1),
    rugId: z.string().min(1),
    price: z.number(),
    currency: z.string().min(1),
    notes: z.string().optional(),
});
