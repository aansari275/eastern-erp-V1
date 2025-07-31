import { jsPDF } from 'jspdf';

/**
 * Fallback PDF generator using jsPDF when Puppeteer/Chromium is not available
 * Creates professional PDFs with LATO-like fonts for all inspection and audit reports
 * CLEAN REBUILD: Uses only checklist[] structure for compliance audits
 */

export interface PDFFallbackConfig {
  title: string;
  company: string;
  reportNumber: string;
  documentNumber?: string;
  revisionNumber?: string;
  department?: string;
}

export interface PDFFallbackContent {
  sections: Array<{
    title: string;
    type: 'form' | 'table' | 'text';
    content: any;
  }>;
}

// Clean Compliance Audit interfaces
export interface ChecklistItem {
  code: string;
  question: string;
  response?: 'Yes' | 'No' | 'NA';
  remark?: string;
  evidence?: string[];
}

export interface ComplianceAuditData {
  id?: string;
  auditDate: string;
  company: 'EHI' | 'EMPL';
  auditorName: string;
  location: string;
  auditScope: string;
  checklist: ChecklistItem[];
  status: 'draft' | 'submitted';
}

/**
 * 🧹 CLEAN REBUILD: Generate compliance audit PDF using only checklist[] structure
 */
export async function generateComplianceAuditPDFClean(auditData: ComplianceAuditData): Promise<Buffer> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm', 
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 20;
  const margin = 20;

  // Add Eastern Mills logo
  try {
    const logoPath = './attached_assets/NEW EASTERN LOGO (transparent background))v copy (3)_1753322709558.png';
    pdf.addImage(logoPath, 'PNG', margin, currentY - 5, 30, 12);
  } catch (error) {
    // Fallback to text if logo fails
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('EASTERN MILLS', margin, currentY);
  }

  // Company header
  pdf.setFontSize(18);
  pdf.setTextColor(0, 51, 102);
  pdf.setFont('helvetica', 'bold');
  const companyName = auditData.company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.';
  const companyWidth = pdf.getTextWidth(companyName);
  pdf.text(companyName, (pageWidth - companyWidth) / 2, currentY + 10);

  // Title
  pdf.setFontSize(16);
  const title = 'ISO 9001:2015 COMPLIANCE AUDIT REPORT';
  const titleWidth = pdf.getTextWidth(title);
  pdf.text(title, (pageWidth - titleWidth) / 2, currentY + 25);
  currentY += 45;

  // Audit Information Box
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(248, 249, 250);
  pdf.rect(margin, currentY, pageWidth - 40, 35, 'F');
  pdf.rect(margin, currentY, pageWidth - 40, 35, 'S');

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  
  const infoY = currentY + 8;
  pdf.text(`Auditor: ${auditData.auditorName}`, margin + 5, infoY);
  pdf.text(`Date: ${auditData.auditDate}`, margin + 5, infoY + 6);
  pdf.text(`Location: ${auditData.location}`, margin + 5, infoY + 12);
  pdf.text(`Scope: ${auditData.auditScope}`, margin + 5, infoY + 18);
  
  // Calculate compliance score
  const totalResponses = auditData.checklist.filter(item => item.response).length;
  const yesCount = auditData.checklist.filter(item => item.response === 'Yes').length;
  const score = totalResponses > 0 ? Math.round((yesCount / totalResponses) * 100) : 0;
  
  pdf.text(`Compliance Score: ${score}% (${yesCount}/${totalResponses})`, margin + 100, infoY);
  pdf.text(`Status: ${auditData.status.toUpperCase()}`, margin + 100, infoY + 6);
  
  currentY += 45;

  // Checklist items
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Compliance Checklist', margin, currentY);
  currentY += 10;

  // Group checklist by sections (based on code prefixes)
  const sections = [
    { title: 'Design Control', codes: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'] },
    { title: 'Purchasing Control', codes: ['C8', 'C9', 'C10', 'C11', 'C12'] },
    { title: 'Storage Management', codes: ['C13', 'C14', 'C15', 'C16', 'C17'] },
    { title: 'Incoming Inspection', codes: ['C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24', 'C25'] },
    { title: 'Production Control', codes: ['C26', 'C27', 'C28', 'C29', 'C30', 'C31', 'C32', 'C33', 'C34', 'C35', 'C36', 'C37', 'C38', 'C39', 'C40', 'C41', 'C42', 'C43', 'C44', 'C45'] },
    { title: 'Final Product Inspection', codes: ['C46', 'C47', 'C48', 'C49', 'C50', 'C51', 'C52', 'C53'] },
    { title: 'Measuring & Testing Equipment', codes: ['C54', 'C55', 'C56', 'C57', 'C58'] },
    { title: 'Resource Management', codes: ['C59', 'C60', 'C61', 'C62', 'C63'] },
    { title: 'Continuous Improvement', codes: ['C64', 'C65', 'C66', 'C67', 'C68', 'C69', 'C70', 'C71', 'C72', 'C73'] },
    { title: 'Social & Environmental', codes: ['C74', 'C75', 'C76', 'C77', 'C78', 'C79', 'C80', 'C81', 'C82', 'C83'] },
    { title: 'Health & Safety', codes: ['C84', 'C85', 'C86', 'C87', 'C88', 'C89', 'C90', 'C91', 'C92', 'C93'] }
  ];

  for (const section of sections) {
    // Section header
    if (currentY > pageHeight - 40) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 51, 102);
    pdf.text(section.title, margin, currentY);
    currentY += 8;

    // Section items
    const sectionItems = auditData.checklist.filter(item => section.codes.includes(item.code));
    
    for (const item of sectionItems) {
      if (currentY > pageHeight - 20) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      // Item code and response
      const responseColor = item.response === 'Yes' ? [0, 128, 0] : 
                           item.response === 'No' ? [255, 0, 0] : [128, 128, 128];
      
      pdf.text(`${item.code}:`, margin, currentY);
      
      if (item.response) {
        pdf.setTextColor(responseColor[0], responseColor[1], responseColor[2]);
        pdf.text(item.response, margin + 15, currentY);
        pdf.setTextColor(0, 0, 0);
      }
      
      currentY += 5;

      // Question (wrapped text)
      const questionLines = pdf.splitTextToSize(item.question, pageWidth - 60);
      pdf.text(questionLines, margin + 5, currentY);
      currentY += questionLines.length * 4;

      // Remark if present
      if (item.remark && item.remark.trim()) {
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        const remarkLines = pdf.splitTextToSize(`Remark: ${item.remark}`, pageWidth - 60);
        pdf.text(remarkLines, margin + 5, currentY);
        currentY += remarkLines.length * 3;
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
      }

      // Evidence images
      if (item.evidence && item.evidence.length > 0) {
        pdf.setFontSize(8);
        pdf.setTextColor(0, 102, 204);
        pdf.text(`Evidence: ${item.evidence.length} image(s) attached`, margin + 5, currentY);
        currentY += 3;
        pdf.setTextColor(0, 0, 0);
      }

      currentY += 3;
    }
    
    currentY += 5;
  }

  // Signature section
  if (currentY > pageHeight - 60) {
    pdf.addPage();
    currentY = 20;
  }

  currentY += 20;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SIGNATURES', margin, currentY);
  currentY += 15;

  // Signature boxes
  pdf.setFont('helvetica', 'normal');
  pdf.rect(margin, currentY, 70, 30, 'S');
  pdf.text('Auditor Signature', margin + 5, currentY + 8);
  pdf.text(`Date: _____________`, margin + 5, currentY + 20);

  pdf.rect(margin + 100, currentY, 70, 30, 'S');
  pdf.text('Quality Manager', margin + 105, currentY + 8);
  pdf.text(`Date: _____________`, margin + 105, currentY + 20);

  return Buffer.from(pdf.output('arraybuffer'));
}

