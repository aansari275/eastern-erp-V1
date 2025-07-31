import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  AlertTriangle, 
  Camera, 
  Trash2, 
  Save,
  Send
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { ComplianceAudit, ChecklistItem } from '../../../shared/schema';
import { uploadEvidenceImage } from '../utils/firebaseStorage';

interface ComplianceAuditFormCleanProps {
  company: 'EHI' | 'EMPL';
  onBack: () => void;
  existingAudit?: ComplianceAudit | null;
}

// Complete 93-item checklist template
const checklistTemplate: ChecklistItem[] = [
  // Design Control (C1-C7)
  { code: "C1", question: "Are design and development procedures established?", remark: "", evidence: [] },
  { code: "C2", question: "Are design input requirements identified and reviewed?", remark: "", evidence: [] },
  { code: "C3", question: "Are design reviews conducted at key stages?", remark: "", evidence: [] },
  { code: "C4", question: "Does design output include all necessary production info?", remark: "", evidence: [] },
  { code: "C5", question: "Are design changes verified and controlled?", remark: "", evidence: [] },
  { code: "C6", question: "Is prototype or pilot testing done before production?", remark: "", evidence: [] },
  { code: "C7", question: "Are design personnel competent and qualified?", remark: "", evidence: [] },
  
  // Purchasing Control (C8-C12)
  { code: "C8", question: "Are suppliers evaluated and approved before ordering?", remark: "", evidence: [] },
  { code: "C9", question: "Are materials purchased from approved sources?", remark: "", evidence: [] },
  { code: "C10", question: "Are product specs and requirements agreed with suppliers?", remark: "", evidence: [] },
  { code: "C11", question: "Is supplier performance monitored and recorded?", remark: "", evidence: [] },
  { code: "C12", question: "Is supplier risk assessed to avoid material shortages?", remark: "", evidence: [] },
  
  // Storage Management (C13-C17)
  { code: "C13", question: "Is inventory recorded for incoming and outgoing goods?", remark: "", evidence: [] },
  { code: "C14", question: "Is inventory stored in safe and suitable conditions?", remark: "", evidence: [] },
  { code: "C15", question: "Are materials clearly identified and segregated?", remark: "", evidence: [] },
  { code: "C16", question: "Is product condition checked regularly in storage?", remark: "", evidence: [] },
  { code: "C17", question: "Is inventory managed using FIFO or similar systems?", remark: "", evidence: [] },
  
  // Incoming Inspection (C18-C25)
  { code: "C18", question: "Is there a separate area for uninspected materials?", remark: "", evidence: [] },
  { code: "C19", question: "Are inspection criteria defined for incoming goods?", remark: "", evidence: [] },
  { code: "C20", question: "Are inspections conducted and results recorded?", remark: "", evidence: [] },
  { code: "C21", question: "Are unverified materials checked via alternate methods?", remark: "", evidence: [] },
  { code: "C22", question: "Are customer-designated sources properly controlled?", remark: "", evidence: [] },
  { code: "C23", question: "Is inspection status clearly marked on materials?", remark: "", evidence: [] },
  { code: "C24", question: "Are rejected materials properly handled and recorded?", remark: "", evidence: [] },
  { code: "C25", question: "Are inspection results analyzed for supplier evaluation?", remark: "", evidence: [] },
  
  // Production Control (C26-C45)
  { code: "C26", question: "Are manufacturing inputs reviewed and documented?", remark: "", evidence: [] },
  { code: "C27", question: "Are outputs expressed in specs and drawings?", remark: "", evidence: [] },
  { code: "C28", question: "Is there a control plan for production?", remark: "", evidence: [] },
  { code: "C29", question: "Are QC staff and work instructions in place?", remark: "", evidence: [] },
  { code: "C30", question: "Are materials defined via BOM or similar?", remark: "", evidence: [] },
  { code: "C31", question: "Is production scheduled based on capacity and orders?", remark: "", evidence: [] },
  { code: "C32", question: "Are products traceable and batch-controlled?", remark: "", evidence: [] },
  { code: "C33", question: "Are rejected items isolated and rechecked?", remark: "", evidence: [] },
  { code: "C34", question: "Are defects and trends analyzed?", remark: "", evidence: [] },
  { code: "C35", question: "Are new tools evaluated before use?", remark: "", evidence: [] },
  { code: "C36", question: "Are process parameters monitored and recorded?", remark: "", evidence: [] },
  { code: "C37", question: "Can QC stop production for quality issues?", remark: "", evidence: [] },
  { code: "C38", question: "Is equipment maintenance planned and recorded?", remark: "", evidence: [] },
  { code: "C39", question: "Are handling and transport methods suitable?", remark: "", evidence: [] },
  { code: "C40", question: "Are packing and packaging requirements defined?", remark: "", evidence: [] },
  { code: "C41", question: "Is the production flow chart available and clear?", remark: "", evidence: [] },
  { code: "C42", question: "Are outsourced processes identified?", remark: "", evidence: [] },
  { code: "C43", question: "Does the factory have relevant production experience?", remark: "", evidence: [] },
  { code: "C44", question: "Are workers skilled and observed during audit?", remark: "", evidence: [] },
  { code: "C45", question: "Are machines and facilities adequate for production?", remark: "", evidence: [] },
  
  // Final Product Inspection & Testing (C46-C53)
  { code: "C46", question: "Are customer specs available for QC?", remark: "", evidence: [] },
  { code: "C47", question: "Are final inspection criteria defined?", remark: "", evidence: [] },
  { code: "C48", question: "Are final inspections conducted and recorded?", remark: "", evidence: [] },
  { code: "C49", question: "Are appearance checks done with proper tools?", remark: "", evidence: [] },
  { code: "C50", question: "Are safety and functionality checks performed?", remark: "", evidence: [] },
  { code: "C51", question: "Are rejected lots isolated and handled properly?", remark: "", evidence: [] },
  { code: "C52", question: "Are causes of rejects investigated and improved?", remark: "", evidence: [] },
  { code: "C53", question: "Is ongoing reliability testing conducted?", remark: "", evidence: [] },
  
  // Measuring & Testing Equipment (C54-C58)
  { code: "C54", question: "Are measuring instruments calibrated and controlled?", remark: "", evidence: [] },
  { code: "C55", question: "Is calibration status clearly marked on equipment?", remark: "", evidence: [] },
  { code: "C56", question: "Are measurement standards traceable to national standards?", remark: "", evidence: [] },
  { code: "C57", question: "Are out-of-calibration results investigated?", remark: "", evidence: [] },
  { code: "C58", question: "Is equipment protected from environmental conditions?", remark: "", evidence: [] },
  
  // Resource Management (C59-C63)
  { code: "C59", question: "Are quality personnel competent and trained?", remark: "", evidence: [] },
  { code: "C60", question: "Is training effectiveness evaluated and recorded?", remark: "", evidence: [] },
  { code: "C61", question: "Are job descriptions and responsibilities defined?", remark: "", evidence: [] },
  { code: "C62", question: "Is the work environment suitable for quality work?", remark: "", evidence: [] },
  { code: "C63", question: "Are infrastructure requirements identified and provided?", remark: "", evidence: [] },
  
  // Continuous Improvement (C64-C73)
  { code: "C64", question: "Are customer satisfaction levels monitored?", remark: "", evidence: [] },
  { code: "C65", question: "Are internal audits planned and conducted?", remark: "", evidence: [] },
  { code: "C66", question: "Are audit findings addressed with corrective actions?", remark: "", evidence: [] },
  { code: "C67", question: "Is management review conducted at planned intervals?", remark: "", evidence: [] },
  { code: "C68", question: "Are quality objectives set and monitored?", remark: "", evidence: [] },
  { code: "C69", question: "Is statistical data used for decision making?", remark: "", evidence: [] },
  { code: "C70", question: "Are preventive actions implemented to avoid problems?", remark: "", evidence: [] },
  { code: "C71", question: "Is there a system for handling customer complaints?", remark: "", evidence: [] },
  { code: "C72", question: "Are quality costs analyzed and controlled?", remark: "", evidence: [] },
  { code: "C73", question: "Is there evidence of continuous improvement activities?", remark: "", evidence: [] },
  
  // Social & Environmental Responsibility (C74-C83)
  { code: "C74", question: "Are environmental policies established and implemented?", remark: "", evidence: [] },
  { code: "C75", question: "Is waste management controlled and monitored?", remark: "", evidence: [] },
  { code: "C76", question: "Are energy consumption reduction measures in place?", remark: "", evidence: [] },
  { code: "C77", question: "Are chemical usage and storage properly controlled?", remark: "", evidence: [] },
  { code: "C78", question: "Is water usage monitored and controlled?", remark: "", evidence: [] },
  { code: "C79", question: "Are social responsibility policies documented?", remark: "", evidence: [] },
  { code: "C80", question: "Are worker rights and conditions monitored?", remark: "", evidence: [] },
  { code: "C81", question: "Is child labor prevention actively enforced?", remark: "", evidence: [] },
  { code: "C82", question: "Are community relations maintained positively?", remark: "", evidence: [] },
  { code: "C83", question: "Is supplier social compliance monitored?", remark: "", evidence: [] },
  
  // Health & Safety (C84-C93)
  { code: "C84", question: "Are health and safety policies established?", remark: "", evidence: [] },
  { code: "C85", question: "Is safety training provided to all workers?", remark: "", evidence: [] },
  { code: "C86", question: "Are personal protective equipment provided and used?", remark: "", evidence: [] },
  { code: "C87", question: "Are workplace hazards identified and controlled?", remark: "", evidence: [] },
  { code: "C88", question: "Is emergency response planning in place?", remark: "", evidence: [] },
  { code: "C89", question: "Are accident/incident reports maintained?", remark: "", evidence: [] },
  { code: "C90", question: "Is first aid equipment and training available?", remark: "", evidence: [] },
  { code: "C91", question: "Are fire safety measures adequate and tested?", remark: "", evidence: [] },
  { code: "C92", question: "Is workplace ergonomics considered and addressed?", remark: "", evidence: [] },
  { code: "C93", question: "Are health monitoring programs in place?", remark: "", evidence: [] }
];

