/**
 * Master PDF Generation System with LATO Font Support
 * Comprehensive system for generating professional PDFs with Puppeteer primary and jsPDF fallback
 */
import puppeteer from 'puppeteer';
import { jsPDF } from 'jspdf';
export class MasterPDFGenerator {
    constructor() {
        this.logoPath = './attached_assets/NEW EASTERN LOGO (transparent background))v copy (3)_1753322709558.png';
    }
    static getInstance() {
        if (!MasterPDFGenerator.instance) {
            MasterPDFGenerator.instance = new MasterPDFGenerator();
        }
        return MasterPDFGenerator.instance;
    }
    /**
     * Primary PDF generation using Puppeteer with LATO font
     */
    async generatePDF(config, content) {
        console.log(`🔧 Starting PDF generation for ${config.type}: ${config.reportNumber}`);
        try {
            // Try Puppeteer first
            console.log('🎯 Attempting Puppeteer PDF generation with LATO font...');
            return await this.generateWithPuppeteer(config, content);
        }
        catch (puppeteerError) {
            const puppeteerMessage = puppeteerError instanceof Error ? puppeteerError.message : 'Unknown Puppeteer error';
            console.warn('⚠️ Puppeteer PDF generation failed, falling back to jsPDF:', puppeteerMessage);
            console.log('🔄 Using jsPDF fallback system...');
            try {
                return await this.generateWithFallback(config, content);
            }
            catch (fallbackError) {
                const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error';
                console.error('❌ Both PDF generation methods failed');
                throw new Error(`PDF generation failed: Puppeteer: ${puppeteerMessage}, Fallback: ${fallbackMessage}`);
            }
        }
    }
    /**
     * Puppeteer-based PDF generation with LATO font
     */
    async generateWithPuppeteer(config, content) {
        const html = this.generateHTML(config, content);
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium-browser',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '15mm',
                    right: '15mm',
                    bottom: '20mm',
                    left: '15mm'
                },
                printBackground: true,
                preferCSSPageSize: true
            });
            console.log('✅ Puppeteer PDF generation successful');
            return Buffer.from(pdfBuffer);
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    /**
     * Generate HTML template with LATO font for Puppeteer
     */
    generateHTML(config, content) {
        const companyName = config.company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.';
        return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Lato', 'Arial', sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .header {
          position: relative;
          margin-bottom: 20px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 15px;
        }
        
        .logo {
          position: absolute;
          top: 0;
          left: 0;
          width: 60px;
          height: 40px;
        }
        
        .company-info {
          margin-left: 70px;
          text-align: center;
        }
        
        .company-name {
          font-size: 18px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .document-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 3px;
        }
        
        .document-subtitle {
          font-size: 12px;
          color: #666;
        }
        
        .document-info {
          position: absolute;
          top: 0;
          right: 0;
          text-align: right;
          font-size: 9px;
          color: #666;
        }
        
        .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 3px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .form-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .form-label {
          font-weight: 600;
          font-size: 10px;
          color: #374151;
        }
        
        .form-value {
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 3px;
          background: #f9fafb;
          font-size: 10px;
        }
        
        .parameters-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 9px;
        }
        
        .parameters-table th,
        .parameters-table td {
          border: 1px solid #d1d5db;
          padding: 6px 4px;
          text-align: left;
          vertical-align: top;
        }
        
        .parameters-table th {
          background: #f3f4f6;
          font-weight: 700;
          font-size: 9px;
        }
        
        .remarks-section {
          background: #eff6ff;
          border: 1px solid #93c5fd;
          border-radius: 4px;
          padding: 10px;
          margin: 15px 0;
        }
        
        .remarks-title {
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 5px;
          font-size: 11px;
        }
        
        .footer {
          position: fixed;
          bottom: 20mm;
          left: 15mm;
          right: 15mm;
          border-top: 1px solid #d1d5db;
          padding-top: 15px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        
        .signature-box {
          width: 120px;
          text-align: center;
        }
        
        .signature-line {
          border-top: 1px solid #333;
          margin-bottom: 5px;
          height: 30px;
        }
        
        .signature-title {
          font-weight: 600;
          font-size: 9px;
        }
        
        .report-info {
          text-align: center;
          font-size: 9px;
          color: #666;
        }
        
        @page {
          margin: 15mm;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <img src="${this.logoPath}" alt="Eastern Mills Logo" class="logo" />
        <div class="company-info">
          <div class="company-name">${companyName}</div>
          <div class="document-title">${content.header.title}</div>
          ${content.header.subtitle ? `<div class="document-subtitle">${content.header.subtitle}</div>` : ''}
        </div>
        <div class="document-info">
          <div>Document No.: ${config.documentNumber || config.reportNumber}</div>
          <div>Revision: ${config.revisionNumber || '01'}</div>
          <div>Date: ${content.header.date}</div>
          <div>Report No.: ${config.reportNumber}</div>
        </div>
      </div>

      <!-- Content Sections -->
      ${content.sections.map(section => this.renderSection(section)).join('')}

      <!-- Footer -->
      <div class="footer">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-title">${content.footer.inspector.name}</div>
          <div>Laboratory Inspector</div>
          <div>Date: ${content.footer.inspector.date || new Date().toLocaleDateString('en-GB')}</div>
        </div>
        
        <div class="report-info">
          <div>Lab Report No.: ${content.footer.reportNumber}</div>
          <div>Generated: ${new Date().toLocaleDateString('en-GB')}</div>
        </div>
        
        ${content.footer.manager ? `
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-title">${content.footer.manager.name}</div>
          <div>Quality Manager</div>
          <div>Date: ${content.footer.manager.date || new Date().toLocaleDateString('en-GB')}</div>
        </div>
        ` : '<div></div>'}
      </div>
    </body>
    </html>
    `;
    }
    /**
     * Render individual sections based on type
     */
    renderSection(section) {
        switch (section.type) {
            case 'form':
                return this.renderFormSection(section);
            case 'parameters':
                return this.renderParametersSection(section);
            case 'table':
                return this.renderTableSection(section);
            case 'text':
                return this.renderTextSection(section);
            default:
                return `<div class="section"><div class="section-title">${section.title}</div></div>`;
        }
    }
    renderFormSection(section) {
        const items = Object.entries(section.content || {}).map(([key, value]) => `<div class="form-item">
        <div class="form-label">${this.formatLabel(key)}</div>
        <div class="form-value">${value || '-'}</div>
      </div>`).join('');
        return `
    <div class="section">
      <div class="section-title">${section.title}</div>
      <div class="form-grid">${items}</div>
    </div>
    `;
    }
    renderParametersSection(section) {
        const parameters = section.content?.parameters || [];
        const remarks = section.content?.remarks || '';
        const tableRows = parameters.map((param) => `
      <tr>
        <td>${param.testName || param.name}</td>
        <td>${param.standard || 'As per standard'}</td>
        <td>${param.tolerance || 'As per standard'}</td>
        <td>${param.result || '-'}</td>
        ${param.hankResults ? `<td>${param.hankResults.join(', ')}</td>` : '<td>-</td>'}
      </tr>
    `).join('');
        return `
    <div class="section">
      <div class="section-title">${section.title}</div>
      <table class="parameters-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Standard</th>
            <th>Tolerance</th>
            <th>Result</th>
            <th>Hank Results</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      ${remarks ? `
      <div class="remarks-section">
        <div class="remarks-title">Testing Parameters Remarks</div>
        <div>${remarks}</div>
      </div>
      ` : ''}
    </div>
    `;
    }
    renderTableSection(section) {
        return `<div class="section"><div class="section-title">${section.title}</div></div>`;
    }
    renderTextSection(section) {
        return `
    <div class="section">
      <div class="section-title">${section.title}</div>
      <div>${section.content}</div>
    </div>
    `;
    }
    formatLabel(key) {
        return key.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/\b\w/g, str => str.toUpperCase());
    }
    /**
     * Fallback PDF generation using jsPDF with LATO-like fonts
     */
    async generateWithFallback(config, content) {
        console.log('🔄 Generating PDF using jsPDF fallback system...');
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        // Set up LATO-like font (using built-in helvetica for compatibility)
        doc.setFont('helvetica');
        let yPos = 25;
        const pageWidth = doc.internal.pageSize.getWidth();
        const leftMargin = 20;
        const rightMargin = 20;
        const contentWidth = pageWidth - leftMargin - rightMargin;
        // Add Eastern Mills Logo
        try {
            doc.addImage(this.logoPath, 'PNG', leftMargin, 15, 35, 20);
        }
        catch (error) {
            console.warn('Logo not found, using text fallback');
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('EASTERN MILLS', leftMargin, 25);
        }
        // Company Name and Title
        doc.setFontSize(16);
        doc.setTextColor(30, 64, 175); // Blue color
        doc.setFont('helvetica', 'bold');
        const companyName = config.company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.';
        doc.text(companyName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(content.header.title, pageWidth / 2, yPos, { align: 'center' });
        // Document Info (top right)
        doc.setFontSize(9);
        doc.setTextColor(102, 102, 102);
        doc.text(`Document No.: ${config.documentNumber || config.reportNumber}`, pageWidth - rightMargin, 25, { align: 'right' });
        doc.text(`Revision: ${config.revisionNumber || '01'}`, pageWidth - rightMargin, 30, { align: 'right' });
        doc.text(`Date: ${content.header.date}`, pageWidth - rightMargin, 35, { align: 'right' });
        doc.text(`Report No.: ${config.reportNumber}`, pageWidth - rightMargin, 40, { align: 'right' });
        yPos += 20;
        // Render Content Sections
        for (const section of content.sections) {
            yPos = this.renderSectionFallback(doc, section, yPos, leftMargin, contentWidth);
            // Check if we need a new page
            if (yPos > 250) {
                doc.addPage();
                yPos = 25;
            }
        }
        // Footer Signatures
        yPos = Math.max(yPos + 20, 250);
        doc.setDrawColor(211, 213, 219);
        doc.line(leftMargin, yPos, pageWidth - rightMargin, yPos);
        yPos += 10;
        // Inspector Signature
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.rect(leftMargin, yPos, 80, 35);
        doc.text('Laboratory Inspector', leftMargin + 40, yPos + 10, { align: 'center' });
        doc.text(content.footer.inspector.name, leftMargin + 40, yPos + 20, { align: 'center' });
        doc.text(`Date: ${content.footer.inspector.date || new Date().toLocaleDateString('en-GB')}`, leftMargin + 40, yPos + 30, { align: 'center' });
        // Report Number (center)
        doc.text(`Lab Report No.: ${content.footer.reportNumber}`, pageWidth / 2, yPos + 15, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, yPos + 25, { align: 'center' });
        // Manager Signature (if exists)
        if (content.footer.manager) {
            doc.rect(pageWidth - rightMargin - 80, yPos, 80, 35);
            doc.text('Quality Manager', pageWidth - rightMargin - 40, yPos + 10, { align: 'center' });
            doc.text(content.footer.manager.name, pageWidth - rightMargin - 40, yPos + 20, { align: 'center' });
            doc.text(`Date: ${content.footer.manager.date || new Date().toLocaleDateString('en-GB')}`, pageWidth - rightMargin - 40, yPos + 30, { align: 'center' });
        }
        const pdfOutput = doc.output('arraybuffer');
        console.log('✅ jsPDF fallback generation successful');
        return Buffer.from(pdfOutput);
    }
    renderSectionFallback(doc, section, yPos, leftMargin, contentWidth) {
        // Section Title
        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, leftMargin, yPos);
        yPos += 8;
        // Section Content based on type
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        switch (section.type) {
            case 'form':
                yPos = this.renderFormSectionFallback(doc, section.content, yPos, leftMargin, contentWidth);
                break;
            case 'parameters':
                yPos = this.renderParametersSectionFallback(doc, section.content, yPos, leftMargin, contentWidth);
                break;
            case 'text':
                const lines = doc.splitTextToSize(section.content, contentWidth);
                doc.text(lines, leftMargin, yPos);
                yPos += lines.length * 4;
                break;
        }
        return yPos + 10;
    }
    renderFormSectionFallback(doc, content, yPos, leftMargin, contentWidth) {
        const entries = Object.entries(content || {});
        for (let i = 0; i < entries.length; i += 2) {
            const [key1, value1] = entries[i];
            const [key2, value2] = entries[i + 1] || ['', ''];
            // Left column
            doc.setFont('helvetica', 'bold');
            doc.text(`${this.formatLabel(key1)}:`, leftMargin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(String(value1 || '-'), leftMargin + 50, yPos);
            // Right column
            if (key2) {
                doc.setFont('helvetica', 'bold');
                doc.text(`${this.formatLabel(key2)}:`, leftMargin + 100, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(String(value2 || '-'), leftMargin + 150, yPos);
            }
            yPos += 6;
        }
        return yPos;
    }
    renderParametersSectionFallback(doc, content, yPos, leftMargin, contentWidth) {
        const parameters = content?.parameters || [];
        // Table headers
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Parameter', leftMargin, yPos);
        doc.text('Standard', leftMargin + 50, yPos);
        doc.text('Result', leftMargin + 100, yPos);
        yPos += 6;
        // Table rows
        doc.setFont('helvetica', 'normal');
        parameters.forEach((param) => {
            doc.text(param.testName || param.name || '', leftMargin, yPos);
            doc.text(param.standard || 'As per standard', leftMargin + 50, yPos);
            doc.text(param.result || '-', leftMargin + 100, yPos);
            yPos += 5;
        });
        // Remarks section
        if (content?.remarks) {
            yPos += 5;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 64, 175);
            doc.text('Testing Parameters Remarks:', leftMargin, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const remarkLines = doc.splitTextToSize(content.remarks, contentWidth);
            doc.text(remarkLines, leftMargin, yPos);
            yPos += remarkLines.length * 4;
        }
        return yPos;
    }
}
// Export singleton instance and convenience functions
export const masterPDFGenerator = MasterPDFGenerator.getInstance();
export async function generateLabInspectionPDF(inspectionData) {
    const config = {
        title: `Lab Inspection Report - ${inspectionData.materialType}`,
        company: inspectionData.company === 'EHI' ? 'EHI' : 'EMPL',
        reportNumber: inspectionData.labReportNumber || `${inspectionData.company}-LAB-${Date.now()}`,
        documentNumber: `DOC-${inspectionData.company}-${Date.now()}`,
        revisionNumber: '01',
        department: 'Quality Control Laboratory',
        type: 'lab_inspection'
    };
    const content = {
        header: {
            title: `Incoming Inspection - ${inspectionData.materialType} Raw Materials`,
            subtitle: 'Quality Control Laboratory Report',
            date: inspectionData.materialIncomingDate || new Date().toLocaleDateString('en-GB')
        },
        sections: [
            {
                title: 'Material & Supplier Information',
                type: 'form',
                content: {
                    challanNumber: inspectionData.challanNumber,
                    supplierName: inspectionData.supplierName,
                    transportCondition: inspectionData.transportCondition,
                    lotNumber: inspectionData.lotNumber,
                    tagNumber: inspectionData.tagNumber,
                    shadeNumber: inspectionData.shadeNumber,
                    numberOfBales: inspectionData.numberOfBales,
                    numberOfHanks: inspectionData.numberOfHanks
                }
            },
            {
                title: 'Testing Parameters',
                type: 'parameters',
                content: {
                    parameters: inspectionData.testingParameters || [],
                    remarks: inspectionData.testingParametersRemarks
                }
            },
            {
                title: 'Moisture Content Tolerance',
                type: 'text',
                content: `Summer: 16% (Reference), Winter: 12% (Reference)<br>Status: ${inspectionData.moistureContentTolerance || 'Not specified'}`
            }
        ],
        footer: {
            inspector: {
                name: inspectionData.checkedBy || 'Lab Inspector',
                date: new Date().toLocaleDateString('en-GB')
            },
            manager: inspectionData.verifiedBy ? {
                name: inspectionData.verifiedBy,
                date: new Date().toLocaleDateString('en-GB')
            } : undefined,
            reportNumber: config.reportNumber
        }
    };
    return await masterPDFGenerator.generatePDF(config, content);
}
export async function generateComplianceAuditPDF(auditData) {
    const config = {
        title: 'ISO 9001:2015 Compliance Audit Report',
        company: auditData.company === 'EHI' ? 'EHI' : 'EMPL',
        reportNumber: auditData.reportNumber || `${auditData.company}-AUDIT-${Date.now()}`,
        documentNumber: `DOC-${auditData.company}-AUDIT-${Date.now()}`,
        revisionNumber: '01',
        department: 'Quality Assurance',
        type: 'compliance_audit'
    };
    const content = {
        header: {
            title: 'ISO 9001:2015 Compliance Audit Report',
            subtitle: 'Quality Management System Audit',
            date: auditData.auditDate || new Date().toLocaleDateString('en-GB')
        },
        sections: [
            {
                title: 'Audit Information',
                type: 'form',
                content: {
                    auditorName: auditData.auditorName,
                    auditDate: auditData.auditDate,
                    company: auditData.company,
                    location: auditData.location,
                    auditScope: auditData.auditScope,
                    overallScore: `${auditData.scoreData?.score || 0}% (${auditData.scoreData?.yesCount || 0}/${auditData.scoreData?.applicableItems || 0})`
                }
            }
        ],
        footer: {
            inspector: {
                name: auditData.auditorName || 'Quality Auditor',
                date: new Date().toLocaleDateString('en-GB')
            },
            reportNumber: config.reportNumber
        }
    };
    return await masterPDFGenerator.generatePDF(config, content);
}
export default masterPDFGenerator;