export class PDFFallbackGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageWidth: number;
  private margins = { left: 20, right: 20, top: 20, bottom: 20 };

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    
    // Add LATO-like font setup (using built-in fonts for compatibility)
    this.doc.setFont('helvetica');
  }

  async generatePDF(config: PDFFallbackConfig, content: PDFFallbackContent): Promise<Buffer> {
    try {
      // Add company header with Eastern Mills logo space
      this.addHeader(config);
      
      // Add document title and metadata
      this.addDocumentInfo(config);
      
      // Add content sections
      this.addContent(content);
      
      // Add footer with signatures
      this.addFooter(config);
      
      // Convert to buffer
      const pdfOutput = this.doc.output('arraybuffer');
      return Buffer.from(pdfOutput);
    } catch (error) {
      throw new Error(`PDF fallback generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private addHeader(config: PDFFallbackConfig) {
    try {
      // Add Eastern Mills logo at top-left corner
      const logoPath = './attached_assets/NEW EASTERN LOGO (transparent background))v copy (3)_1753322709558.png';
      this.doc.addImage(logoPath, 'PNG', this.margins.left, this.currentY - 5, 30, 12);
    } catch (error) {
      // Fallback to text if logo image fails
      this.doc.setFontSize(10);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text('EASTERN MILLS', this.margins.left, this.currentY);
    }
    
    // Company name (centered)
    this.doc.setFontSize(18);
    this.doc.setTextColor(0, 51, 102); // Eastern Mills blue
    this.doc.setFont('helvetica', 'bold');
    const companyText = config.company || 'Eastern Home Industries';
    const companyWidth = this.doc.getTextWidth(companyText);
    this.doc.text(companyText, (this.pageWidth - companyWidth) / 2, this.currentY + 10);
    
    // Quality Management System subtitle
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'normal');
    const qmsText = 'Quality Management System';
    const qmsWidth = this.doc.getTextWidth(qmsText);
    this.doc.text(qmsText, (this.pageWidth - qmsWidth) / 2, this.currentY + 16);
    
    this.currentY += 30;
  }

  private addDocumentInfo(config: PDFFallbackConfig) {
    // Document title
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 51, 102);
    this.doc.setFont('helvetica', 'bold');
    const titleWidth = this.doc.getTextWidth(config.title);
    this.doc.text(config.title, (this.pageWidth - titleWidth) / 2, this.currentY);
    this.currentY += 15;
    
    // Document metadata box
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setFillColor(248, 249, 250);
    this.doc.rect(this.margins.left, this.currentY, this.pageWidth - 40, 25, 'F');
    this.doc.rect(this.margins.left, this.currentY, this.pageWidth - 40, 25, 'S');
    
    // Metadata content
    this.doc.setFontSize(9);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    
    const metadataY = this.currentY + 6;
    this.doc.text(`Document No: ${config.documentNumber || 'N/A'}`, this.margins.left + 5, metadataY);
    this.doc.text(`Report No: ${config.reportNumber}`, this.margins.left + 5, metadataY + 5);
    this.doc.text(`Revision: ${config.revisionNumber || '01'}`, this.margins.left + 5, metadataY + 10);
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, this.margins.left + 5, metadataY + 15);
    
    if (config.department) {
      this.doc.text(`Department: ${config.department}`, this.margins.left + 80, metadataY);
    }
    
    this.currentY += 35;
  }

  private addContent(content: PDFFallbackContent) {
    content.sections.forEach(section => {
      this.addSection(section);
    });
  }

  private addSection(section: { title: string; type: string; content: any }) {
    // Check if we need a new page
    if (this.currentY > 250) {
      this.doc.addPage();
      this.currentY = 20;
    }
    
    // Section title
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 51, 102);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(section.title, this.margins.left, this.currentY);
    this.currentY += 8;
    
    // Section content based on type
    this.doc.setFontSize(9);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    
    switch (section.type) {
      case 'form':
        this.addFormContent(section.content);
        break;
      case 'table':
        this.addTableContent(section.content);
        break;
      case 'text':
        this.addTextContent(section.content);
        break;
      case 'checklist':
        this.addChecklistContent(section.content);
        break;
    }
    
    this.currentY += 10;
  }

  private addFormContent(formData: Array<{ label: string; value: string }>) {
    formData.forEach(item => {
      if (this.currentY > 270) {
        this.doc.addPage();
        this.currentY = 20;
      }
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${item.label}:`, this.margins.left, this.currentY);
      
      this.doc.setFont('helvetica', 'normal');
      const labelWidth = this.doc.getTextWidth(`${item.label}: `);
      this.doc.text(item.value || 'N/A', this.margins.left + labelWidth + 2, this.currentY);
      
      this.currentY += 6;
    });
  }

  private addTableContent(tableData: { headers: string[]; rows: string[][] }) {
    const startY = this.currentY;
    const colWidth = (this.pageWidth - 40) / tableData.headers.length;
    
    // Headers
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margins.left, startY, this.pageWidth - 40, 8, 'F');
    
    this.doc.setFont('helvetica', 'bold');
    tableData.headers.forEach((header, index) => {
      this.doc.text(header, this.margins.left + (index * colWidth) + 2, startY + 5);
    });
    
    this.currentY = startY + 8;
    
    // Rows
    this.doc.setFont('helvetica', 'normal');
    tableData.rows.forEach(row => {
      if (this.currentY > 270) {
        this.doc.addPage();
        this.currentY = 20;
      }
      
      row.forEach((cell, index) => {
        this.doc.text(cell || '', this.margins.left + (index * colWidth) + 2, this.currentY + 5);
      });
      
      // Draw row border
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(this.margins.left, this.currentY, this.pageWidth - 40, 8, 'S');
      
      this.currentY += 8;
    });
  }

  private addTextContent(text: string) {
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 50);
    lines.forEach((line: string) => {
      if (this.currentY > 270) {
        this.doc.addPage();
        this.currentY = 20;
      }
      this.doc.text(line, this.margins.left, this.currentY);
      this.currentY += 5;
    });
  }

  private addChecklistContent(items: Array<{
    code: string;
    question: string;
    response: string | null;
    remarks: string;
    evidenceImages: string[];
  }>) {
    items.forEach(item => {
      // Check for page break
      if (this.currentY > 240) {
        this.doc.addPage();
        this.currentY = 20;
      }

      // Item code and question
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(9);
      this.doc.text(`${item.code}: ${item.question}`, this.margins.left, this.currentY);
      this.currentY += 6;

      // Response
      this.doc.setFont('helvetica', 'normal');
      const responseText = `Answer: ${item.response || 'Not Answered'}`;
      this.doc.text(responseText, this.margins.left + 5, this.currentY);
      this.currentY += 5;

      // Remarks (if provided)
      if (item.remarks && item.remarks.trim()) {
        this.doc.text(`Remarks: ${item.remarks}`, this.margins.left + 5, this.currentY);
        this.currentY += 5;
      }

      // Evidence images count (if provided)
      if (item.evidenceImages && item.evidenceImages.length > 0) {
        this.doc.text(`Evidence Images (${item.evidenceImages.length}):`, this.margins.left + 5, this.currentY);
        this.currentY += 5;
        
        // Add each evidence image with better quality
        item.evidenceImages.forEach((imageUrl: string, imgIndex: number) => {
          if (imageUrl && imageUrl.startsWith('data:image')) {
            try {
              // High-quality image display in PDF (not compressed for thumbnails)
              this.doc.addImage(imageUrl, 'JPEG', this.margins.left + 10, this.currentY, 60, 45); // Larger size for clarity
              this.currentY += 50;
            } catch (error) {
              console.error('Error adding evidence image to PDF:', error);
              this.doc.text(`Evidence Image ${imgIndex + 1}: [Error loading image]`, this.margins.left + 10, this.currentY);
              this.currentY += 5;
            }
          }
        });
      }

      this.currentY += 3; // Space between items
    });
  }

  private addFooter(config: PDFFallbackConfig) {
    // Ensure footer is positioned at bottom of page with enough space
    const footerY = Math.max(this.currentY + 20, 245);
    
    // Signature section header
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Signatures:', this.margins.left, footerY);
    
    // Draw signature boxes to prevent overlap
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    
    // Quality Manager signature box only
    this.doc.rect(this.margins.left, footerY + 5, 90, 30, 'S');
    this.doc.text('Quality Manager:', this.margins.left + 2, footerY + 12);
    this.doc.text('Date: ___________', this.margins.left + 2, footerY + 20);
    this.doc.text('Signature: ________________', this.margins.left + 2, footerY + 28);
    
    // Footer info - moved down to avoid overlap
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    const footerText = `${config.company} - Report: ${config.reportNumber}`;
    this.doc.text(footerText, this.margins.left, footerY + 45);
  }
}

