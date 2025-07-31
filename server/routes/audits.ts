import { Router } from 'express';
import { generateAuditPDF, auditPDFGenerator } from '../auditPdfGenerator';
import { generateComplianceAuditPDF } from '../pdfMaster';

import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Import Firebase admin
import { adminDb } from '../firestoreHelpers.js';

// Helper function to convert Firestore timestamp to ISO string
function convertFirestoreDate(timestamp: any): string | undefined {
  if (!timestamp) return undefined;
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp.toDate) return timestamp.toDate().toISOString();
  if (timestamp._seconds) return new Date(timestamp._seconds * 1000).toISOString();
  return undefined;
}

/**
 * Generate PDF for compliance audit
 * GET /api/audits/compliance/:id/pdf
 */
router.get('/compliance/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Audit ID is required'
      });
    }

    console.log(`📄 Generating PDF for compliance audit ID: ${id}`);

    // Fetch audit data from Firebase
    const auditDoc = await adminDb.collection('complianceAudits').doc(id).get();
    
    if (!auditDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Audit not found'
      });
    }

    const auditData = auditDoc.data();
    
    if (!auditData) {
      return res.status(404).json({
        success: false,
        error: 'Audit data not found'
      });
    }
    
    // Use fallback PDF generator for reliable generation
    const { generateComplianceAuditPDFFallback } = await import('../pdfFallback');
    const pdfBuffer = await generateComplianceAuditPDFFallback(auditData);
    
    // Create filename with audit details
    const fileName = `compliance-audit-${auditData.company}-${id}-${Date.now()}.pdf`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Ensure uploads directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }
    
    // Save PDF to file
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, pdfBuffer);
    
    console.log(`✅ PDF generated successfully: ${fileName} (${Math.round(pdfBuffer.length / 1024)}KB)`);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    
    // Send the PDF buffer directly
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error generating compliance audit PDF:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'PDF generation failed'
    });
  }
});

/**
 * Generate PDF for specific audit
 * POST /api/audits/:id/generate-pdf
 */
