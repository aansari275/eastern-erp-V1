/**
 * Master PDF Generation System with LATO Font Support
 * Comprehensive system for generating professional PDFs with Puppeteer primary and jsPDF fallback
 */

import puppeteer from 'puppeteer';
import { jsPDF } from 'jspdf';
import fs from 'fs/promises';
import path from 'path';

// Unified PDF Configuration Interface
export interface PDFConfig {
  title: string;
  company: 'EHI' | 'EMPL';
  reportNumber: string;
  documentNumber?: string;
  revisionNumber?: string;
  issueNumber?: string;
  revisionDate?: string;
  department?: string;
  type: 'lab_inspection' | 'compliance_audit';
}

// Unified PDF Content Interface
export interface PDFContent {
  header: {
    title: string;
    subtitle?: string;
    date: string;
    documentInfo?: Record<string, string>;
  };
  sections: Array<{
    title: string;
    type: 'form' | 'table' | 'text' | 'parameters' | 'checklist';
    content: any;
  }>;
  footer: {
    inspector: {
      name: string;
      signature?: string;
      date?: string;
    };
    manager?: {
      name: string;
      signature?: string;
      date?: string;
    };
    reportNumber: string;
    additionalInfo?: string;
  };
}

export class MasterPDFGenerator {
  private static instance: MasterPDFGenerator;
  private logoPath: string;

  constructor() {
    this.logoPath = './attached_assets/NEW EASTERN LOGO (transparent background))v copy (3)_1753556508764.png';
  }

  static getInstance(): MasterPDFGenerator {
    if (!MasterPDFGenerator.instance) {
      MasterPDFGenerator.instance = new MasterPDFGenerator();
    }
    return MasterPDFGenerator.instance;
  }

