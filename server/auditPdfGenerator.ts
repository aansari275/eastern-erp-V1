import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { adminDb } from './firestoreHelpers';
import path from 'path';
import fs from 'fs/promises';
import { generateComplianceAuditPDFFallback } from './pdfFallback';

interface AuditData {
  id: string;
  auditorInfo: {
    auditorName: string;
    auditDate: string;
    company: 'EHI' | 'EMPL';
    location: string;
    auditScope: string;
  };
  checklist: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      question: string;
      response: 'Yes' | 'No' | 'NA' | '';
      remark: string;
      evidence?: any;
      evidenceUrl?: string;
    }>;
  }>;
  scoreData: {
    totalItems: number;
    yesCount: number;
    noCount: number;
    naCount: number;
    applicableItems: number;
    score: number;
  };
  generatedDate: string;
  reportNumber?: string;
  factoryInfo?: {
    managingDirector: string;
    salesManager: string;
    qaManager: string;
    technicalManager: string;
    factoryManager: string;
    establishmentDate: string;
    totalSpace: string;
    productRanges: string;
    exportPercentage: string;
    totalEmployees: string;
    productionCapacity: string;
    leadTime: string;
  };
}

interface PDFGenerationResult {
  success: boolean;
  pdfUrl?: string;
  downloadUrl?: string;
  error?: string;
}

// Helper to register Handlebars helpers
const registerHandlebarsHelpers = () => {
  Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
  Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
  Handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
  Handlebars.registerHelper('add', (a: number, b: number) => a + b);
  Handlebars.registerHelper('multiply', (a: number, b: number) => a * b);
  Handlebars.registerHelper('formatDate', (date: string) => {
    return new Date(date).toLocaleDateString('en-GB');
  });
  Handlebars.registerHelper('formatScore', (score: number) => {
    return score.toFixed(1);
  });
  Handlebars.registerHelper('getScoreClass', (score: number) => {
    if (score >= 90) return 'outstanding';
    if (score >= 70) return 'satisfactory';
    if (score >= 50) return 'needs-improvement';
    return 'unsatisfactory';
  });
  Handlebars.registerHelper('getScoreLabel', (score: number) => {
    if (score >= 90) return 'Outstanding';
    if (score >= 70) return 'Satisfactory';
    if (score >= 50) return 'Needs Improvement';
    return 'Unsatisfactory';
  });
  Handlebars.registerHelper('getOverallResult', (score: number) => {
    return score >= 70 ? 'PASS' : 'FAIL';
  });
};

// Generate unique report number
const generateReportNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `EHI-${year}${month}${day}-${timestamp}`;
};

