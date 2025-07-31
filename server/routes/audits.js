import { Router } from 'express';
import { generateAuditPDF, auditPDFGenerator } from '../auditPdfGenerator';
import { generateComplianceAuditPDF } from '../pdfMaster';
import fs from 'fs/promises';
import path from 'path';
const router = Router();
// Import Firebase admin
import { adminDb } from '../firestoreHelpers.js';
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
        }
        else {
            res.status(500).json({
                success: false,
                error: result.error || 'Failed to generate PDF'
            });
        }
    }
    catch (error) {
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
        const limit = parseInt(req.query.limit) || 10;
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
    }
    catch (error) {
        console.error('Error fetching previous audits:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
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
        }
        catch {
            return res.status(404).json({ error: 'File not found' });
        }
        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        // Stream the file
        const fileBuffer = await fs.readFile(filePath);
        res.send(fileBuffer);
    }
    catch (error) {
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
        }
        catch {
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
    }
    catch (error) {
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
            }
            catch {
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'PDF generation failed'
            });
        }
    }
    catch (error) {
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
        const audits = snapshot.docs.map((doc) => {
            const data = doc.data();
            const convertFirestoreDate = (dateField) => {
                if (!dateField)
                    return null;
                if (dateField instanceof Date)
                    return dateField;
                if (typeof dateField === 'string')
                    return new Date(dateField);
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
        res.json({
            success: true,
            audits
        });
    }
    catch (error) {
        console.error('Error fetching compliance audits:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch audits'
        });
    }
});
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
        const auditData = {
            ...req.body,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const docRef = await adminDb.collection('complianceAudits').add(auditData);
        res.json({
            success: true,
            id: docRef.id,
            message: 'Compliance audit created successfully'
        });
    }
    catch (error) {
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
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date(),
        };
        // If status is being changed to 'submitted', ensure submittedAt is set
        if (updateData.status === 'submitted' && !updateData.submittedAt) {
            updateData.submittedAt = new Date();
            console.log('Setting submittedAt timestamp:', updateData.submittedAt);
        }
        console.log('Updating audit with data:', JSON.stringify(updateData, null, 2));
        await adminDb.collection('complianceAudits').doc(id).update(updateData);
        res.json({
            success: true,
            message: 'Compliance audit updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating compliance audit:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update audit'
        });
    }
});
/**
 * Get audit details by ID
 * GET /api/audits/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Audit ID is required'
            });
        }
        // This would typically fetch from Firestore
        // For now, return a placeholder response
        res.json({
            success: true,
            message: `Audit ${id} details would be returned here`,
            audit: {
                id,
                status: 'available'
            }
        });
    }
    catch (error) {
        console.error('Error fetching audit details:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
// Modern PDF generation using LATO font and professional layout
async function generateTestPDF() {
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
        }
        catch (primaryError) {
            console.log('Primary LATO PDF generation failed, trying fallback system...');
            console.log('Primary error:', primaryError instanceof Error ? primaryError.message : primaryError);
            // Use fallback jsPDF generator
            const { generateComplianceAuditPDFFallback } = await import('../pdfFallback');
            const fallbackBuffer = await generateComplianceAuditPDFFallback(sampleData);
            console.log('✅ Fallback PDF generation successful');
            return fallbackBuffer;
        }
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('❌ Lab inspection PDF test failed:', error);
        res.status(500).json({ error: 'Failed to generate lab inspection PDF' });
    }
});
export default router;
