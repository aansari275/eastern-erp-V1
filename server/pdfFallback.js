import { jsPDF } from 'jspdf';
export class PDFFallbackGenerator {
    constructor() {
        this.currentY = 20;
        this.margins = { left: 20, right: 20, top: 20, bottom: 20 };
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        // Add LATO-like font setup (using built-in fonts for compatibility)
        this.doc.setFont('helvetica');
    }
    async generatePDF(config, content) {
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
        }
        catch (error) {
            throw new Error(`PDF fallback generation failed: ${error.message}`);
        }
    }
    addHeader(config) {
        try {
            // Add Eastern Mills logo at top-left corner
            const logoPath = './attached_assets/NEW EASTERN LOGO (transparent background))v copy (3)_1753322709558.png';
            this.doc.addImage(logoPath, 'PNG', this.margins.left, this.currentY - 5, 30, 12);
        }
        catch (error) {
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
    addDocumentInfo(config) {
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
    addContent(content) {
        content.sections.forEach(section => {
            this.addSection(section);
        });
    }
    addSection(section) {
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
        }
        this.currentY += 10;
    }
    addFormContent(formData) {
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
    addTableContent(tableData) {
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
    addTextContent(text) {
        const lines = this.doc.splitTextToSize(text, this.pageWidth - 50);
        lines.forEach((line) => {
            if (this.currentY > 270) {
                this.doc.addPage();
                this.currentY = 20;
            }
            this.doc.text(line, this.margins.left, this.currentY);
            this.currentY += 5;
        });
    }
    addFooter(config) {
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
        // Left signature box - Inspector
        this.doc.rect(this.margins.left, footerY + 5, 75, 30, 'S');
        this.doc.text('Laboratory Inspector:', this.margins.left + 2, footerY + 12);
        this.doc.text('Date: ___________', this.margins.left + 2, footerY + 20);
        this.doc.text('Signature: ________________', this.margins.left + 2, footerY + 28);
        // Right signature box - Quality Manager  
        this.doc.rect(this.margins.left + 80, footerY + 5, 75, 30, 'S');
        this.doc.text('Quality Manager:', this.margins.left + 82, footerY + 12);
        this.doc.text('Date: ___________', this.margins.left + 82, footerY + 20);
        this.doc.text('Signature: ________________', this.margins.left + 82, footerY + 28);
        // Footer info - moved down to avoid overlap
        this.doc.setFontSize(8);
        this.doc.setTextColor(100, 100, 100);
        const footerText = `${config.company} - Report: ${config.reportNumber} | Generated: ${new Date().toLocaleDateString()}`;
        this.doc.text(footerText, this.margins.left, footerY + 45);
    }
}
// Export functions for compatibility with existing system
export async function generateComplianceAuditPDFFallback(auditData) {
    const generator = new PDFFallbackGenerator();
    const config = {
        title: 'Quality Compliance Audit Report',
        company: auditData.company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.',
        reportNumber: `AUDIT-${Date.now()}`,
        documentNumber: 'QMS/AUDIT/001',
        revisionNumber: '02',
        department: 'Quality Assurance'
    };
    const content = {
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
            }
        ]
    };
    return generator.generatePDF(config, content);
}
export async function generateLabInspectionPDFFallback(inspectionData) {
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
    }
    catch (error) {
        console.log('Logo not added:', error.message);
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
        const inspectionParam = testingParams.find((p) => p.testName === param.name);
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
    }
    else {
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
    }
    else {
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