// Export functions for compatibility with existing system
export async function generateComplianceAuditPDFFallback(auditData: any): Promise<Buffer> {
  const generator = new PDFFallbackGenerator();
  
  const config: PDFFallbackConfig = {
    title: 'Quality Compliance Audit Report',
    company: auditData.company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.',
    reportNumber: `AUDIT-${Date.now()}`,
    documentNumber: 'QMS/AUDIT/001',
    revisionNumber: '02',
    department: 'Quality Assurance'
  };
  
  const content: PDFFallbackContent = {
    sections: [
      {
        title: 'Audit Information',
        type: 'form',
        content: [
          { label: 'Audit Date', value: auditData.auditDate || new Date().toISOString().split('T')[0] },
          { label: 'Auditor', value: auditData.auditorName || 'Quality Auditor' },
          { label: 'Location', value: auditData.location || 'Main Factory' },
          { label: 'Scope', value: auditData.auditScope || 'ISO 9001:2015 Compliance' }
        ]
      },
      {
        title: 'Compliance Summary',
        type: 'form',
        content: [
          { label: 'Total Items', value: auditData.scoreData?.totalItems?.toString() || '0' },
          { label: 'Compliant Items', value: auditData.scoreData?.yesCount?.toString() || '0' },
          { label: 'Non-Compliant Items', value: auditData.scoreData?.noCount?.toString() || '0' },
          { label: 'Overall Score', value: `${auditData.scoreData?.score || 0}%` }
        ]
      },
      // Use checklist field if available, otherwise fall back to parts structure
      ...(auditData.checklist ? [{
        title: 'Complete Compliance Checklist',
        type: 'checklist',
        content: auditData.checklist.map((item: any) => ({
          code: item.code || 'N/A',
          question: item.question || 'No question provided',
          response: item.response || null,
          remarks: item.remark || item.remarks || '',
          evidenceImages: item.evidence || []
        }))
      }] : (auditData.parts || []).map((part: any, partIndex: number) => ({
        title: `Part ${partIndex + 1}: ${part.title || 'Checklist Section'}`,
        type: 'checklist',
        content: (part.items || []).map((item: any) => ({
          code: item.id || item.code || `${partIndex + 1}.${item.id}`,
          question: item.question || 'No question provided',
          response: item.response || null,
          remarks: item.remark || item.remarks || '', // Handle both field names
          evidenceImages: item.evidenceImages || []
        }))
      })))
    ]
  };
  
  if (auditData.checklist) {
    console.log(`📄 PDF generator processing ${auditData.checklist.length} checklist items with evidence images`);
    const itemsWithEvidence = auditData.checklist.filter((item: any) => item.evidence && item.evidence.length > 0);
    console.log(`🖼️ Checklist items with evidence: ${itemsWithEvidence.length}`);
  } else {
    console.log(`📄 PDF generator processing ${auditData.parts?.length || 0} parts with evidence images`);
    if (auditData.parts?.[0]?.items?.[0]?.evidenceImages) {
      console.log(`🖼️ Sample evidence images found: ${auditData.parts[0].items[0].evidenceImages.length} images`);
    }
  }
  
  return generator.generatePDF(config, content);
}