export default function ComplianceAuditFormClean({ company, onBack, existingAudit }: ComplianceAuditFormCleanProps) {
  const { toast } = useToast();
  
  // Clean state - single checklist array
  const [auditData, setAuditData] = useState<ComplianceAudit>({
    auditDate: new Date().toISOString().split('T')[0],
    company,
    auditorName: '',
    location: '',
    auditScope: '',
    checklist: checklistTemplate,
    status: 'draft'
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(auditData.checklist.length / itemsPerPage);
  const currentItems = auditData.checklist.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Load existing audit data
  useEffect(() => {
    if (existingAudit?.checklist) {
      setAuditData(prev => ({
        ...prev,
        ...existingAudit,
        checklist: existingAudit.checklist
      }));
    }
  }, [existingAudit]);

  // Update checklist item
  const updateChecklistItem = (code: string, field: keyof ChecklistItem, value: any) => {
    setAuditData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.code === code
          ? { ...item, [field]: value }
          : item
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  // Handle image upload
  const handleImageUpload = async (code: string, file: File) => {
    if (!auditData.id) {
      toast({
        title: "Save Required",
        description: "Please save the audit as draft before uploading images.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log(`🧹 CLEAN: Uploading image for ${code}`);
      const imageUrl = await uploadEvidenceImage(file, auditData.id, code);
      
      // Add image URL to checklist item's evidence array
      updateChecklistItem(code, 'evidence', [
        ...(auditData.checklist.find(item => item.code === code)?.evidence || []),
        imageUrl
      ]);

      // Auto-save after image upload
      await saveAudit();

      toast({
        title: "Image Uploaded",
        description: "Evidence image uploaded successfully"
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove image from checklist item
  const removeImage = (code: string, imageIndex: number) => {
    const item = auditData.checklist.find(item => item.code === code);
    if (item?.evidence) {
      const updatedEvidence = item.evidence.filter((_, index) => index !== imageIndex);
      updateChecklistItem(code, 'evidence', updatedEvidence);
    }
  };

  // Save audit (draft or update)
  const saveAudit = async () => {
    setIsSaving(true);
    try {
      const method = auditData.id ? 'PUT' : 'POST';
      const url = auditData.id 
        ? `/api/audits/compliance/${auditData.id}`
        : '/api/audits/compliance';

      console.log('🧹 CLEAN: Saving audit with checklist items:', auditData.checklist.length);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        if (!auditData.id) {
          setAuditData(prev => ({ ...prev, id: result.id }));
        }
        
        toast({
          title: "Draft Saved",
          description: "Audit saved successfully"
        });
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save audit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Submit audit
  const submitAudit = async () => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...auditData,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };

      const method = auditData.id ? 'PUT' : 'POST';
      const url = auditData.id 
        ? `/api/audits/compliance/${auditData.id}`
        : '/api/audits/compliance';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Audit Submitted",
          description: "Compliance audit submitted successfully"
        });
        onBack();
      } else {
        throw new Error(result.error || 'Submit failed');
      }
    } catch (error) {
      console.error('Submit failed:', error);
      toast({
        title: "Submit Failed",
        description: "Failed to submit audit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Badge variant="outline">{company}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            Page {currentPage + 1} of {totalPages}
          </Badge>
          <Badge variant="outline">
            {auditData.checklist.filter(item => item.response).length} / {auditData.checklist.length} Completed
          </Badge>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Auditor Name</label>
            <Input
              value={auditData.auditorName}
              onChange={(e) => setAuditData(prev => ({ ...prev, auditorName: e.target.value }))}
              placeholder="Enter auditor name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Audit Date</label>
            <Input
              type="date"
              value={auditData.auditDate}
              onChange={(e) => setAuditData(prev => ({ ...prev, auditDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Input
              value={auditData.location}
              onChange={(e) => setAuditData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter audit location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Audit Scope</label>
            <Input
              value={auditData.auditScope}
              onChange={(e) => setAuditData(prev => ({ ...prev, auditScope: e.target.value }))}
              placeholder="Enter audit scope"
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentItems.map((item) => (
            <div key={item.code} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{item.code}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{item.question}</p>
                </div>
              </div>

              {/* Response Buttons */}
              <div className="flex space-x-2">
                {(['Yes', 'No', 'NA'] as const).map((response) => (
                  <Button
                    key={response}
                    variant={item.response === response ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateChecklistItem(item.code, 'response', response)}
                    className={
                      item.response === response
                        ? response === 'Yes'
                          ? 'bg-green-600 hover:bg-green-700'
                          : response === 'No'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                        : ''
                    }
                  >
                    {response === 'Yes' && <Check className="h-4 w-4 mr-1" />}
                    {response === 'No' && <X className="h-4 w-4 mr-1" />}
                    {response === 'NA' && <AlertTriangle className="h-4 w-4 mr-1" />}
                    {response}
                  </Button>
                ))}
              </div>

              {/* Remarks */}
              <Textarea
                placeholder="Add remarks (optional)"
                value={item.remark}
                onChange={(e) => updateChecklistItem(item.code, 'remark', e.target.value)}
                className="min-h-[60px]"
              />

              {/* Evidence Images */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Evidence Images</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(item.code, file);
                      }}
                      className="hidden"
                      id={`image-upload-${item.code}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`image-upload-${item.code}`)?.click()}
                      disabled={isUploading || (item.evidence?.length || 0) >= 5}
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      Add Image
                    </Button>
                  </div>
                </div>
                
                {item.evidence && item.evidence.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {item.evidence.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(item.code, index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={saveAudit}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          {currentPage === totalPages - 1 && (
            <Button
              onClick={submitAudit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Audit'}
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}