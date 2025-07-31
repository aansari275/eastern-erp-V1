import { Router } from 'express';
import { adminDb } from '../firestoreHelpers.js';

const router = Router();

interface ChecklistItem {
  code: string;
  question: string;
  response?: 'Yes' | 'No' | 'NA';
  remark?: string;
  evidence: string[];
}

interface AuditData {
  auditDate: string;
  company: 'EHI' | 'EMPL';
  auditor: string;
  status: 'draft' | 'submitted';
  checklist: ChecklistItem[];
  createdAt: string;
  submittedAt?: string;
}

/**
 * Create new audit in clean 'audit' collection
 * POST /api/audit
 */
router.post('/', async (req, res) => {
  try {
    console.log('🔍 Testing adminDb availability:', typeof adminDb);
    console.log('🔍 AdminDb methods:', Object.getOwnPropertyNames(adminDb));
    
    // Test the collection access directly
    try {
      const testCollection = adminDb.collection('audit');
      console.log('✅ Collection access works:', typeof testCollection);
    } catch (collectionError: any) {
      console.error('❌ Collection access failed:', collectionError);
      return res.status(500).json({
        success: false,
        error: 'Firebase collection access failed: ' + (collectionError?.message || 'Unknown error')
      });
    }

    console.log('🆕 Creating new audit with clean structure');
    console.log('📋 Request status:', req.body.status);
    
    const auditData: AuditData = {
      auditDate: String(req.body.auditDate || new Date().toISOString().split('T')[0]),
      company: (req.body.company === 'EMPL' ? 'EMPL' : 'EHI') as 'EHI' | 'EMPL',
      auditor: String(req.body.auditor || ''),
      status: (req.body.status === 'submitted' ? 'submitted' : 'draft') as 'draft' | 'submitted',
      checklist: (req.body.checklist || []).map((item: any) => ({
        code: String(item.code || ''),
        question: String(item.question || ''),
        response: item.response === undefined ? '' : item.response,
        remark: String(item.remark || ''),
        evidence: Array.isArray(item.evidence) ? 
          item.evidence.filter((url: string) => typeof url === 'string').slice(0, 5) : []
      })),
      createdAt: new Date().toISOString()
    };

    // Only add submittedAt if status is submitted
    let finalAuditData: AuditData = auditData;
    if (req.body.status === 'submitted') {
      finalAuditData = { ...auditData, submittedAt: new Date().toISOString() };
      console.log('✅ Added submittedAt field');
    } else {
      console.log('⏸️ Skipping submittedAt (draft status)');
    }
    
    console.log('📋 Final audit data keys:', Object.keys(finalAuditData));
    console.log('📋 Has submittedAt:', 'submittedAt' in finalAuditData);

    console.log('📋 Audit checklist items:', finalAuditData.checklist.length);
    console.log('📊 Items with evidence:', finalAuditData.checklist.filter(item => item.evidence.length > 0).length);
    console.log('📝 Sample item:', finalAuditData.checklist[0] ? {
      code: finalAuditData.checklist[0].code,
      response: finalAuditData.checklist[0].response,
      evidenceCount: finalAuditData.checklist[0].evidence.length
    } : 'No items');

    // Save to new 'audit' collection
    const docRef = await adminDb.collection('audit').add(finalAuditData);
    
    console.log('✅ Audit saved to collection "audit" with ID:', docRef.id);

    res.json({
      success: true,
      id: docRef.id,
      message: 'Audit created successfully in clean structure'
    });

  } catch (error) {
    console.error('❌ Error creating audit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create audit'
    });
  }
});

/**
 * Get all audits from clean 'audit' collection
 * GET /api/audit
 */
router.get('/', async (req, res) => {
  try {
    if (!adminDb) {
      return res.status(500).json({
        success: false,
        error: 'Firebase admin not available'
      });
    }

    console.log('📋 Fetching all audits from clean collection');
    
    const snapshot = await adminDb.collection('audit').orderBy('createdAt', 'desc').get();
    
    const audits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('✅ Retrieved', audits.length, 'audits from clean collection');

    res.json({
      success: true,
      audits
    });

  } catch (error) {
    console.error('❌ Error fetching audits:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch audits'
    });
  }
});

/**
 * Get specific audit by ID from clean 'audit' collection
 * GET /api/audit/:id
 */
router.get('/:id', async (req, res) => {
  try {
    if (!adminDb) {
      return res.status(500).json({
        success: false,
        error: 'Firebase admin not available'
      });
    }

    const { id } = req.params;
    console.log('📋 Fetching audit by ID:', id);
    
    const doc = await adminDb.collection('audit').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Audit not found'
      });
    }

    const auditData = doc.data() as AuditData;
    const audit = {
      id: doc.id,
      ...auditData
    };

    console.log('✅ Retrieved audit with', audit.checklist?.length || 0, 'checklist items');

    res.json({
      success: true,
      audit
    });

  } catch (error) {
    console.error('❌ Error fetching audit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch audit'
    });
  }
});

/**
 * Update audit in clean 'audit' collection
 * PUT /api/audit/:id
 */
router.put('/:id', async (req, res) => {
  try {
    if (!adminDb) {
      return res.status(500).json({
        success: false,
        error: 'Firebase admin not available'
      });
    }

    const { id } = req.params;
    console.log('🔄 Updating audit:', id);

    const updateData: any = {
      auditDate: String(req.body.auditDate || new Date().toISOString().split('T')[0]),
      company: req.body.company === 'EMPL' ? 'EMPL' : 'EHI',
      auditor: String(req.body.auditor || ''),
      status: req.body.status === 'submitted' ? 'submitted' : 'draft',
      checklist: (req.body.checklist || []).map((item: any) => ({
        code: String(item.code || ''),
        question: String(item.question || ''),
        response: item.response === undefined ? '' : item.response,
        remark: String(item.remark || ''),
        evidence: Array.isArray(item.evidence) ? 
          item.evidence.filter((url: string) => typeof url === 'string').slice(0, 5) : []
      }))
    };

    // Add submittedAt if status is submitted
    if (updateData.status === 'submitted') {
      updateData.submittedAt = new Date().toISOString();
    }

    await adminDb.collection('audit').doc(id).update(updateData);
    
    console.log('✅ Audit updated successfully');

    res.json({
      success: true,
      message: 'Audit updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating audit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update audit'
    });
  }
});

/**
 * Delete audit from clean 'audit' collection
 * DELETE /api/audit/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    if (!adminDb) {
      return res.status(500).json({
        success: false,
        error: 'Firebase admin not available'
      });
    }

    const { id } = req.params;
    console.log('🗑️ Deleting audit:', id);

    await adminDb.collection('audit').doc(id).delete();
    
    console.log('✅ Audit deleted successfully');

    res.json({
      success: true,
      message: 'Audit deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting audit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete audit'
    });
  }
});

export default router;