router.post('/:id/generate-pdf', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Audit ID is required'
      });
    }

    console.log(`Generating PDF for audit ID: ${id}`);

    const result = await generateAuditPDF(id);

    if (result.success) {
      res.json({
        success: true,
        message: 'PDF generated successfully',
        pdfUrl: result.pdfUrl,
        downloadUrl: result.downloadUrl
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate PDF'
      });
    }
  } catch (error) {
    console.error('Error in PDF generation route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get previous audit reports for a company
 * GET /api/audits/previous/:company
 */
router.get('/previous/:company', async (req, res) => {
  try {
    const { company } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!company) {
      return res.status(400).json({
        success: false,
        error: 'Company parameter is required'
      });
    }

    const previousAudits = await auditPDFGenerator.getPreviousAudits(company, limit);

    res.json({
      success: true,
      audits: previousAudits
    });
  } catch (error) {
    console.error('Error fetching previous audits:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * View audit report as HTML
 * GET /api/audits/compliance/:id/view
 */
router.get('/compliance/:id/view', async (req, res) => {
  try {
    if (!adminDb) {
      return res.status(500).json({
        success: false,
        error: 'Firebase admin not available'
      });
    }

    const { id } = req.params;
    
    const auditDoc = await adminDb.collection('complianceAudits').doc(id).get();
    
    if (!auditDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Audit not found'
      });
    }
    
    const auditData = auditDoc.data();
    
    // Generate HTML report
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compliance Audit Report - ${auditData?.company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.'}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #003366; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #003366; margin-bottom: 5px; }
        .report-title { font-size: 20px; color: #666; margin-bottom: 10px; }
        .audit-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff; }
        .info-label { font-weight: bold; color: #333; }
        .info-value { color: #666; margin-top: 5px; }
        .score-section { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .score-value { font-size: 48px; font-weight: bold; }
        .score-label { font-size: 18px; margin-top: 10px; }
        .parts-section { margin-top: 30px; }
        .part { margin-bottom: 25px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .part-header { background: #003366; color: white; padding: 15px; font-weight: bold; font-size: 16px; }
        .part-content { padding: 20px; }
        .checklist-item { margin-bottom: 15px; padding: 15px; border-left: 4px solid #e0e0e0; background: #f9f9f9; }
        .question { font-weight: bold; color: #333; margin-bottom: 8px; }
        .response { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .response.yes { background: #d4edda; color: #155724; }
        .response.no { background: #f8d7da; color: #721c24; }
        .response.na { background: #e2e3e5; color: #383d41; }
        .remark { margin-top: 8px; font-style: italic; color: #666; }
        .evidence { margin-top: 10px; }
        .evidence-image { max-width: 150px; max-height: 150px; margin: 5px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 6px; border-top: 3px solid #007bff; }
        .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-name">${auditData?.company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.'}</div>
            <div class="report-title">ISO 9001:2015 Compliance Audit Report</div>
        </div>
        
        <div class="audit-info">
            <div class="info-card">
                <div class="info-label">Auditor</div>
                <div class="info-value">${auditData?.auditorName || 'Quality Auditor'}</div>
            </div>
            <div class="info-card">
                <div class="info-label">Date</div>
                <div class="info-value">${auditData?.auditDate || new Date().toLocaleDateString()}</div>
            </div>
            <div class="info-card">
                <div class="info-label">Location</div>
                <div class="info-value">${auditData?.location || 'Main Factory'}</div>
            </div>
            <div class="info-card">
                <div class="info-label">Scope</div>
                <div class="info-value">${auditData?.auditScope || 'ISO 9001:2015 Compliance'}</div>
            </div>
        </div>
        
        ${auditData?.scoreData ? `
        <div class="score-section">
            <div class="score-value">${auditData.scoreData.score}%</div>
            <div class="score-label">Overall Compliance Score</div>
        </div>
        
        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-number">${auditData.scoreData.totalItems}</div>
                <div class="stat-label">Total Items</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${auditData.scoreData.yesCount}</div>
                <div class="stat-label">Compliant</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${auditData.scoreData.noCount}</div>
                <div class="stat-label">Non-Compliant</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${auditData.scoreData.naCount}</div>
                <div class="stat-label">Not Applicable</div>
            </div>
        </div>
        ` : ''}
        
        <div class="parts-section">
            ${(auditData?.parts || []).map((part: any, partIndex: number) => `
                <div class="part">
                    <div class="part-header">Part ${partIndex + 1}: ${part.title || 'Checklist Section'}</div>
                    <div class="part-content">
                        ${(part.items || []).map((item: any) => `
                            <div class="checklist-item">
                                <div class="question">${item.code || item.id}: ${item.question}</div>
                                <span class="response ${(item.response || '').toLowerCase()}">${item.response || 'Not Answered'}</span>
                                ${item.remark ? `<div class="remark">Remarks: ${item.remark}</div>` : ''}
                                ${item.evidenceImages && item.evidenceImages.length > 0 ? `
                                    <div class="evidence">
                                        <strong>Evidence Images:</strong><br>
                                        ${item.evidenceImages.map((img: string) => `<img src="${img}" class="evidence-image" alt="Evidence">`).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlReport);
  } catch (error) {
    console.error('❌ Error generating audit view:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate audit view'
    });
  }
});

/**
 * Download endpoint for generated PDF files
 * GET /api/audits/download/:filename
 */
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileBuffer = await fs.readFile(filePath);
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Download failed' 
    });
  }
});

/**
 * Test fallback PDF generation directly
 * GET /api/audits/test-fallback-pdf
 */
router.get('/test-fallback-pdf', async (req, res) => {
  try {
    // Create sample audit data for testing
    const sampleAuditData = {
      id: 'test-audit-' + Date.now(),
      auditorName: 'Quality Auditor',
      auditDate: new Date().toISOString().split('T')[0],
      company: 'EHI',
      location: 'Main Factory - Karachi',
      auditScope: 'Complete ISO 9001:2015 compliance verification',
      
      scoreData: {
        totalItems: 4,
        yesCount: 3,
        noCount: 1,
        naCount: 0,
        applicableItems: 4,
        score: 75
      }
    };

    // Use fallback jsPDF generator directly
    const { generateComplianceAuditPDFFallback } = await import('../pdfFallback');
    const pdfBuffer = await generateComplianceAuditPDFFallback(sampleAuditData);
    
    // Create filename with timestamp
    const fileName = `audit-fallback-test-${Date.now()}.pdf`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Ensure uploads directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }
    
    // Save PDF to file
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, pdfBuffer);
    
    // Return download URL
    const downloadUrl = `/uploads/${fileName}`;
    
    res.json({
      success: true,
      message: 'Fallback PDF generated successfully using jsPDF',
      pdfSize: `${Math.round(pdfBuffer.length / 1024)}KB`,
      downloadUrl,
      fileName,
      features: [
        'jsPDF-based fallback system (no Puppeteer dependencies)',
        'Professional layout structure',
        'Eastern Mills logo placeholder',
        'Clean structured headers with document references',
        'Proper form layouts for audit data',
        'Professional footer with signature fields',
        'Reliable generation without system browser dependencies'
      ]
    });
  } catch (error) {
    console.error('Error testing fallback PDF generation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Fallback PDF generation failed'
    });
  }
});

/**
 * Test PDF generation with LATO font
 * GET /api/audits/test-pdf
 */
router.get('/test-pdf', async (req, res) => {
  try {
    // Create sample audit data for testing
    const sampleAuditData = {
      id: 'test-audit-' + Date.now(),
      auditorInfo: {
        auditorName: 'Test Auditor',
        auditDate: new Date().toISOString().split('T')[0],
        company: 'EHI',
        location: 'Main Factory',
        auditScope: 'Complete compliance audit'
      },
      checklist: [
        {
          id: 'part1',
          title: 'Design Control (C1-C7)',
          items: [
            {
              id: 'C1',
              question: 'Are design and development procedures established?',
              response: 'Yes',
              remark: 'Comprehensive design control procedures in place',
              evidenceUrl: ''
            },
            {
              id: 'C2',
              question: 'Are design inputs properly documented?',
              response: 'Yes',
              remark: 'All design inputs documented and reviewed',
              evidenceUrl: ''
            }
          ]
        }
      ],
      scoreData: {
        totalItems: 2,
        yesCount: 2,
        noCount: 0,
        naCount: 0,
        applicableItems: 2,
        score: 100
      }
    };

    // Generate PDF and save to uploads directory
    try {
      const pdfBuffer = await generateTestPDF();
      
      // Create filename with timestamp
      const fileName = `audit-test-${Date.now()}.pdf`;
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      // Ensure uploads directory exists
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }
      
      // Save PDF to file
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, pdfBuffer);
      
      // Return download URL
      const downloadUrl = `/uploads/${fileName}`;
      
      res.json({
        success: true,
        message: 'Test PDF generated and saved successfully with LATO font',
        pdfSize: `${Math.round(pdfBuffer.length / 1024)}KB`,
        downloadUrl,
        fileName,
        features: [
          'LATO font throughout the document',
          'Professional layout structure',
          'Eastern Mills logo at top-left corner',
          'Clean structured headers with document references',
          'Proper table layouts for test results',
          'Professional footer with signature fields',
          'Reusable structure for all audit types'
        ]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'PDF generation failed'
      });
    }
  } catch (error) {
    console.error('Error testing PDF generation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get compliance audits
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
        if (!dateField) return null;
        if (dateField instanceof Date) return dateField;
        if (typeof dateField === 'string') return new Date(dateField);
        if (dateField && typeof dateField.toDate === 'function') {
          return dateField.toDate();
        }
        if (dateField && dateField._seconds) {
          return new Date(dateField._seconds * 1000);
        }
        return new Date();
      };

      return {
        id: doc.id,
        ...data,
        createdAt: convertFirestoreDate(data.createdAt),
        updatedAt: convertFirestoreDate(data.updatedAt),
        submittedAt: convertFirestoreDate(data.submittedAt),
      };
    });

    // Debug logging for status tracking
    const statusCounts = audits.reduce((counts: any, audit: any) => {
      counts[audit.status] = (counts[audit.status] || 0) + 1;
      return counts;
    }, {});
    
    console.log('📊 Server Status Counts:', statusCounts);
    console.log('📋 Recent Audits:', audits.slice(0, 3).map(a => ({ id: a.id, status: a.status, company: a.company })));

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

/**
 * CLEAN REBUILD: Create compliance audit with single checklist[] structure
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

    // 🧹 CLEAN REBUILD: Single checklist[] structure only
    const auditData = {
      auditDate: String(req.body.auditDate || new Date().toISOString().split('T')[0]),
      company: String(req.body.company || 'EHI'),
      auditorName: String(req.body.auditorName || ''),
      location: String(req.body.location || ''),
      auditScope: String(req.body.auditScope || ''),
      checklist: (req.body.checklist || []).map((item: any) => ({
        code: String(item.code || ''),
        question: String(item.question || ''),
        response: item.response === undefined ? '' : item.response,
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
    console.log('🧹 CLEAN: Evidence items count:', auditData.checklist.filter(item => item.evidence.length > 0).length);
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
 * CLEAN REBUILD: Update compliance audit with single checklist[] structure
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
    console.log('🔄 SERVER: Updating compliance audit:', auditId);
    
    // DEBUG: Log the structure being saved to Firestore
    if (req.body.parts) {
      console.log('📊 SERVER: Audit parts structure being saved:');
      req.body.parts.forEach((part: any, index: number) => {
        const itemsWithData = part.items?.filter((item: any) => 
          item.response || item.remark || (item.evidenceImages && item.evidenceImages.length > 0)
        ) || [];
        
        if (itemsWithData.length > 0) {
          console.log(`  Part ${index + 1} (${part.id}) - ${itemsWithData.length} items with data:`);
          itemsWithData.forEach((item: any) => {
            console.log(`    ${item.id}: response="${item.response}", remark="${item.remark?.substring(0, 30)}...", evidence=${item.evidenceImages?.length || 0} images`);
            if (item.evidenceImages && item.evidenceImages.length > 0) {
              item.evidenceImages.forEach((url: string, idx: number) => {
                console.log(`      Evidence ${idx + 1}: ${url.substring(0, 80)}...`);
              });
            }
          });
        }
      });
    }

    const { id } = req.params;
    
    // 🧹 CLEAN REBUILD: Single checklist[] structure only
    const updateData = {
      auditDate: String(req.body.auditDate || new Date().toISOString().split('T')[0]),
      company: String(req.body.company || 'EHI'),
      auditorName: String(req.body.auditorName || ''),
      location: String(req.body.location || ''),
      auditScope: String(req.body.auditScope || ''),
      checklist: (req.body.checklist || []).map((item: any) => ({
        code: String(item.code || ''),
        question: String(item.question || ''),
        response: item.response === undefined ? '' : item.response,
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

    // 🧹 CLEAN: Removed legacy parts[] image counting
    
    console.log('🔄 Updating audit with data size:', (JSON.stringify(updateData).length / 1024).toFixed(2), 'KB');
    
    // Verify document exists before updating
    const docRef = adminDb.collection('complianceAudits').doc(id);
    const docSnapshot = await docRef.get();
    
    if (!docSnapshot.exists) {
      console.error('❌ Document not found:', id);
      return res.status(404).json({
        success: false,
        error: 'Audit not found'
      });
    }
    
    const beforeUpdate = docSnapshot.data();
    console.log('📋 Before update - Status:', beforeUpdate?.status, 'SubmittedAt:', beforeUpdate?.submittedAt);
    
    await docRef.update(updateData);
    
    // Verify the update worked
    const afterSnapshot = await docRef.get();
    const afterUpdate = afterSnapshot.data();
    console.log('✅ After update - Status:', afterUpdate?.status, 'SubmittedAt:', afterUpdate?.submittedAt);
    
    // If this was a submit operation, log success
    if (updateData.status === 'submitted') {
      console.log('🎯 AUDIT SUBMITTED SUCCESSFULLY - ID:', id, 'New Status:', afterUpdate?.status);
    }
    
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
 * Get compliance audit details by ID
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

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Audit ID is required'
      });
    }

    console.log('📋 Fetching compliance audit:', id);
    const doc = await adminDb.collection('complianceAudits').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Audit not found'
      });
    }

    const data = doc.data();
    const audit = {
      id: doc.id,
      auditDate: data?.auditDate || '',
      auditorName: data?.auditorName || '',
      company: data?.company || 'EHI',
      location: data?.location || '',
      auditScope: data?.auditScope || '',
      checklist: data?.checklist || [], // 🧹 CLEAN: Only checklist[] field used
      status: data?.status || 'draft',
      scoreData: data?.scoreData || null,
      createdAt: convertFirestoreDate(data?.createdAt),
      updatedAt: convertFirestoreDate(data?.updatedAt),
      submittedAt: convertFirestoreDate(data?.submittedAt),
    };

    console.log('🧹 CLEAN: Retrieved audit with checklist items:', audit.checklist?.length || 0);
    if (audit.checklist && audit.checklist.length > 0) {
      console.log('📋 Sample checklist item:', {
        code: audit.checklist[0].code,
        question: audit.checklist[0].question?.substring(0, 30) + '...',
        response: audit.checklist[0].response,
        evidenceCount: audit.checklist[0].evidence?.length || 0
      });
    }
    
    // 🧹 CLEAN: Debug evidence count in checklist[]
    const evidenceCount = audit.checklist?.filter((item: any) => item.evidence?.length > 0).length || 0;
    console.log(`🧹 CLEAN: Evidence items in checklist: ${evidenceCount}`);

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

// Modern PDF generation using LATO font and professional layout
async function generateTestPDF(): Promise<Buffer> {
  const sampleData = {
    id: 'test-audit-' + Date.now(),
    auditorName: 'Quality Auditor',
    auditDate: new Date().toISOString().split('T')[0],
    company: 'EHI',
    location: 'Main Factory - Karachi',
    auditScope: 'Complete ISO 9001:2015 compliance verification',
    
    scoreData: {
      totalItems: 4,
      yesCount: 3,
      noCount: 1,
      naCount: 0,
      applicableItems: 4,
      score: 75
    }
  };

  try {
    // Try LATO-based PDF generator first, fallback if it fails
    try {
      const pdfBuffer = await generateComplianceAuditPDF(sampleData);
      return pdfBuffer;
    } catch (primaryError) {
      console.log('Primary LATO PDF generation failed, trying fallback system...');
      console.log('Primary error:', primaryError instanceof Error ? primaryError.message : primaryError);
      
      // Use fallback jsPDF generator
      const { generateComplianceAuditPDFFallback } = await import('../pdfFallback');
      const fallbackBuffer = await generateComplianceAuditPDFFallback(sampleData);
      console.log('✅ Fallback PDF generation successful');
      return fallbackBuffer;
    }
  } catch (error) {
    console.error('Both PDF generation systems failed:', error);
    throw new Error('Failed to generate PDF with both LATO and fallback systems');
  }
}

// Test endpoint for improved lab inspection PDF layout
router.post('/test/lab-inspection-improved', async (req, res) => {
  try {
    console.log('🧪 Testing improved lab inspection PDF generation...');
    
    const testLabData = {
      company: 'EHI',
      labReportNumber: 'EHI-LAB-1001',
      materialType: 'Dyed', 
      incomingDate: '2025-07-26',
      challanNumber: '12312',
      supplierName: 'Test Supplier Ltd',
      purchaseOrder: 'PO-2025-001',
      quantity: '500 KG',
      transportCondition: 'OK',
      testingParameters: [
        { parameter: 'Color Fastness to rubbing (Dry)', standard: 'Wool - ≥ 4, Cotton - ≥ 3-4', result: 'OK' },
        { parameter: 'Color Fastness to rubbing (Wet)', standard: 'Wool - ≥ 3-4, Cotton - ≥ 3', result: 'OK' },
        { parameter: 'Moisture content', standard: 'Max - 12%', result: 'FAIL' },
        { parameter: 'Shade matching', standard: 'As per approved sample', result: 'FAIL' },
        { parameter: 'Hank variations', standard: 'As per approved sample', result: 'OK' },
        { parameter: 'Cleanliness of hanks', standard: 'Proper neat & Clean', result: 'OK' },
        { parameter: 'Smell', standard: 'Natural fiber smell only', result: 'FAIL' },
        { parameter: 'Strength', standard: 'Ok', result: 'FAIL' },
        { parameter: 'Stain/Dust', standard: 'NO', result: 'OK' }
      ],
      overallStatus: 'PENDING',
      remarks: 'Material requires re-testing for moisture content and shade matching. Several parameters failed initial inspection.',
      inspectorName: 'Lab Technician',
      inspectionDate: '2025-07-26'
    };
    
    const { generateLabInspectionPDFFallback } = await import('../pdfFallback');
    const pdfBuffer = await generateLabInspectionPDFFallback(testLabData);
    const filename = `lab-inspection-improved-${Date.now()}.pdf`;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    await fs.writeFile(filePath, pdfBuffer);
    console.log(`✅ Improved lab inspection PDF saved: ${filename}`);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Lab inspection PDF test failed:', error);
    res.status(500).json({ error: 'Failed to generate lab inspection PDF' });
  }
});

export default router;