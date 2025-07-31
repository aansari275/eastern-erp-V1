import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { Camera, Upload, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
// Logo will be loaded dynamically in PDF generation

interface AuditPoint {
  id: string;
  question: string;
  response: 'Yes' | 'No' | 'NA' | '';
  remark: string;
  evidence: string | null;
}

interface AuditPart {
  id: string;
  title: string;
  points: AuditPoint[];
}

const ComplianceAudit: React.FC = () => {
  const { toast } = useToast();
  
  const [auditData, setAuditData] = useState<{
    auditDate: string;
    auditorName: string;
    company: 'EHI' | 'EMPL';
    parts: AuditPart[];
  }>({
    auditDate: new Date().toISOString().split('T')[0],
    auditorName: '',
    company: 'EHI',
    parts: [
      {
        id: 'part1',
        title: 'Design Control (C1–C7)',
        points: [
          { id: 'C1', question: 'Are design and development procedures established?', response: '', remark: '', evidence: null },
          { id: 'C2', question: 'Are design input requirements identified and reviewed?', response: '', remark: '', evidence: null },
          { id: 'C3', question: 'Are design reviews conducted at key stages?', response: '', remark: '', evidence: null },
          { id: 'C4', question: 'Does design output include all necessary production info?', response: '', remark: '', evidence: null },
          { id: 'C5', question: 'Are design changes verified and controlled?', response: '', remark: '', evidence: null },
          { id: 'C6', question: 'Is prototype or pilot testing done before production?', response: '', remark: '', evidence: null },
          { id: 'C7', question: 'Are design personnel competent and qualified?', response: '', remark: '', evidence: null }
        ]
      },
      {
        id: 'part2',
        title: 'Purchasing Control (C8–C12)',
        points: [
          { id: 'C8', question: 'Are suppliers evaluated and approved before ordering?', response: '', remark: '', evidence: null },
          { id: 'C9', question: 'Are materials purchased from approved sources?', response: '', remark: '', evidence: null },
          { id: 'C10', question: 'Are product specs and requirements agreed with suppliers?', response: '', remark: '', evidence: null },
          { id: 'C11', question: 'Is supplier performance monitored and recorded?', response: '', remark: '', evidence: null },
          { id: 'C12', question: 'Is supplier risk assessed to avoid material shortages?', response: '', remark: '', evidence: null }
        ]
      },
      {
        id: 'part3',
        title: 'Storage Management (C13–C17)',
        points: [
          { id: 'C13', question: 'Is inventory recorded for incoming and outgoing goods?', response: '', remark: '', evidence: null },
          { id: 'C14', question: 'Is inventory stored in safe and suitable conditions?', response: '', remark: '', evidence: null },
          { id: 'C15', question: 'Are materials clearly identified and segregated?', response: '', remark: '', evidence: null },
          { id: 'C16', question: 'Is product condition checked regularly in storage?', response: '', remark: '', evidence: null },
          { id: 'C17', question: 'Is inventory managed using FIFO or similar systems?', response: '', remark: '', evidence: null }
        ]
      },
      {
        id: 'part4',
        title: 'Incoming Inspection (C18–C25)',
        points: [
          { id: 'C18', question: 'Is there a separate area for uninspected materials?', response: '', remark: '', evidence: null },
          { id: 'C19', question: 'Are inspection criteria defined for incoming goods?', response: '', remark: '', evidence: null },
          { id: 'C20', question: 'Are inspections conducted and results recorded?', response: '', remark: '', evidence: null },
          { id: 'C21', question: 'Are unverified materials checked via alternate methods?', response: '', remark: '', evidence: null },
          { id: 'C22', question: 'Are customer-designated sources properly controlled?', response: '', remark: '', evidence: null },
          { id: 'C23', question: 'Is inspection status clearly marked on materials?', response: '', remark: '', evidence: null },
          { id: 'C24', question: 'Are rejected materials properly handled and recorded?', response: '', remark: '', evidence: null },
          { id: 'C25', question: 'Are inspection results analyzed for supplier evaluation?', response: '', remark: '', evidence: null }
        ]
      },
      {
        id: 'part5',
        title: 'Production Control (C26–C45)',
        points: [
          { id: 'C26', question: 'Are manufacturing inputs reviewed and documented?', response: '', remark: '', evidence: null },
          { id: 'C27', question: 'Are outputs expressed in specs and drawings?', response: '', remark: '', evidence: null },
          { id: 'C28', question: 'Is there a control plan for production?', response: '', remark: '', evidence: null },
          { id: 'C29', question: 'Are QC staff and work instructions in place?', response: '', remark: '', evidence: null },
          { id: 'C30', question: 'Are materials defined via BOM or similar?', response: '', remark: '', evidence: null },
          { id: 'C31', question: 'Is production scheduled based on capacity and orders?', response: '', remark: '', evidence: null },
          { id: 'C32', question: 'Are products traceable and batch-controlled?', response: '', remark: '', evidence: null },
          { id: 'C33', question: 'Are rejected items isolated and rechecked?', response: '', remark: '', evidence: null },
          { id: 'C34', question: 'Are defects and trends analyzed?', response: '', remark: '', evidence: null },
          { id: 'C35', question: 'Are new tools evaluated before use?', response: '', remark: '', evidence: null },
          { id: 'C36', question: 'Are process parameters monitored and recorded?', response: '', remark: '', evidence: null },
          { id: 'C37', question: 'Can QC stop production for quality issues?', response: '', remark: '', evidence: null },
          { id: 'C38', question: 'Is equipment maintenance planned and recorded?', response: '', remark: '', evidence: null },
          { id: 'C39', question: 'Are handling and transport methods suitable?', response: '', remark: '', evidence: null },
          { id: 'C40', question: 'Are packing and packaging requirements defined?', response: '', remark: '', evidence: null },
          { id: 'C41', question: 'Is the production flow chart available and clear?', response: '', remark: '', evidence: null },
          { id: 'C42', question: 'Are outsourced processes identified?', response: '', remark: '', evidence: null },
          { id: 'C43', question: 'Does the factory have relevant production experience?', response: '', remark: '', evidence: null },
          { id: 'C44', question: 'Are workers skilled and observed during audit?', response: '', remark: '', evidence: null },
          { id: 'C45', question: 'Are machines and facilities adequate for production?', response: '', remark: '', evidence: null }
        ]
      },
      {
        id: 'part6',
        title: 'Final Product Inspection & Testing (C46–C53)',
        points: [
          { id: 'C46', question: 'Are customer specs available for QC?', response: '', remark: '', evidence: null },
          { id: 'C47', question: 'Are final inspection criteria defined?', response: '', remark: '', evidence: null },
          { id: 'C48', question: 'Are final inspections conducted and recorded?', response: '', remark: '', evidence: null },
          { id: 'C49', question: 'Are appearance checks done with proper tools?', response: '', remark: '', evidence: null },
          { id: 'C50', question: 'Are safety and functionality checks performed?', response: '', remark: '', evidence: null },
          { id: 'C51', question: 'Are rejected lots isolated and handled properly?', response: '', remark: '', evidence: null },
          { id: 'C52', question: 'Are causes of rejects investigated and improved?', response: '', remark: '', evidence: null },
          { id: 'C53', question: 'Is ongoing reliability testing conducted?', response: '', remark: '', evidence: null }
        ]
      },
      {
        id: 'part7',
        title: 'Measuring & Testing Equipment (C54–C58)',
        points: [
          { id: 'C54', question: 'Is life/reliability testing equipment available?', response: '', remark: '', evidence: null },
          { id: 'C55', question: 'Are gauges and tools maintained and protected?', response: '', remark: '', evidence: null },
          { id: 'C56', question: 'Is equipment calibrated regularly?', response: '', remark: '', evidence: null },
          { id: 'C57', question: 'Are display devices checked frequently?', response: '', remark: '', evidence: null },
          { id: 'C58', question: 'Is equipment condition verified with fault simulation?', response: '', remark: '', evidence: null }
        ]
      },
      {
        id: 'part8',
        title: 'Resource Management (C59–C63)',
        points: [
          { id: 'C59', question: 'Is infrastructure adequate and layout optimized?', response: '', remark: '', evidence: null },
          { id: 'C60', question: 'Is the factory clean and well-maintained?', response: '', remark: '', evidence: null },
          { id: 'C61', question: 'Are training needs identified and addressed?', response: '', remark: '', evidence: null },
          { id: 'C62', question: 'Are employees motivated for quality and innovation?', response: '', remark: '', evidence: null },
          { id: 'C63', question: 'Are contingency plans in place', response: '', remark: '', evidence: null }
        ]
      },
      {
        id: 'part9',
        title: 'Social & Environmental Responsibility (C74–C83)',
        points: [
          { id: 'C74', question: 'Are working conditions (air, light, cleanliness) acceptable?', response: '', remark: '', evidence: null },
          { id: 'C75', question: 'Are all workers above the legal working age?', response: '', remark: '', evidence: null },
          { id: 'C76', question: 'Do working hours comply with labor laws?', response: '', remark: '', evidence: null },
          { id: 'C77', question: 'Do workers get at least one day off per week?', response: '', remark: '', evidence: null },
          { id: 'C78', question: 'Are workers employed voluntarily?', response: '', remark: '', evidence: null },
          { id: 'C79', question: 'Are wages equal to or above legal minimum?', response: '', remark: '', evidence: null },
          { id: 'C80', question: 'Do women have equal rights and protections?', response: '', remark: '', evidence: null },
          { id: 'C81', question: 'Are workers treated respectfully without abuse?', response: '', remark: '', evidence: null },
          { id: 'C82', question: 'Is the fire protection system adequate and functional?', response: '', remark: '', evidence: null },
          { id: 'C83', question: 'Are fire and evacuation drills conducted regularly?', response: '', remark: '', evidence: null }
        ]
      },
      {
        id: 'part10',
        title: 'Health & Safety (C84–C93)',
        points: [
          { id: 'C84', question: 'Are buildings in good physical condition?', response: '', remark: '', evidence: null },
          { id: 'C85', question: 'Are machine guards installed for safety?', response: '', remark: '', evidence: null },
          { id: 'C86', question: 'Are special equipment registered and inspected?', response: '', remark: '', evidence: null },
          { id: 'C87', question: 'Are safety instructions about clothing/jewelry followed?', response: '', remark: '', evidence: null },
          { id: 'C88', question: 'Is PPE provided and in good condition?', response: '', remark: '', evidence: null },
          { id: 'C89', question: 'Are PPE signs posted in required areas?', response: '', remark: '', evidence: null },
          { id: 'C90', question: 'Do workers follow safety instructions and use PPE?', response: '', remark: '', evidence: null },
          { id: 'C91', question: 'Is dormitory separate from production areas?', response: '', remark: '', evidence: null },
          { id: 'C92', question: 'Is a valid restaurant license available if required?', response: '', remark: '', evidence: null },
          { id: 'C93', question: 'Is medical service (e.g., first aid) available for workers?', response: '', remark: '', evidence: null }
        ]
      }
    ]
  });

  const updatePointResponse = (partId: string, pointId: string, field: 'response' | 'remark', value: string) => {
    setAuditData(prev => ({
      ...prev,
      parts: prev.parts.map(part =>
        part.id === partId
          ? {
              ...part,
              points: part.points.map(point =>
                point.id === pointId ? { ...point, [field]: value } : point
              )
            }
          : part
      )
    }));
  };

  const handleEvidenceUpload = (partId: string, pointId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setAuditData(prev => ({
        ...prev,
        parts: prev.parts.map(part =>
          part.id === partId
            ? {
                ...part,
                points: part.points.map(point =>
                  point.id === pointId ? { ...point, evidence: base64String } : point
                )
              }
            : part
        )
      }));
      
      toast({
        title: "Evidence Uploaded",
        description: `Evidence uploaded for ${pointId}`,
      });
    };
    reader.readAsDataURL(file);
  };

  const calculateComplianceScore = () => {
    const allPoints = auditData.parts.flatMap(part => part.points);
    const answeredPoints = allPoints.filter(point => point.response !== '');
    const yesResponses = allPoints.filter(point => point.response === 'Yes');
    
    if (answeredPoints.length === 0) return 0;
    return Math.round((yesResponses.length / answeredPoints.length) * 100);
  };

  const generateCompliancePDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 40;

    // Add Eastern logo at top left
    try {
      const logoImg = new Image();
      logoImg.src = '/eastern-logo-main.png';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });
      
      // Add logo to PDF (positioned at top-left)
      doc.addImage(logoImg, 'PNG', 10, 10, 40, 15);
    } catch (error) {
      console.warn('Could not load logo for PDF, using text fallback:', error);
      // Fallback to text if image fails
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('EASTERN MILLS', 10, 20);
    }

    // Company name
    const companyFullName = auditData.company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.';
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.text(companyFullName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Report title
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('Internal Technical Audit Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    // ISO standard
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text('As per clause ISO9001:2015', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Audit information
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.text(`Audit Date: ${auditData.auditDate}`, 20, yPos);
    doc.text(`Auditor: ${auditData.auditorName}`, 120, yPos);
    yPos += 6;
    
    const complianceScore = calculateComplianceScore();
    doc.text(`Compliance Score: ${complianceScore}%`, 20, yPos);
    yPos += 15;

    // Add audit results by part
    auditData.parts.forEach(part => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Part header
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.text(`${part.title}`, 20, yPos);
      yPos += 8;

      part.points.forEach(point => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(9);
        doc.setFont('times', 'normal');
        
        // Question
        const questionLines = doc.splitTextToSize(`${point.id}: ${point.question}`, 120);
        doc.text(questionLines, 25, yPos);
        
        // Response
        const responseColor = point.response === 'Yes' ? [0, 128, 0] : point.response === 'No' ? [255, 0, 0] : [128, 128, 128];
        doc.setTextColor(...responseColor);
        doc.text(`${point.response || 'Not Answered'}`, 150, yPos);
        doc.setTextColor(0, 0, 0);
        
        yPos += questionLines.length * 4;
        
        // Remark if provided
        if (point.remark) {
          doc.setFontSize(8);
          doc.setFont('times', 'italic');
          const remarkLines = doc.splitTextToSize(`Remark: ${point.remark}`, 160);
          doc.text(remarkLines, 30, yPos);
          yPos += remarkLines.length * 3;
        }
        
        // Add evidence image if available
        if (point.evidence && point.evidence.startsWith('data:image/')) {
          try {
            // Check if we need a new page for the image
            if (yPos > 220) {
              doc.addPage();
              yPos = 20;
            }
            
            doc.setFontSize(8);
            doc.setFont('times', 'normal');
            doc.text('Evidence:', 30, yPos);
            yPos += 5;
            
            // Add evidence image with good quality
            const imgWidth = 60; // Good size for readability
            const imgHeight = 45; // Maintain aspect ratio
            
            doc.addImage(point.evidence, 'JPEG', 30, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 5;
          } catch (imgError) {
            console.warn('Failed to add evidence image:', imgError);
            doc.setFontSize(8);
            doc.text('Evidence: [Image could not be displayed]', 30, yPos);
            yPos += 4;
          }
        }
        
        yPos += 2;
      });
      
      yPos += 5;
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY, { align: 'center' });

    return doc;
  };

  const handleGenerateReport = async () => {
    if (!auditData.auditorName.trim()) {
      toast({
        title: "Missing Information", 
        description: "Please enter auditor name before generating report",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdf = await generateCompliancePDF();
      const filename = `ISO9001_Audit_${auditData.company}_${auditData.auditDate.replace(/-/g, '')}.pdf`;
      pdf.save(filename);
      
      toast({
        title: "Audit Report Generated",
        description: "ISO 9001:2015 compliance audit report with evidence images has been generated successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Error",
        description: "Failed to generate audit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ISO 9001:2015 Compliance Audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="auditDate">Audit Date</Label>
              <Input
                id="auditDate"
                type="date"
                value={auditData.auditDate}
                onChange={(e) => setAuditData(prev => ({ ...prev, auditDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="auditorName">Auditor Name</Label>
              <Input
                id="auditorName"
                value={auditData.auditorName}
                onChange={(e) => setAuditData(prev => ({ ...prev, auditorName: e.target.value }))}
                placeholder="Enter auditor name"
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Select
                value={auditData.company}
                onValueChange={(value: 'EHI' | 'EMPL') => setAuditData(prev => ({ ...prev, company: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EHI">Eastern Home Industries (EHI)</SelectItem>
                  <SelectItem value="EMPL">Eastern Mills Pvt. Ltd. (EMPL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Compliance Score: <span className="font-bold text-lg">{calculateComplianceScore()}%</span>
            </div>
            <Button onClick={handleGenerateReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Generate Audit Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Checklist */}
      <Tabs defaultValue="part1" className="space-y-4">
        <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-1 h-auto p-1">
          {auditData.parts.map((part, index) => (
            <TabsTrigger
              key={part.id}
              value={part.id}
              className="text-xs px-2 py-1 min-h-[32px]"
            >
              Part {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {auditData.parts.map((part) => (
          <TabsContent key={part.id} value={part.id}>
            <Card>
              <CardHeader>
                <CardTitle>{part.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {part.points.map((point) => (
                    <div key={point.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <Label className="text-sm font-medium">{point.id}</Label>
                          <p className="text-sm text-gray-700 mt-1">{point.question}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant={point.response === 'Yes' ? 'default' : 'outline'}
                              size="sm"
                              className={`px-3 h-7 text-xs ${point.response === 'Yes' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}`}
                              onClick={() => updatePointResponse(part.id, point.id, 'response', 'Yes')}
                            >
                              Yes
                            </Button>
                            <Button
                              type="button"
                              variant={point.response === 'No' ? 'default' : 'outline'}
                              size="sm"
                              className={`px-3 h-7 text-xs ${point.response === 'No' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50'}`}
                              onClick={() => updatePointResponse(part.id, point.id, 'response', 'No')}
                            >
                              No
                            </Button>
                            <Button
                              type="button"
                              variant={point.response === 'NA' ? 'default' : 'outline'}
                              size="sm"
                              className={`px-3 h-7 text-xs ${point.response === 'NA' ? 'bg-gray-600 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                              onClick={() => updatePointResponse(part.id, point.id, 'response', 'NA')}
                            >
                              N/A
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`remark-${point.id}`} className="text-sm">Remark</Label>
                          <Textarea
                            id={`remark-${point.id}`}
                            value={point.remark}
                            onChange={(e) => updatePointResponse(part.id, point.id, 'remark', e.target.value)}
                            placeholder="Add remarks..."
                            className="h-20"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Evidence</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="file"
                              accept="image/*,.pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleEvidenceUpload(part.id, point.id, file);
                                }
                              }}
                              className="hidden"
                              id={`evidence-${point.id}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`evidence-${point.id}`)?.click()}
                              className="flex items-center gap-1"
                            >
                              <Upload className="h-3 w-3" />
                              Upload
                            </Button>
                            {point.evidence && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-green-600">✓ Evidence uploaded</span>
                                <div className="w-12 h-12 border border-green-200 rounded overflow-hidden">
                                  <img 
                                    src={point.evidence} 
                                    alt="Evidence thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Save and Proceed Button */}
                <div className="flex justify-center pt-6 border-t">
                  <Button
                    onClick={() => {
                      // Save current part's data
                      const completedQuestions = part.points.filter(p => p.response !== '').length;
                      toast({
                        title: "Progress Saved",
                        description: `${completedQuestions} of ${part.points.length} questions completed for ${part.title}`,
                      });
                      
                      // Check if this is the last part (Part 10)
                      const currentIndex = auditData.parts.findIndex(p => p.id === part.id);
                      const isLastPart = currentIndex === auditData.parts.length - 1;
                      
                      if (isLastPart) {
                        // This is the final part - submit the report
                        handleGenerateReport();
                      } else {
                        // Auto-proceed to next part if available
                        const nextPart = auditData.parts[currentIndex + 1];
                        if (nextPart) {
                          // Find the tabs trigger for the next part and click it
                          const nextTab = document.querySelector(`[data-state="inactive"][value="${nextPart.id}"]`) as HTMLElement;
                          if (nextTab) {
                            nextTab.click();
                          }
                        }
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  >
                    {auditData.parts.findIndex(p => p.id === part.id) === auditData.parts.length - 1 
                      ? "Submit Report" 
                      : "Save & Proceed to Next Part"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ComplianceAudit;