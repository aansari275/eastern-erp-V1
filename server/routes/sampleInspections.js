import express from 'express';
import { adminDb as db } from '../firebase';
import { insertSampleDispatchInspectionSchema } from '@shared/schema';
const router = express.Router();
// GET /api/sample-inspections - Get all sample inspection reports
router.get('/', async (req, res) => {
    try {
        console.log('Fetching sample inspection reports...');
        const inspectionsRef = db.collection('sampleInspections');
        const snapshot = await inspectionsRef.orderBy('timestamp', 'desc').get();
        const inspections = [];
        snapshot.forEach((doc) => {
            inspections.push({ id: doc.id, ...doc.data() });
        });
        console.log(`✅ Found ${inspections.length} sample inspection reports`);
        res.json(inspections);
    }
    catch (error) {
        console.error('Error fetching sample inspections:', error);
        res.status(500).json({
            error: 'Failed to fetch sample inspections',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/sample-inspections/:id - Get specific inspection report
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching sample inspection report: ${id}`);
        const docRef = db.collection('sampleInspections').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Inspection report not found' });
        }
        const inspection = { id: doc.id, ...doc.data() };
        console.log(`✅ Found sample inspection report: ${inspection.buyer} - ${inspection.articleDesign}`);
        res.json(inspection);
    }
    catch (error) {
        console.error('Error fetching sample inspection:', error);
        res.status(500).json({
            error: 'Failed to fetch sample inspection',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// POST /api/sample-inspections - Create new inspection report
router.post('/', async (req, res) => {
    try {
        console.log('Creating new sample inspection report...');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        // Validate request body
        const validationResult = insertSampleDispatchInspectionSchema.safeParse(req.body);
        if (!validationResult.success) {
            console.log('Validation errors:', validationResult.error.errors);
            return res.status(400).json({
                error: 'Invalid inspection data',
                details: validationResult.error.errors
            });
        }
        const inspectionData = validationResult.data;
        // Add timestamps
        const now = new Date();
        const inspectionWithTimestamps = {
            ...inspectionData,
            created_at: now,
            updated_at: now,
            timestamp: inspectionData.timestamp || now.toISOString(),
        };
        // Save to Firestore
        const docRef = await db.collection('sampleInspections').add(inspectionWithTimestamps);
        // Get the created document
        const createdDoc = await docRef.get();
        const createdInspection = { id: createdDoc.id, ...createdDoc.data() };
        console.log(`✅ Sample inspection report created: ${createdInspection.id} for ${createdInspection.buyer}`);
        res.status(201).json(createdInspection);
    }
    catch (error) {
        console.error('Error creating sample inspection:', error);
        res.status(500).json({
            error: 'Failed to create sample inspection',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// PUT /api/sample-inspections/:id - Update inspection report
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Updating sample inspection report: ${id}`);
        // Validate request body
        const validationResult = insertSampleDispatchInspectionSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Invalid inspection data',
                details: validationResult.error.errors
            });
        }
        const inspectionData = validationResult.data;
        // Update timestamps
        const updateData = {
            ...inspectionData,
            updated_at: new Date(),
        };
        // Update in Firestore
        const docRef = db.collection('sampleInspections').doc(id);
        await docRef.update(updateData);
        // Get the updated document
        const updatedDoc = await docRef.get();
        if (!updatedDoc.exists) {
            return res.status(404).json({ error: 'Inspection report not found' });
        }
        const updatedInspection = { id: updatedDoc.id, ...updatedDoc.data() };
        console.log(`✅ Sample inspection report updated: ${updatedInspection.buyer} - ${updatedInspection.articleDesign}`);
        res.json(updatedInspection);
    }
    catch (error) {
        console.error('Error updating sample inspection:', error);
        res.status(500).json({
            error: 'Failed to update sample inspection',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// DELETE /api/sample-inspections/:id - Delete inspection report
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Deleting sample inspection report: ${id}`);
        const docRef = db.collection('sampleInspections').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Inspection report not found' });
        }
        await docRef.delete();
        console.log(`✅ Sample inspection report deleted: ${id}`);
        res.json({ message: 'Inspection report deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting sample inspection:', error);
        res.status(500).json({
            error: 'Failed to delete sample inspection',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/sample-inspections/:id/pdf - Generate PDF report
router.get('/:id/pdf', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Generating PDF for sample inspection: ${id}`);
        // Get inspection data
        const docRef = db.collection('sampleInspections').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Inspection report not found' });
        }
        const inspection = { id: doc.id, ...doc.data() };
        // Import pdf-lib for PDF generation
        const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const { width, height } = page.getSize();
        // Load fonts
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        // Header
        let yPosition = height - 50;
        // Company header
        page.drawText('EASTERN MILLS', {
            x: 50,
            y: yPosition,
            size: 20,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0),
        });
        page.drawText('Sample Dispatch Inspection Report', {
            x: 50,
            y: yPosition - 25,
            size: 16,
            font: helveticaBoldFont,
            color: rgb(0.2, 0.2, 0.2),
        });
        yPosition -= 60;
        // Inspection details
        const details = [
            ['Buyer:', inspection.buyer],
            ['Article/Design:', inspection.articleDesign],
            ['Inspection Date:', new Date(inspection.inspectionDate).toLocaleDateString()],
            ['Size:', inspection.size],
            ['Quality:', inspection.quality],
            ['Construction:', inspection.construction],
            ['Color:', inspection.color],
            ['Overall Grade:', inspection.overallGrade],
            ['Approved for Dispatch:', inspection.approvedForDispatch ? 'Yes' : 'No'],
        ];
        // Add optional fields if they exist
        if (inspection.weight)
            details.push(['Weight (kg):', inspection.weight]);
        if (inspection.gsm)
            details.push(['GSM:', inspection.gsm]);
        if (inspection.pile)
            details.push(['Pile Height (mm):', inspection.pile]);
        if (inspection.gauge)
            details.push(['Gauge:', inspection.gauge]);
        for (const [label, value] of details) {
            page.drawText(label, {
                x: 50,
                y: yPosition,
                size: 11,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
            });
            page.drawText(value, {
                x: 200,
                y: yPosition,
                size: 11,
                font: helveticaFont,
                color: rgb(0, 0, 0),
            });
            yPosition -= 20;
        }
        // Defects section
        if (inspection.defects && inspection.defects.length > 0) {
            yPosition -= 20;
            page.drawText('DEFECTS IDENTIFIED:', {
                x: 50,
                y: yPosition,
                size: 14,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
            });
            yPosition -= 25;
            inspection.defects.forEach((defect, index) => {
                const severityColor = defect.severity === 'Critical' ? rgb(0.8, 0.2, 0.2) :
                    defect.severity === 'Major' ? rgb(0.8, 0.5, 0.2) :
                        rgb(0.8, 0.8, 0.2);
                page.drawText(`${index + 1}. ${defect.type} (${defect.severity})`, {
                    x: 60,
                    y: yPosition,
                    size: 10,
                    font: helveticaBoldFont,
                    color: severityColor,
                });
                yPosition -= 15;
                if (defect.location) {
                    page.drawText(`   Location: ${defect.location}`, {
                        x: 60,
                        y: yPosition,
                        size: 9,
                        font: helveticaFont,
                        color: rgb(0.3, 0.3, 0.3),
                    });
                    yPosition -= 12;
                }
                // Wrap description text
                const maxWidth = 450;
                const words = defect.description.split(' ');
                let line = '';
                for (const word of words) {
                    const testLine = line + (line ? ' ' : '') + word;
                    const textWidth = helveticaFont.widthOfTextAtSize(testLine, 9);
                    if (textWidth > maxWidth && line) {
                        page.drawText(`   ${line}`, {
                            x: 60,
                            y: yPosition,
                            size: 9,
                            font: helveticaFont,
                            color: rgb(0, 0, 0),
                        });
                        yPosition -= 12;
                        line = word;
                    }
                    else {
                        line = testLine;
                    }
                }
                if (line) {
                    page.drawText(`   ${line}`, {
                        x: 60,
                        y: yPosition,
                        size: 9,
                        font: helveticaFont,
                        color: rgb(0, 0, 0),
                    });
                    yPosition -= 12;
                }
                yPosition -= 10;
            });
        }
        // Comments section
        if (inspection.comments) {
            yPosition -= 20;
            page.drawText('ADDITIONAL COMMENTS:', {
                x: 50,
                y: yPosition,
                size: 14,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
            });
            yPosition -= 20;
            // Wrap comments text
            const maxWidth = 450;
            const words = inspection.comments.split(' ');
            let line = '';
            for (const word of words) {
                const testLine = line + (line ? ' ' : '') + word;
                const textWidth = helveticaFont.widthOfTextAtSize(testLine, 10);
                if (textWidth > maxWidth && line) {
                    page.drawText(line, {
                        x: 50,
                        y: yPosition,
                        size: 10,
                        font: helveticaFont,
                        color: rgb(0, 0, 0),
                    });
                    yPosition -= 15;
                    line = word;
                }
                else {
                    line = testLine;
                }
            }
            if (line) {
                page.drawText(line, {
                    x: 50,
                    y: yPosition,
                    size: 10,
                    font: helveticaFont,
                    color: rgb(0, 0, 0),
                });
                yPosition -= 15;
            }
        }
        // Footer
        yPosition = 100;
        page.drawText('Inspector Information:', {
            x: 50,
            y: yPosition,
            size: 12,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;
        page.drawText(`Name: ${inspection.inspectorName}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 15;
        page.drawText(`Email: ${inspection.inspectorEmail}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 15;
        page.drawText(`Report Generated: ${new Date().toLocaleString()}`, {
            x: 50,
            y: yPosition,
            size: 9,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
        });
        // Generate PDF
        const pdfBytes = await pdfDoc.save();
        console.log(`✅ PDF generated for sample inspection: ${inspection.buyer} - ${inspection.articleDesign}`);
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${inspection.buyer}_${inspection.articleDesign}_Inspection_Report.pdf"`);
        res.setHeader('Content-Length', pdfBytes.length);
        // Send PDF
        res.send(Buffer.from(pdfBytes));
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            error: 'Failed to generate PDF',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export default router;
