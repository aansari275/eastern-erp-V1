import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'evidence');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `evidence-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// Upload evidence file
router.post('/upload-evidence', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/evidence/${req.file.filename}`;
    res.json({ 
      url: fileUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Generate PDF report
router.post('/generate-report', async (req, res) => {
  try {
    const { auditorInfo, checklist, scoreData, generatedDate } = req.body;
    
    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Quality_Compliance_Audit_${auditorInfo.company}_${auditorInfo.auditDate}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Helper function to get company full name
    const getCompanyFullName = (code: string) => {
      return code === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.';
    };
    
    // Header
    doc.fontSize(20).font('Helvetica-Bold')
       .text(getCompanyFullName(auditorInfo.company), 50, 50, { align: 'center' });
    
    doc.fontSize(16).font('Helvetica-Bold')
       .text('Internal Technical Audit Report', 50, 80, { align: 'center' });
    
    doc.fontSize(14).font('Helvetica')
       .text('As per clause ISO9001:2015', 50, 105, { align: 'center' });
    
    // Audit Information Box
    doc.rect(400, 50, 150, 100).stroke();
    doc.fontSize(10).font('Helvetica-Bold')
       .text('Audit Information', 410, 60);
    
    doc.fontSize(9).font('Helvetica')
       .text(`Date: ${auditorInfo.auditDate}`, 410, 75)
       .text(`Auditor: ${auditorInfo.auditorName}`, 410, 90)
       .text(`Location: ${auditorInfo.location}`, 410, 105)
       .text(`Generated: ${new Date(generatedDate).toLocaleDateString()}`, 410, 120);
    
    // Move down for content
    let yPosition = 160;
    
    // Audit Scope
    if (auditorInfo.auditScope) {
      doc.fontSize(12).font('Helvetica-Bold')
         .text('Audit Scope:', 50, yPosition);
      yPosition += 20;
      
      doc.fontSize(10).font('Helvetica')
         .text(auditorInfo.auditScope, 50, yPosition, { width: 500 });
      yPosition += 40;
    }
    
    // Score Summary
    doc.fontSize(14).font('Helvetica-Bold')
       .text('Audit Score Summary', 50, yPosition);
    yPosition += 25;
    
    // Score box
    doc.rect(50, yPosition, 500, 60).fillAndStroke('#f0f0f0', '#c8c8c8');
    
    const scoreColorText = scoreData.score >= 90 ? 'green' : scoreData.score >= 70 ? 'orange' : 'red';
    doc.fontSize(24).font('Helvetica-Bold').fillColor(scoreColorText)
       .text(`${scoreData.score}%`, 70, yPosition + 15);
    
    doc.fontSize(12).font('Helvetica').fillColor('black')
       .text(`Yes: ${scoreData.yesCount}`, 150, yPosition + 10)
       .text(`No: ${scoreData.noCount}`, 150, yPosition + 25)
       .text(`N/A: ${scoreData.naCount}`, 150, yPosition + 40)
       .text(`Applicable Items: ${scoreData.applicableItems}`, 250, yPosition + 10)
       .text(`Total Items: ${scoreData.totalItems}`, 250, yPosition + 25)
       .text(`Compliance Rate: ${scoreData.score}%`, 250, yPosition + 40);
    
    yPosition += 80;
    
    // Detailed Results
    doc.fontSize(14).font('Helvetica-Bold')
       .text('Detailed Audit Results', 50, yPosition);
    yPosition += 25;
    
    checklist.forEach((part: any, partIndex: number) => {
      // Check if we need a new page
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.fontSize(12).font('Helvetica-Bold')
         .text(`${partIndex + 1}. ${part.title}`, 50, yPosition);
      yPosition += 20;
      
      part.items.forEach((item: any) => {
        // Check if we need a new page
        if (yPosition > 720) {
          doc.addPage();
          yPosition = 50;
        }
        
        const responseColor = item.response === 'Yes' ? 'green' : 
                             item.response === 'No' ? 'red' : 'gray';
        
        doc.fontSize(10).font('Helvetica')
           .text(`${item.id}: ${item.question}`, 70, yPosition, { width: 400 });
        yPosition += 15;
        
        doc.fontSize(9).font('Helvetica-Bold').fillColor(responseColor)
           .text(`Response: ${item.response || 'Not Answered'}`, 90, yPosition);
        yPosition += 12;
        
        if (item.remark) {
          doc.fontSize(9).font('Helvetica').fillColor('black')
             .text(`Remark: ${item.remark}`, 90, yPosition, { width: 400 });
          yPosition += 12;
        }
        
        if (item.evidence) {
          doc.fontSize(9).font('Helvetica').fillColor('blue')
             .text('✓ Evidence attached', 90, yPosition);
          yPosition += 12;
        }
        
        yPosition += 5; // Small gap between items
      });
      
      yPosition += 15; // Gap between parts
    });
    
    // Footer
    doc.fontSize(8).font('Helvetica')
       .text(`Report generated on ${new Date(generatedDate).toLocaleString()}`, 50, 750)
       .text(`${getCompanyFullName(auditorInfo.company)} - Quality Management System`, 50, 765);
    
    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

export default router;