  /**
   * Primary PDF generation using Puppeteer with LATO font
   */
  async generatePDF(config: PDFConfig, content: PDFContent): Promise<Buffer> {
    console.log(`🔧 Starting PDF generation for ${config.type}: ${config.reportNumber}`);
    
    try {
      // Try Puppeteer first
      console.log('🎯 Attempting Puppeteer PDF generation with LATO font...');
      return await this.generateWithPuppeteer(config, content);
    } catch (puppeteerError) {
      const puppeteerMessage = puppeteerError instanceof Error ? puppeteerError.message : 'Unknown Puppeteer error';
      console.warn('⚠️ Puppeteer PDF generation failed, falling back to jsPDF:', puppeteerMessage);
      console.log('🔄 Using jsPDF fallback system...');
      
      try {
        return await this.generateWithFallback(config, content);
      } catch (fallbackError) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error';
        console.error('❌ Both PDF generation methods failed');
        throw new Error(`PDF generation failed: Puppeteer: ${puppeteerMessage}, Fallback: ${fallbackMessage}`);
      }
    }
  }

  /**
   * Puppeteer-based PDF generation with LATO font
   */
  private async generateWithPuppeteer(config: PDFConfig, content: PDFContent): Promise<Buffer> {
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
          top: '8mm',
          right: '8mm',
          bottom: '15mm',
          left: '8mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      });

      console.log('✅ Puppeteer PDF generation successful');
      return Buffer.from(pdfBuffer);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate HTML template with LATO font for Puppeteer
   */
  private generateHTML(config: PDFConfig, content: PDFContent): string {
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
          font-size: 12px;
          line-height: 1.3;
          color: #000;
          background: white;
        }
        
        .header {
          position: relative;
          margin-bottom: 35px;
          min-height: 60px;
          padding-bottom: 15px;
        }
        
        .company-info {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          text-align: center;
          padding-top: 8px;
        }
        
        .company-name {
          font-size: 18px;
          font-weight: 700;
          color: #000;
          margin-bottom: 6px;
        }
        
        .document-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
          color: #000;
        }
        
        .document-subtitle {
          font-size: 14px;
          color: #000;
        }
        
        .document-info {
          position: absolute;
          top: 0;
          right: 0;
          text-align: right;
          font-size: 12px;
          color: #000;
          line-height: 1.4;
          font-weight: 600;
        }
        
        .section {
          margin-bottom: 4px;
          page-break-inside: avoid;
        }
        
        .section:first-of-type {
          margin-top: 15px;
        }
        
        .moisture-tolerance-section {
          margin-bottom: 40px;
          padding-bottom: 10px;
        }
        
        .section-title {
          font-size: 13px;
          font-weight: 700;
          color: #000;
          margin-bottom: 5px;
          border-bottom: 1px solid #666;
          padding-bottom: 2px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px 8px;
          margin-bottom: 8px;
          padding: 0 5px;
        }
        
        .form-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-bottom: 6px;
        }
        
        .form-label {
          font-weight: 700;
          font-size: 12px;
          color: #000;
        }
        
        .form-value {
          padding: 4px 6px;
          border: none;
          border-radius: 0px;
          background: #f8f8f8;
          font-size: 10px;
          color: #000;
          min-height: 18px;
          line-height: 1.2;
        }
        
        .parameters-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
          font-size: 10px;
        }
        
        .parameters-table th,
        .parameters-table td {
          border: 1px solid #666;
          padding: 4px 3px;
          text-align: left;
          vertical-align: top;
        }
        
        .parameters-table th {
          background: #f0f0f0;
          font-weight: 700;
          font-size: 11px;
          color: #000;
        }
        
        .remarks-section {
          background: #eff6ff;
          border: 1px solid #93c5fd;
          border-radius: 2px;
          padding: 5px;
          margin: 5px 0;
        }
        
        .remarks-title {
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 3px;
          font-size: 8px;
        }
        
        .footer {
          margin-top: 10px;
          text-align: right;
        }
        
        .signature-box {
          display: inline-block;
          text-align: center;
          width: 150px;
        }
        
        .signature-title {
          font-weight: 700;
          font-size: 12px;
          color: #000;
          margin-bottom: 3px;
        }
        
        @page {
          margin: 10mm;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="company-info">
          <div class="company-name">${companyName}</div>
          <div class="document-title">${content.header.title}</div>
          ${content.header.subtitle ? `<div class="document-subtitle">${content.header.subtitle}</div>` : ''}
        </div>
        <div class="document-info">
          <div>Document No.: ${config.documentNumber || config.reportNumber}</div>
          <div>&nbsp;</div>
          <div>Issue No.: ${config.issueNumber || '01'}</div>
          <div>Revision: ${config.revisionNumber || '01'}</div>
          <div>${config.company === 'EHI' ? 'Revision Date' : 'Effective Date'}: ${config.revisionDate || content.header.date}</div>
          <div>Report No.: ${config.reportNumber}</div>
        </div>
      </div>

      <!-- Content Sections -->
      ${content.sections.map(section => this.renderSection(section)).join('')}

      <!-- Footer -->
      <div class="footer">
        <div class="signature-box">
          <div class="signature-title">${content.footer.inspector.name}</div>
          <div>Laboratory Inspector</div>
          <div>Date: ${content.footer.inspector.date || new Date().toLocaleDateString('en-GB')}</div>
          <div>Time: ${new Date().toLocaleTimeString('en-GB', { hour12: false })}</div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Render individual sections based on type
   */
  private renderSection(section: any): string {
    switch (section.type) {
      case 'form':
        return this.renderFormSection(section);
      case 'parameters':
        return this.renderParametersSection(section);
      case 'table':
        return this.renderTableSection(section);
      case 'text':
        return this.renderTextSection(section);
      case 'checklist':
        return this.renderChecklistSection(section);
      default:
        return `<div class="section"><div class="section-title">${section.title}</div></div>`;
    }
  }

  private renderFormSection(section: any): string {
    const items = Object.entries(section.content || {}).map(([key, value]) => 
      `<div class="form-item">
        <div class="form-label">${this.formatLabel(key)}</div>
        <div class="form-value">${value || '-'}</div>
      </div>`
    ).join('');

    return `
    <div class="section">
      <div class="section-title">${section.title}</div>
      <div class="form-grid">${items}</div>
    </div>
    `;
  }

  private renderParametersSection(section: any): string {
    const parameters = section.content?.parameters || [];
    const remarks = section.content?.remarks || '';
    
    const formatSampleResults = (hankResults: any) => {
      if (!hankResults || hankResults.length === 0) return '-';
      
      // Format as compact columns: "Hank 1: result | Hank 2: result"
      const pairs = [];
      for (let i = 0; i < hankResults.length; i += 2) {
        if (i + 1 < hankResults.length) {
          pairs.push(`${hankResults[i]} | ${hankResults[i + 1]}`);
        } else {
          pairs.push(hankResults[i]);
        }
      }
      return pairs.join('<br>');
    };
    
    const tableRows = parameters.map((param: any) => `
      <tr style="height: 24px;">
        <td style="width: 28%; padding: 6px 3px; border: 1px solid #666; text-align: left; font-size: 9px; font-weight: 600; line-height: 1.3; vertical-align: top;">${param.testName || param.name}</td>
        <td style="width: 18%; padding: 6px 3px; border: 1px solid #666; text-align: left; font-size: 8px; line-height: 1.2; vertical-align: top;">As per standard</td>
        <td style="width: 15%; padding: 6px 3px; border: 1px solid #666; text-align: left; font-size: 8px; line-height: 1.2; vertical-align: top;">As per tolerance</td>
        <td style="width: 12%; padding: 6px 3px; border: 1px solid #666; text-align: center; font-size: 9px; font-weight: 700; line-height: 1.2; vertical-align: top;">${param.result || '-'}</td>
        <td style="width: 27%; padding: 6px 3px; border: 1px solid #666; text-align: left; font-size: 8px; line-height: 1.2; vertical-align: top;">${formatSampleResults(param.hankResults)}</td>
      </tr>
    `).join('');

    return `
    <div class="section">
      <div class="section-title">${section.title}</div>
      <table class="parameters-table" style="width: 100%; border-collapse: collapse; margin: 8px 0;">
        <thead>
          <tr style="background-color: #e8e8e8;">
            <th style="width: 28%; padding: 4px 2px; border: 1px solid #666; text-align: left; font-weight: bold; font-size: 9px;">Parameter</th>
            <th style="width: 18%; padding: 4px 2px; border: 1px solid #666; text-align: left; font-weight: bold; font-size: 9px;">Standard</th>
            <th style="width: 15%; padding: 4px 2px; border: 1px solid #666; text-align: left; font-weight: bold; font-size: 9px;">Tolerance</th>
            <th style="width: 12%; padding: 4px 2px; border: 1px solid #666; text-align: center; font-weight: bold; font-size: 9px;">Result</th>
            <th style="width: 27%; padding: 4px 2px; border: 1px solid #666; text-align: left; font-weight: bold; font-size: 9px;">Sample Results</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      ${remarks ? `
      <div class="remarks-section" style="margin-top: 3px; padding: 4px; background-color: #f0f0f0; border: 1px solid #666;">
        <div class="remarks-title" style="font-weight: bold; margin-bottom: 2px; color: #000; font-size: 10px;">Testing Parameters Remarks</div>
        <div style="line-height: 1.2; font-size: 9px; color: #000;">${remarks}</div>
      </div>
      ` : ''}
    </div>
    `;
  }

  private renderTableSection(section: any): string {
    return `<div class="section"><div class="section-title">${section.title}</div></div>`;
  }

  private renderTextSection(section: any): string {
    const sectionClass = section.title.includes('Moisture Content Tolerance') 
      ? 'section moisture-tolerance-section' 
      : 'section';
      
    return `
    <div class="${sectionClass}">
      <div class="section-title">${section.title}</div>
      <div>${section.content}</div>
    </div>
    `;
  }

  private renderChecklistSection(section: any): string {
    if (!section.content || !Array.isArray(section.content)) {
      return `<div class="section"><div class="section-title">${section.title}</div><p>No checklist items found</p></div>`;
    }

    const checklistItems = section.content.map((item: any) => {
      // Generate embedded images HTML
      let imagesHtml = '';
      if (item.evidenceImages && item.evidenceImages.length > 0) {
        const imageElements = item.evidenceImages.map((imageData: string) => {
          // Handle base64 images - embed them directly in PDF
          if (imageData.startsWith('data:image/')) {
            return `<img src="${imageData}" style="max-width: 120px; max-height: 80px; margin: 2px; border: 1px solid #ccc;" />`;
          }
          return '';
        }).join('');
        
        if (imageElements) {
          imagesHtml = `
            <div style="margin-top: 5px;">
              <strong style="font-size: 10px; color: #333;">Evidence Images:</strong>
              <div style="margin-top: 3px;">${imageElements}</div>
            </div>
          `;
        }
      }

      return `
        <tr style="page-break-inside: avoid;">
          <td style="width: 60%; padding: 8px; border: 1px solid #666; vertical-align: top; font-size: 10px;">
            <strong>${item.question}</strong>
          </td>
          <td style="width: 15%; padding: 8px; border: 1px solid #666; text-align: center; vertical-align: top; font-size: 11px; font-weight: bold; color: ${
            item.response === 'Yes' ? '#16a34a' : 
            item.response === 'No' ? '#dc2626' : 
            item.response === 'NA' ? '#6b7280' : '#374151'
          };">
            ${item.response}
          </td>
          <td style="width: 25%; padding: 8px; border: 1px solid #666; vertical-align: top; font-size: 9px;">
            ${item.remark && item.remark !== 'No remarks' ? item.remark : '-'}
            ${imagesHtml}
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="section" style="page-break-inside: avoid; margin-bottom: 15px;">
        <div class="section-title" style="font-size: 14px; font-weight: bold; margin-bottom: 8px; padding-bottom: 3px; border-bottom: 2px solid #333;">${section.title}</div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="width: 60%; padding: 6px; border: 1px solid #666; text-align: left; font-weight: bold; font-size: 11px;">Question</th>
              <th style="width: 15%; padding: 6px; border: 1px solid #666; text-align: center; font-weight: bold; font-size: 11px;">Answer</th>
              <th style="width: 25%; padding: 6px; border: 1px solid #666; text-align: left; font-weight: bold; font-size: 11px;">Remarks & Evidence</th>
            </tr>
          </thead>
          <tbody>
            ${checklistItems}
          </tbody>
        </table>
      </div>
    `;
  }

  private formatLabel(key: string): string {
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .replace(/\b\w/g, str => str.toUpperCase());
  }

  /**
   * Fallback PDF generation using jsPDF with LATO-like fonts
   */
  private async generateWithFallback(config: PDFConfig, content: PDFContent): Promise<Buffer> {
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

    // No logo needed

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
    doc.text(`Issue No.: ${config.issueNumber || '01'}`, pageWidth - rightMargin, 30, { align: 'right' });
    doc.text(`Revision: ${config.revisionNumber || '01'}`, pageWidth - rightMargin, 35, { align: 'right' });
    doc.text(`${config.company === 'EHI' ? 'Revision Date' : 'Effective Date'}: ${config.revisionDate || content.header.date}`, pageWidth - rightMargin, 40, { align: 'right' });
    doc.text(`Report No.: ${config.reportNumber}`, pageWidth - rightMargin, 45, { align: 'right' });

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

  private renderSectionFallback(doc: jsPDF, section: any, yPos: number, leftMargin: number, contentWidth: number): number {
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
      case 'checklist':
        yPos = this.renderChecklistSectionFallback(doc, section.content, yPos, leftMargin, contentWidth);
        break;
      case 'text':
        const lines = doc.splitTextToSize(section.content, contentWidth);
        doc.text(lines, leftMargin, yPos);
        yPos += lines.length * 4;
        break;
    }

    return yPos + 10;
  }

  private renderFormSectionFallback(doc: jsPDF, content: any, yPos: number, leftMargin: number, contentWidth: number): number {
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

  private renderParametersSectionFallback(doc: jsPDF, content: any, yPos: number, leftMargin: number, contentWidth: number): number {
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
    parameters.forEach((param: any) => {
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

  private renderChecklistSectionFallback(doc: jsPDF, content: any[], yPos: number, leftMargin: number, contentWidth: number): number {
    if (!content || !Array.isArray(content)) {
      doc.text('No checklist items found', leftMargin, yPos);
      return yPos + 10;
    }

    // Add table headers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Question', leftMargin, yPos);
    doc.text('Answer', leftMargin + 120, yPos);
    doc.text('Remarks', leftMargin + 150, yPos);
    yPos += 8;

    // Draw header line
    doc.setDrawColor(0, 0, 0);
    doc.line(leftMargin, yPos - 2, leftMargin + contentWidth, yPos - 2);

    // Render each checklist item
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    for (const item of content) {
      // Check if we need a new page
      if (yPos > 260) {
        doc.addPage();
        yPos = 25;
        // Re-add headers on new page
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Question', leftMargin, yPos);
        doc.text('Answer', leftMargin + 120, yPos);
        doc.text('Remarks', leftMargin + 150, yPos);
        yPos += 8;
        doc.line(leftMargin, yPos - 2, leftMargin + contentWidth, yPos - 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
      }

      // Question text (with wrapping)
      const questionLines = doc.splitTextToSize(item.question || '', 110);
      doc.text(questionLines, leftMargin, yPos);

      // Answer with color coding
      if (item.response === 'Yes') {
        doc.setTextColor(0, 128, 0); // Green
      } else if (item.response === 'No') {
        doc.setTextColor(255, 0, 0); // Red
      } else if (item.response === 'NA') {
        doc.setTextColor(128, 128, 128); // Gray
      } else {
        doc.setTextColor(0, 0, 0); // Black
      }
      doc.text(item.response || 'N/A', leftMargin + 120, yPos);
      doc.setTextColor(0, 0, 0); // Reset to black

      // Remarks (with wrapping)
      const remarkText = item.remark && item.remark !== 'No remarks' ? item.remark : '-';
      const remarkLines = doc.splitTextToSize(remarkText, 40);
      doc.text(remarkLines, leftMargin + 150, yPos);

      // Evidence indicator
      if (item.evidenceImages && item.evidenceImages.length > 0) {
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 255); // Blue for evidence indicator
        doc.text(`[${item.evidenceImages.length} images]`, leftMargin + 150, yPos + (remarkLines.length * 3) + 2);
        doc.setTextColor(0, 0, 0); // Reset
        doc.setFontSize(8);
      }

      // Move to next item
      const lineHeight = Math.max(questionLines.length * 3, remarkLines.length * 3, 8);
      yPos += lineHeight + 4;

      // Draw separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(leftMargin, yPos - 2, leftMargin + contentWidth, yPos - 2);
      doc.setDrawColor(0, 0, 0);
    }

    return yPos + 5;
  }
}

// Export singleton instance and convenience functions
export const masterPDFGenerator = MasterPDFGenerator.getInstance();

export async function generateLabInspectionPDF(inspectionData: any): Promise<Buffer> {
  // Get compliance document details based on material type and company
  const complianceInfo = getComplianceDocumentInfo(inspectionData.materialType || inspectionData.inspectionType, inspectionData.company);
  
  const config: PDFConfig = {
    title: `Lab Inspection Report - ${inspectionData.materialType || inspectionData.inspectionType}`,
    company: inspectionData.company === 'EHI' ? 'EHI' : 'EMPL',
    reportNumber: inspectionData.labReportNumber || `${inspectionData.company}-LAB-${Date.now()}`,
    documentNumber: complianceInfo.documentNumber,
    revisionNumber: complianceInfo.revisionNumber,
    issueNumber: complianceInfo.issueNumber,
    revisionDate: complianceInfo.revisionDate,
    department: 'Quality Control Laboratory',
    type: 'lab_inspection'
  };

  // Convert sampleResults to testing parameters format for PDF
  const testingParameters = [];
  if (inspectionData.sampleResults && inspectionData.sampleResults.length > 0) {
    // Get parameter names from first sample
    const firstSample = inspectionData.sampleResults[0];
    if (firstSample && firstSample.results) {
      Object.keys(firstSample.results).forEach(paramName => {
        // Collect results from all samples for this parameter
        const hankResults = inspectionData.sampleResults.map((sample: any, index: number) => 
          `${inspectionData.inspectionType === 'cotton' ? 'Bag' : 'Hank'} ${index + 1}: ${sample.results[paramName] || '-'}`
        );
        
        testingParameters.push({
          name: paramName,
          standard: 'As per standard',
          tolerance: 'As per tolerance',
          result: inspectionData.sampleResults[0]?.results[paramName] || '-',
          hankResults: hankResults
        });
      });
    }
  }

  const content: PDFContent = {
    header: {
      title: `Incoming Inspection - ${(inspectionData.inspectionType || 'Dyed').charAt(0).toUpperCase() + (inspectionData.inspectionType || 'Dyed').slice(1)} Raw Materials`,
      subtitle: 'Quality Control Laboratory Report',
      date: inspectionData.dateOfIncoming || new Date().toLocaleDateString('en-GB')
    },
    sections: [
      {
        title: 'Material & Supplier Information',
        type: 'form',
        content: {
          challanNumber: inspectionData.challanInvoiceNo,
          supplierName: inspectionData.supplierName,
          transportCondition: inspectionData.transportCondition,
          lotNumber: inspectionData.lotNo,
          tagNumber: inspectionData.tagNo,
          shadeNumber: inspectionData.shadeNo,
          numberOfBales: inspectionData.totalBalesReceived || inspectionData.selectedBales,
          numberOfHanks: inspectionData.selectedHanks || inspectionData.selectedBags || inspectionData.selectedCones
        }
      },
      {
        title: 'Testing Parameters',
        type: 'parameters',
        content: {
          parameters: testingParameters,
          remarks: inspectionData.remarks
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

export async function generateComplianceAuditPDF(auditData: any): Promise<Buffer> {
  const config: PDFConfig = {
    title: 'ISO 9001:2015 Compliance Audit Report',
    company: auditData.company === 'EHI' ? 'EHI' : 'EMPL',
    reportNumber: auditData.reportNumber || `${auditData.company}-AUDIT-${Date.now()}`,
    documentNumber: `DOC-${auditData.company}-AUDIT-${Date.now()}`,
    revisionNumber: '01',
    department: 'Quality Assurance',
    type: 'compliance_audit'
  };

  // Build sections with ALL user data preserved
  const sections = [
    {
      title: 'Audit Information',
      type: 'form' as const,
      content: {
        auditorName: auditData.auditorName,
        auditDate: auditData.auditDate,
        company: auditData.company,
        location: auditData.location,
        auditScope: auditData.auditScope,
        overallScore: `${auditData.scoreData?.score || 0}% (${auditData.scoreData?.yesCount || 0}/${auditData.scoreData?.applicableItems || 0})`
      }
    }
  ];

  // Add detailed checklist sections with user answers, remarks, and images
  if (auditData.parts && Array.isArray(auditData.parts)) {
    auditData.parts.forEach((part: any) => {
      if (part.items && Array.isArray(part.items)) {
        const checklistSection = {
          title: part.title || `Part ${part.id}`,
          type: 'checklist' as const,
          content: part.items.map((item: any) => ({
            id: item.id,
            question: item.question,
            response: item.response || 'Not Answered',
            remark: item.remark || 'No remarks',
            evidenceImages: item.evidenceImages || [],
            hasEvidence: (item.evidenceImages && item.evidenceImages.length > 0)
          }))
        };
        sections.push(checklistSection);
      }
    });
  }

  const content: PDFContent = {
    header: {
      title: 'ISO 9001:2015 Compliance Audit Report',
      subtitle: 'Quality Management System Audit',
      date: auditData.auditDate || new Date().toLocaleDateString('en-GB')
    },
    sections,
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

/**
 * Get compliance document information based on material type and company
 */
function getComplianceDocumentInfo(materialType: string, company: string) {
  const normalizedMaterial = (materialType || '').toLowerCase();
  const normalizedCompany = (company || 'EHI').toUpperCase();
  
  // Document number mapping for different material types
  let docCode = '';
  if (normalizedMaterial.includes('dyed') || normalizedMaterial === 'dyed') {
    docCode = 'IDY';
  } else if (normalizedMaterial.includes('undyed') || normalizedMaterial === 'undyed') {
    docCode = 'IUnDY';
  } else if (normalizedMaterial.includes('cotton') || normalizedMaterial === 'cotton') {
    docCode = 'IUNC';
  } else if (normalizedMaterial.includes('wool') || normalizedMaterial === 'wool') {
    docCode = 'IWL';
  } else {
    // Default to dyed if unclear
    docCode = 'IDY';
  }
  
  const documentNumber = `${normalizedCompany}/IR/${docCode}`;
  const issueNumber = '01';
  const revisionNumber = normalizedCompany === 'EHI' ? '02' : '00';
  const revisionDate = '23-07-2025';
  
  return {
    documentNumber,
    issueNumber,
    revisionNumber,
    revisionDate
  };
}

export default masterPDFGenerator;