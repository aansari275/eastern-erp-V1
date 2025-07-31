import express from 'express';
import { adminDb } from '../firebase';

const router = express.Router();

/**
 * Clean Compliance Audit Routes - Single checklist[] structure
 */

/**
 * Create compliance audit
 * POST /api/audits/compliance
 */
router.post('/compliance', async (req, res) => {
  try {
    if (!adminDb) {
      return res.status(500).json({
        success: false,
        error: 'Firebase admin not available'
      });
    }

    // Clean structure with single checklist[] array
    const auditData = {
      auditDate: String(req.body.auditDate || new Date().toISOString().split('T')[0]),
      company: String(req.body.company || 'EHI'),
      auditorName: String(req.body.auditorName || ''),
      location: String(req.body.location || ''),
      auditScope: String(req.body.auditScope || ''),
      checklist: (req.body.checklist || []).map((item: any) => ({
        code: String(item.code || ''),
        question: String(item.question || ''),
        response: item.response || undefined,
        remark: String(item.remark || ''),
        evidence: Array.isArray(item.evidence) ? item.evidence.filter((url: string) => 
          typeof url === 'string' && (
            url.startsWith('https://firebasestorage.googleapis.com/') ||
            url.startsWith('data:image/')
          )
        ).slice(0, 5) : []
      })),
      status: String(req.body.status || 'draft'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: String(req.body.createdBy || '')
    };

    // Add submittedAt if status is submitted
    if (auditData.status === 'submitted') {
      (auditData as any).submittedAt = new Date().toISOString();
    }

    console.log('🧹 CLEAN: Creating audit with checklist items:', auditData.checklist.length);
    console.log('🧹 CLEAN: Sample checklist item:', auditData.checklist[0] ? {
      code: auditData.checklist[0].code,
      response: auditData.checklist[0].response,
      evidenceCount: auditData.checklist[0].evidence.length
    } : 'No items');

    const docRef = await adminDb.collection('complianceAudits').add(auditData);
    
    res.json({
      success: true,
      id: docRef.id,
      message: 'Compliance audit created successfully'
    });
  } catch (error) {
    console.error('Error creating compliance audit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create audit'
    });
  }
});

/**
 * Update compliance audit
 * PUT /api/audits/compliance/:id
 */
router.put('/compliance/:id', async (req, res) => {
  try {
    if (!adminDb) {
      return res.status(500).json({
        success: false,
        error: 'Firebase admin not available'
      });
    }

    const auditId = req.params.id;
    console.log('🧹 CLEAN: Updating audit:', auditId);

    // Clean structure with single checklist[] array
    const updateData = {
      auditDate: String(req.body.auditDate || new Date().toISOString().split('T')[0]),
      company: String(req.body.company || 'EHI'),
      auditorName: String(req.body.auditorName || ''),
      location: String(req.body.location || ''),
      auditScope: String(req.body.auditScope || ''),
      checklist: (req.body.checklist || []).map((item: any) => ({
        code: String(item.code || ''),
        question: String(item.question || ''),
        response: item.response || undefined,
        remark: String(item.remark || ''),
        evidence: Array.isArray(item.evidence) ? item.evidence.filter((url: string) => 
          typeof url === 'string' && (
            url.startsWith('https://firebasestorage.googleapis.com/') ||
            url.startsWith('data:image/')
          )
        ).slice(0, 5) : []
      })),
      status: String(req.body.status || 'draft'),
      updatedAt: new Date().toISOString()
    };

    // Add submittedAt if status is submitted
    if (updateData.status === 'submitted') {
      (updateData as any).submittedAt = new Date().toISOString();
    }

    console.log('🧹 CLEAN: Updating with checklist items:', updateData.checklist.length);
    console.log('🧹 CLEAN: Evidence items count:', updateData.checklist.filter(item => item.evidence.length > 0).length);

    const docRef = adminDb.collection('complianceAudits').doc(auditId);
    const docSnapshot = await docRef.get();
    
    if (!docSnapshot.exists) {
      return res.status(404).json({
        success: false,
        error: 'Audit not found'
      });
    }

    await docRef.update(updateData);
    
    res.json({
      success: true,
      message: 'Compliance audit updated successfully'
    });
  } catch (error) {
    console.error('Error updating compliance audit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update audit'
    });
  }
});

/**
 * Get compliance audit by ID
 * GET /api/audits/compliance/:id
 */
router.get('/compliance/:id', async (req, res) => {
  try {
    if (!adminDb) {
      return res.status(500).json({
        success: false,
        error: 'Firebase admin not available'
      });
    }

    const auditId = req.params.id;
    const doc = await adminDb.collection('complianceAudits').doc(auditId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Audit not found'
      });
    }

    const data = doc.data();
    
    // Convert Firestore timestamps to ISO strings
    const convertFirestoreDate = (dateField: any) => {
      if (!dateField) return undefined;
      if (typeof dateField === 'string') return dateField;
      if (dateField._seconds) {
        return new Date(dateField._seconds * 1000).toISOString();
      }
      return dateField.toISOString ? dateField.toISOString() : String(dateField);
    };

    const audit = {
      id: doc.id,
      auditDate: data?.auditDate,
      company: data?.company,
      auditorName: data?.auditorName,
      location: data?.location,
      auditScope: data?.auditScope,
      checklist: data?.checklist || [],
      status: data?.status,
      createdAt: convertFirestoreDate(data?.createdAt),
      updatedAt: convertFirestoreDate(data?.updatedAt),
      submittedAt: convertFirestoreDate(data?.submittedAt),
      createdBy: data?.createdBy
    };

    console.log('🧹 CLEAN: Retrieved audit with checklist items:', audit.checklist.length);
    console.log('🧹 CLEAN: Evidence items count:', audit.checklist.filter((item: any) => item.evidence?.length > 0).length);

    res.json({
      success: true,
      audit
    });
  } catch (error) {
    console.error('Error fetching compliance audit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch audit'
    });
  }
});

/**
 * Get all compliance audits
 * GET /api/audits/compliance
 */
router.get('/compliance', async (req, res) => {
  try {
    if (!adminDb) {
      return res.status(500).json({
        success: false,
        error: 'Firebase admin not available'
      });
    }

    const snapshot = await adminDb.collection('complianceAudits')
      .orderBy('updatedAt', 'desc')
      .get();
    
    const audits = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      
      const convertFirestoreDate = (dateField: any) => {
        if (!dateField) return undefined;
        if (typeof dateField === 'string') return dateField;
        if (dateField._seconds) {
          return new Date(dateField._seconds * 1000).toISOString();
        }
        return dateField.toISOString ? dateField.toISOString() : String(dateField);
      };

      return {
        id: doc.id,
        auditDate: data.auditDate,
        company: data.company,
        auditorName: data.auditorName,
        location: data.location,
        auditScope: data.auditScope,
        status: data.status,
        createdAt: convertFirestoreDate(data.createdAt),
        updatedAt: convertFirestoreDate(data.updatedAt),
        submittedAt: convertFirestoreDate(data.submittedAt),
        checklistItemsCount: data.checklist?.length || 0
      };
    });

    console.log('🧹 CLEAN: Retrieved', audits.length, 'audits');

    res.json({
      success: true,
      audits
    });
  } catch (error) {
    console.error('Error fetching compliance audits:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch audits'
    });
  }
});

export default router;