// HTML template for the audit report
const getAuditReportTemplate = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eastern Home Industries - Extensive Factory Audit Report</title>
    <style>
        @page {
            size: A4;
            margin: 15mm 20mm 20mm 20mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: "Arial", sans-serif;
            font-size: 10px;
            line-height: 1.3;
            color: #333;
            background: white;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        
        .header h1 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .header .report-info {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-top: 5px;
        }
        
        .company-name {
            font-size: 14px;
            font-weight: bold;
            margin: 5px 0;
        }
        
        .logo-section {
            float: right;
            width: 120px;
            height: 60px;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #666;
            margin-left: 10px;
        }
        
        .general-info {
            display: flex;
            margin: 20px 0;
        }
        
        .info-left {
            flex: 2;
            padding-right: 20px;
        }
        
        .info-right {
            flex: 1;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 8px;
            border-bottom: 1px solid #eee;
            padding-bottom: 3px;
        }
        
        .info-label {
            font-weight: bold;
            min-width: 140px;
            flex-shrink: 0;
        }
        
        .info-value {
            flex: 1;
            padding-left: 10px;
        }
        
        .factory-view {
            border: 1px solid #ccc;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 8px;
        }
        
        .audit-conclusion {
            margin: 20px 0;
        }
        
        .conclusion-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .conclusion-table th,
        .conclusion-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }
        
        .conclusion-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        
        .overall-result {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
            padding: 10px;
            border: 2px solid #000;
        }
        
        .overall-result.pass {
            background-color: #d4edda;
            color: #155724;
        }
        
        .overall-result.fail {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .findings-summary {
            margin: 20px 0;
        }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .summary-table th,
        .summary-table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
            font-size: 9px;
        }
        
        .summary-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        
        .score-indicators {
            display: flex;
            justify-content: center;
            margin-top: 15px;
            gap: 20px;
        }
        
        .score-box {
            padding: 5px 10px;
            border: 1px solid #000;
            text-align: center;
            font-size: 8px;
        }
        
        .score-box.selected {
            background-color: #000;
            color: white;
        }
        
        .section {
            margin: 20px 0;
        }
        
        .section-title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #000;
        }
        
        .qa-item {
            margin-bottom: 15px;
            border: 1px solid #ddd;
            padding: 10px;
            background-color: #fafafa;
        }
        
        .qa-question {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .qa-response {
            margin: 5px 0;
        }
        
        .qa-response .label {
            font-weight: bold;
            display: inline-block;
            min-width: 60px;
        }
        
        .qa-remark {
            margin-top: 5px;
            font-style: italic;
            color: #666;
        }
        
        .evidence-section {
            margin-top: 10px;
            padding: 5px;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
        }
        
        .evidence-placeholder {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 8px;
            border: 1px dashed #999;
        }
        
        .footer {
            position: fixed;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            text-align: center;
            font-size: 8px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 5px;
        }
        
        .auditor-signature {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
        }
        
        .signature-box {
            width: 200px;
            text-align: center;
        }
        
        .signature-line {
            border-bottom: 1px solid #000;
            height: 30px;
            margin-bottom: 5px;
        }
        
        .clear {
            clear: both;
        }
        
        .evidence-section {
            margin-top: 10px;
            padding: 5px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        
        .evidence-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 5px;
        }
        
        .evidence-item {
            flex: 0 0 auto;
        }
        
        .evidence-item img {
            display: block;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <!-- Page 1: Cover Page -->
    <div class="header">
        <h1>Extensive Factory Audit Report</h1>
        <div class="report-info">
            <span>REPORT NO: {{reportNumber}}</span>
            <span>PAGE 1 OF {{totalPages}}</span>
        </div>
        <div class="company-name">EASTERN HOME INDUSTRIES</div>
    </div>

    <div style="text-align: center; margin: 40px 0;">
        <h2 style="font-size: 18px;">EXTENSIVE FACTORY AUDIT REPORT</h2>
    </div>

    <div class="general-info">
        <div class="info-left">
            <h3 style="margin-bottom: 15px;">GENERAL INFORMATION</h3>
            
            <div class="info-row">
                <span class="info-label">Report #</span>
                <span class="info-value">{{reportNumber}}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Audit Type</span>
                <span class="info-value">Internal Compliance Audit</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Supplier/Vendor Name</span>
                <span class="info-value">EASTERN HOME INDUSTRIES</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Audited Factory Name</span>
                <span class="info-value">EASTERN HOME INDUSTRIES</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Factory Address</span>
                <span class="info-value">PLOT NO. 1242, RAYAN, SURIYAWAN ROAD, BHADOHI, SANT RAVI DAS NAGAR (U.P.) -221401</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Item Description</span>
                <span class="info-value">{{#if factoryInfo.productRanges}}{{factoryInfo.productRanges}}{{else}}Knotted, Punja, Flat Woven, Tufted Handloom, Machine Made{{/if}}</span>
            </div>
        </div>
        
        <div class="info-right">
            <h3 style="margin-bottom: 15px;">FACTORY VIEW</h3>
            <div class="factory-view">
                [Factory Image Placeholder]
            </div>
        </div>
    </div>

    <div class="clear"></div>

    <div class="audit-conclusion">
        <h3>AUDIT CONCLUSION</h3>
        
        <table class="conclusion-table">
            <thead>
                <tr>
                    <th>Audit Section</th>
                    <th>Result</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>A - Factory Profile and Info.</td>
                    <td>Complete</td>
                    <td>{{auditorInfo.location}}</td>
                </tr>
                <tr>
                    <td>B - Documents & Certificates Verification</td>
                    <td>{{#if (gte scoreData.score 70)}}Conformed{{else}}Not Conformed{{/if}}</td>
                    <td>{{auditorInfo.auditScope}}</td>
                </tr>
                <tr>
                    <td>C - Management System Evaluation</td>
                    <td>{{#if (gte scoreData.score 70)}}Conformed{{else}}Not Conformed{{/if}}</td>
                    <td>Score: {{formatScore scoreData.score}}%</td>
                </tr>
            </tbody>
        </table>
        
        <div class="overall-result {{#if (gte scoreData.score 70)}}pass{{else}}fail{{/if}}">
            OVERALL RESULT: {{getOverallResult scoreData.score}}
        </div>
    </div>

    <div class="auditor-signature">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div>Auditor: {{auditorInfo.auditorName}}</div>
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <div>Audit Date: {{formatDate auditorInfo.auditDate}}</div>
        </div>
    </div>

    <!-- Page 2: Summary -->
    <div class="page-break">
        <div class="header">
            <h1>Extensive Factory Audit Report</h1>
            <div class="report-info">
                <span>REPORT NO: {{reportNumber}}</span>
                <span>PAGE 2 OF {{totalPages}}</span>
            </div>
            <div class="company-name">EASTERN HOME INDUSTRIES</div>
        </div>

        <div class="findings-summary">
            <h3>AUDIT FINDINGS SUMMARY</h3>
            
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Section Description</th>
                        <th>Achieved/Maximum</th>
                        <th>Weight</th>
                        <th>Weighted Score</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each checklist}}
                    <tr>
                        <td>{{id}}</td>
                        <td>{{title}}</td>
                        <td>{{#with (getSectionScore items)}}{{passed}}/{{total}}{{/with}}</td>
                        <td>{{getSectionWeight @index ../checklist.length}}%</td>
                        <td>{{getSectionWeightedScore items @index ../checklist.length}}</td>
                    </tr>
                    {{/each}}
                </tbody>
                <tfoot>
                    <tr style="font-weight: bold; background-color: #f0f0f0;">
                        <td colspan="2">Total:</td>
                        <td>{{scoreData.yesCount}}/{{scoreData.applicableItems}}</td>
                        <td>100%</td>
                        <td>{{formatScore scoreData.score}}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="score-indicators">
                <div class="score-box {{#if (lt scoreData.score 50)}}selected{{/if}}">
                    ☐ Unsatisfactory<br>(&lt;50%)
                </div>
                <div class="score-box {{#if (and (gte scoreData.score 50) (lt scoreData.score 70))}}selected{{/if}}">
                    ☐ Needs Improvement<br>(50%-70%)
                </div>
                <div class="score-box {{#if (and (gte scoreData.score 70) (lt scoreData.score 90))}}selected{{/if}}">
                    ☐ Satisfactory<br>(70%-90%)
                </div>
                <div class="score-box {{#if (gte scoreData.score 90)}}selected{{/if}}">
                    ☒ Outstanding<br>(&gt;90%)
                </div>
            </div>
        </div>
    </div>

    <!-- Pages 3+: Detailed Sections -->
    {{#each checklist}}
    <div class="page-break">
        <div class="header">
            <h1>Extensive Factory Audit Report</h1>
            <div class="report-info">
                <span>REPORT NO: {{../reportNumber}}</span>
                <span>PAGE {{add @index 3}} OF {{../totalPages}}</span>
            </div>
            <div class="company-name">EASTERN HOME INDUSTRIES</div>
        </div>

        <div class="section">
            <div class="section-title">{{id}} — {{title}}</div>
            
            {{#each items}}
            <div class="qa-item">
                <div class="qa-question">{{id}}. {{question}}</div>
                
                <div class="qa-response">
                    <span class="label">Response:</span>
                    <strong>{{#if response}}{{response}}{{else}}Pending{{/if}}</strong>
                </div>
                
                {{#if remark}}
                <div class="qa-remark">
                    <strong>Remarks:</strong> {{remark}}
                </div>
                {{/if}}
                
                {{#if evidenceImages}}
                <div class="evidence-section">
                    <strong>Evidence Images:</strong>
                    <div class="evidence-grid">
                        {{#each evidenceImages}}
                        <div class="evidence-item">
                            <img src="{{this}}" alt="Evidence Image {{@index}}" style="max-width: 150px; max-height: 100px; border: 1px solid #ccc; margin: 5px;" />
                        </div>
                        {{/each}}
                    </div>
                </div>
                {{/if}}
            </div>
            {{/each}}
        </div>
    </div>
    {{/each}}

    <div class="footer">
        Eastern Home Industries - Internal Compliance Audit Report | {{formatDate generatedDate}} | Confidential Document
    </div>
</body>
</html>
`;

// Register additional Handlebars helpers for section scoring
const registerSectionHelpers = () => {
  Handlebars.registerHelper('getSectionScore', (items: any[]) => {
    const total = items.length;
    const passed = items.filter(item => item.response === 'Yes').length;
    return { total, passed };
  });

  Handlebars.registerHelper('getSectionWeight', (index: number, totalSections: number) => {
    // Distribute weights evenly
    return Math.round(100 / totalSections);
  });

  Handlebars.registerHelper('getSectionWeightedScore', (items: any[], index: number, totalSections: number) => {
    const weight = Math.round(100 / totalSections) / 100;
    const passed = items.filter(item => item.response === 'Yes').length;
    const total = items.length;
    const score = total > 0 ? (passed / total) * 100 : 0;
    return (score * weight).toFixed(2);
  });

  Handlebars.registerHelper('and', (a: any, b: any) => a && b);
  Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
};

export class AuditPDFGenerator {
  constructor() {
    registerHandlebarsHelpers();
    registerSectionHelpers();
  }

  /**
   * Convert ComplianceAudit format to AuditData format expected by PDF generator
   */
  private convertComplianceAuditToAuditData(rawData: any, auditId: string): AuditData {
    // Convert parts array to checklist array format - create sample data if parts are missing
    let checklist = [];
    
    if (rawData.parts && Array.isArray(rawData.parts)) {
      checklist = rawData.parts.map((part: any, index: number) => ({
        id: part.id || `part-${index}`,
        title: part.title || `Part ${index + 1}`,
        items: (part.items || []).map((item: any) => ({
          id: item.id,
          question: item.question,
          response: item.response || '',
          remark: item.remark || '',
          evidenceImages: item.evidenceImages || [],
          evidence: item.evidenceImages?.[0] || null,
          evidenceUrl: item.evidenceImages?.[0] || null
        }))
      }));
    } else {
      // Create a basic audit structure for minimal PDF generation
      console.log('⚠️ No parts data found, creating minimal audit structure');
      checklist = [
        {
          id: 'summary',
          title: 'Audit Summary',
          items: [
            {
              id: 'audit-completed',
              question: 'Compliance audit completed',
              response: rawData.status === 'submitted' ? 'Yes' : 'No',
              remark: 'Basic audit completion status',
              evidence: null,
              evidenceUrl: null
            }
          ]
        }
      ];
    }

    // Calculate score data
    const scoreData = rawData.scoreData || this.calculateScoreData(checklist);

    return {
      id: auditId,
      auditorInfo: {
        auditorName: rawData.auditorName || 'Quality Auditor',
        auditDate: rawData.auditDate || new Date().toISOString().split('T')[0],
        company: rawData.company || 'EHI',
        location: rawData.location || 'Main Factory',
        auditScope: rawData.auditScope || 'ISO 9001:2015 Compliance Audit'
      },
      checklist,
      scoreData,
      generatedDate: new Date().toISOString(),
      reportNumber: rawData.reportNumber || generateReportNumber()
    };
  }

  /**
   * Calculate score data from checklist items
   */
  private calculateScoreData(checklist: any[]): any {
    let totalItems = 0;
    let yesCount = 0;
    let noCount = 0;
    let naCount = 0;

    checklist.forEach(section => {
      section.items.forEach((item: any) => {
        totalItems++;
        switch (item.response) {
          case 'Yes':
            yesCount++;
            break;
          case 'No':
            noCount++;
            break;
          case 'NA':
            naCount++;
            break;
        }
      });
    });

    const applicableItems = totalItems - naCount;
    const score = applicableItems > 0 ? (yesCount / applicableItems) * 100 : 0;

    return {
      totalItems,
      yesCount,
      noCount,
      naCount,
      applicableItems,
      score: Math.round(score * 10) / 10
    };
  }

  /**
   * Generate audit PDF from Firestore data
   */
  async generateAuditPDF(auditId: string): Promise<PDFGenerationResult> {
    try {
      console.log(`🔍 Looking for audit document with ID: ${auditId}`);
      
      // Fetch audit data from Firestore using admin SDK
      const auditDoc = await adminDb.collection('complianceAudits').doc(auditId).get();
      
      console.log(`📄 Document exists: ${auditDoc.exists}`);
      
      if (!auditDoc.exists) {
        // Try to list some documents to debug
        const snapshot = await adminDb.collection('complianceAudits').limit(5).get();
        console.log(`📋 Found ${snapshot.docs.length} documents in complianceAudits collection`);
        snapshot.docs.forEach(doc => {
          console.log(`  - Document ID: ${doc.id}`);
        });
        
        return {
          success: false,
          error: `Audit document not found. ID: ${auditId}`
        };
      }

      const rawData = auditDoc.data();
      console.log(`🔧 Raw audit data keys:`, Object.keys(rawData || {}));
      console.log(`🔧 Raw audit data sample:`, JSON.stringify(rawData, null, 2).substring(0, 500));
      
      // Convert the ComplianceAudit format to AuditData format expected by PDF generator
      const auditData = this.convertComplianceAuditToAuditData(rawData, auditId);
      console.log(`🔧 Converted audit data keys:`, Object.keys(auditData || {}));
      console.log(`🔧 Checklist length:`, auditData.checklist?.length || 0);
      
      // Add report number if not present
      if (!auditData.reportNumber) {
        auditData.reportNumber = generateReportNumber();
      }

      // Calculate total pages (cover + summary + sections)
      const totalPages = 2 + (auditData.checklist?.length || 0);
      
      // Prepare template data
      const templateData = {
        ...auditData,
        totalPages,
        generatedDate: new Date().toISOString()
      };

      console.log('🎯 Using Master PDF Generator with LATO font support...');
      
      // Use master PDF generator with Puppeteer + fallback
      const { generateComplianceAuditPDF } = await import('./pdfMaster');
      let pdfBuffer: Buffer;
      try {
        pdfBuffer = await generateComplianceAuditPDF(templateData);
      } catch (pdfError) {
        console.error('Master PDF generation failed:', pdfError);
        throw new Error(`PDF generation failed: ${pdfError.message}`);
      }
      
      // Save to local uploads directory
      const fileName = `audit-reports-${auditData.reportNumber || auditId}-${Date.now()}.pdf`;
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      // Ensure uploads directory exists
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, pdfBuffer);

      // Create download URL (served by Express static middleware)
      const downloadUrl = `/uploads/${fileName}`;

      // Update audit document with PDF info using admin SDK
      await adminDb.collection('complianceAudits').doc(auditId).update({
        pdfGenerated: true,
        pdfUrl: downloadUrl,
        pdfGeneratedAt: new Date(),
        reportNumber: auditData.reportNumber
      });

      return {
        success: true,
        pdfUrl: downloadUrl,
        downloadUrl
      };

    } catch (error) {
      console.error('Error generating audit PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate PDF using fallback system (jsPDF) when Puppeteer fails
   */
  private async generatePDFUsingFallback(data: any): Promise<Buffer> {
    try {
      // Convert data to format expected by fallback generator
      const fallbackData = {
        id: data.id,
        auditorName: data.auditorInfo?.auditorName || 'Quality Auditor',
        auditDate: data.auditorInfo?.auditDate || new Date().toISOString().split('T')[0],
        company: data.auditorInfo?.company || 'EHI',
        location: data.auditorInfo?.location || 'Main Factory',
        auditScope: data.auditorInfo?.auditScope || 'ISO 9001:2015 Compliance Audit',
        scoreData: data.scoreData || {
          totalItems: 0,
          yesCount: 0,
          noCount: 0,
          naCount: 0,
          applicableItems: 0,
          score: 0
        },
        checklist: data.checklist || []
      };

      console.log('🔧 Calling fallback PDF generator with data keys:', Object.keys(fallbackData));
      
      // Create a simple PDF using jsPDF directly for reliability
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Quality Compliance Audit Report', 20, 20);
      
      // Add basic audit info
      doc.setFontSize(12);
      let yPos = 40;
      doc.text(`Company: ${fallbackData.company}`, 20, yPos);
      yPos += 10;
      doc.text(`Audit Date: ${fallbackData.auditDate}`, 20, yPos);
      yPos += 10;
      doc.text(`Auditor: ${fallbackData.auditorName}`, 20, yPos);
      yPos += 10;
      doc.text(`Location: ${fallbackData.location}`, 20, yPos);
      yPos += 20;
      
      // Add checklist summary
      doc.text('Audit Summary:', 20, yPos);
      yPos += 10;
      doc.text(`Total Sections: ${fallbackData.checklist.length}`, 20, yPos);
      yPos += 10;
      doc.text(`Status: Completed`, 20, yPos);
      yPos += 20;
      
      // Add sections
      fallbackData.checklist.forEach((section: any, index: number) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text(`${index + 1}. ${section.title}`, 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        section.items.forEach((item: any) => {
          const maxLines = 3;
          const lines = doc.splitTextToSize(item.question, 170);
          const displayLines = lines.slice(0, maxLines);
          
          doc.text(displayLines, 25, yPos);
          yPos += displayLines.length * 4;
          
          doc.text(`Response: ${item.response || 'N/A'}`, 30, yPos);
          yPos += 6;
        });
        yPos += 10;
      });
      
      // Generate buffer
      const pdfOutput = doc.output('arraybuffer');
      const pdfBuffer = Buffer.from(pdfOutput);
      
      console.log('✅ Simple PDF generated successfully, buffer size:', pdfBuffer.length);
      return pdfBuffer;
    } catch (error) {
      console.error('Fallback PDF generation failed:', error);
      throw new Error('Both primary and fallback PDF generation systems failed');
    }
  }

  /**
   * Generate PDF from HTML template using Puppeteer (currently disabled due to dependency issues)
   */
  private async generatePDFFromTemplate(data: any): Promise<Buffer> {
    const template = Handlebars.compile(getAuditReportTemplate());
    const html = template(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /**
   * Get list of previous audit PDFs for a company
   */
  async getPreviousAudits(company: string, limit: number = 10): Promise<any[]> {
    try {
      const auditsRef = adminDb.collection('complianceAudits')
        .where('auditorInfo.company', '==', company)
        .where('pdfGenerated', '==', true)
        .orderBy('auditorInfo.auditDate', 'desc')
        .limit(limit);

      const snapshot = await auditsRef.get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        generatedAt: doc.data().pdfGeneratedAt?.toDate?.() || null
      }));
    } catch (error) {
      console.error('Error fetching previous audits:', error);
      return [];
    }
  }
}

export const auditPDFGenerator = new AuditPDFGenerator();

// Export the generateAuditPDF function directly for easier access
export const generateAuditPDF = (auditId: string) => auditPDFGenerator.generateAuditPDF(auditId);