export async function generateLabInspectionPDFFallback(inspectionData: any): Promise<Buffer> {
  const { jsPDF } = await import('jspdf');
  const fs = await import('fs');
  const path = await import('path');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Company and document details
  const company = inspectionData.company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.';
  const docNumber = inspectionData.company === 'EHI' ? 'EHI/IR/IDY' : 'EMPL/IR/IDY';
  const reportNumber = inspectionData.labReportNumber || 'LAB-001';
  const materialType = inspectionData.materialType || 'Dyed';
  
  let yPos = 15;
  
  // Add Eastern Mills logo (top-left)
  try {
    const logoPath = path.join(process.cwd(), 'attached_assets', 'NEW EASTERN LOGO (transparent background))v copy (3)_1753322709558.png');
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
      doc.addImage(logoBase64, 'PNG', 15, yPos, 35, 20);
    }
  } catch (error) {
    console.log('Logo not added:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Document info (top-right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Doc no. - ${docNumber}`, pageWidth - 15, yPos + 8, { align: 'right' });
  doc.text(`Revision: 02`, pageWidth - 15, yPos + 14, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 15, yPos + 20, { align: 'right' });
  
  // Company name (centered below logo)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text(company, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  
  // Main title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Laboratory Material Inspection Report', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  
  // Subtitle
  doc.setFontSize(12);
  doc.text(`${materialType} Raw Materials Inspection`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 20;
  // Material Information Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const leftColX = 20;
  const rightColX = pageWidth / 2 + 10;
  
  doc.text(`Material incoming date: ${inspectionData.materialIncomingDate || inspectionData.incomingDate || ''}`, leftColX, yPos);
  doc.text(`Challan/Invoice No.: ${inspectionData.challanNumber || ''}`, rightColX, yPos);
  yPos += 8;
  
  doc.text(`Name of supplier: ${inspectionData.supplierName || ''}`, leftColX, yPos);
  doc.text(`Lot No.: ${inspectionData.lotNumber || ''}`, rightColX, yPos);
  yPos += 8;
  
  if (inspectionData.tagNumber) {
    doc.text(`Tag No.: ${inspectionData.tagNumber}`, leftColX, yPos);
    yPos += 8;
  }
  
  doc.text(`Shade No.: ${inspectionData.shadeNumber || ''}`, leftColX, yPos);
  yPos += 12;
  
  // Transport condition
  doc.text('Transport Condition:', leftColX, yPos);
  const transportOK = inspectionData.transportCondition === 'Ok';
  doc.text(`OK: [${transportOK ? 'X' : ' '}]`, leftColX + 60, yPos);
  doc.text(`Not OK: [${!transportOK ? 'X' : ' '}]`, leftColX + 90, yPos);
  yPos += 8;
  
  doc.setFontSize(8);
  doc.text('(Materials should be covered completely)', leftColX, yPos);
  yPos += 15;
  
  // Testing Parameters Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Testing Parameters', leftColX, yPos);
  yPos += 12;
  
  // Table headers - 4 columns matching screenshot
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Testing Parameters', leftColX, yPos);
  doc.text('Standard', leftColX + 50, yPos);
  doc.text('Tolerance', leftColX + 90, yPos);
  doc.text('Result', leftColX + 130, yPos);
  yPos += 6;
  
  // Horizontal line
  doc.line(leftColX, yPos, pageWidth - 20, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  
  const testingParams = inspectionData.testingParameters || [];
  
  // Define official testing parameters with exact standards (removed parameters 3 and 7)
  const officialParams = [
    { name: 'Color Fastness to Rubbing (Dry)', standard: 'Wool: ≥4\nCotton: ≥3-4', tolerance: 'Wool: ≥4\nCotton: ≥3-4' },
    { name: 'Color Fastness to Rubbing (Wet)', standard: 'Wool: ≥3\nCotton: ≥3', tolerance: 'Wool: ≥3\nCotton: ≥3' },
    { name: 'Shade Matching', standard: 'As per approved sample', tolerance: 'As per approved sample' },
    { name: 'Hank Variations', standard: 'As per approved sample', tolerance: 'As per approved sample' },
    { name: 'Cleanliness of Hanks', standard: 'Proper neat & Clean', tolerance: 'Proper neat & Clean' },
    { name: 'Strength', standard: 'OK', tolerance: 'OK' },
    { name: 'Stain/Dust', standard: 'NO', tolerance: 'NO' }
  ];
  
  officialParams.forEach((param, index) => {
    const inspectionParam = testingParams.find((p: any) => p.testName === param.name);
    const result = inspectionParam?.result || '';
    
    doc.text(param.name, leftColX, yPos);
    doc.text(param.standard.replace('\n', ' '), leftColX + 50, yPos);
    doc.text(param.tolerance.replace('\n', ' '), leftColX + 90, yPos);
    doc.text(result, leftColX + 130, yPos);
    
    yPos += 6;
  });
  
  yPos += 10;
  
  // Moisture Content Tolerance Section
  doc.setFont('helvetica', 'bold');
  doc.text('Moisture Content Tolerance:', leftColX, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Summer: 16% (Reference), Winter: 12% (Reference)`, leftColX, yPos);
  yPos += 6;
  doc.text(`Status: ${inspectionData.moistureContentTolerance || 'Not specified'}`, leftColX, yPos);
  yPos += 10;
  
  // Testing Parameters Remarks Section (after moisture content tolerance)
  doc.setFont('helvetica', 'bold');
  doc.text('Testing Parameters Remarks:', leftColX, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  const testingRemarks = inspectionData.testingParametersRemarks || '';
  if (testingRemarks) {
    const remarkLines = doc.splitTextToSize(testingRemarks, pageWidth - 40);
    doc.text(remarkLines, leftColX, yPos);
    yPos += remarkLines.length * 4;
  } else {
    doc.text('No remarks provided', leftColX, yPos);
    yPos += 4;
  }
  yPos += 15;
  
  // Process Verification Section
  doc.setFont('helvetica', 'bold');
  doc.text('Process Verification:', leftColX, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  const processRemarks = inspectionData.processRemarks || '';
  if (processRemarks) {
    const processLines = doc.splitTextToSize(processRemarks, pageWidth - 40);
    doc.text(processLines, leftColX, yPos);
    yPos += processLines.length * 5 + 10;
  } else {
    yPos += 10;
  }
  
  // Sign-off Section
  doc.setFont('helvetica', 'bold');
  doc.text('Sign-off:', leftColX, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Checked by: ${inspectionData.checkedBy || '__________________'}`, leftColX, yPos);
  doc.text(`Verified by: ${inspectionData.verifiedBy || '__________________'}`, leftColX + 80, yPos);
  yPos += 8;
  
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, leftColX, yPos);
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, leftColX + 80, yPos);
  
  // Return the PDF buffer
  return Buffer.from(doc.output('arraybuffer'));
}