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
  Send,
  Plus
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { ComplianceAudit, InsertComplianceAudit } from '../../../shared/schema';
import { uploadEvidenceImage } from '../utils/firebaseStorage';

interface ComplianceAuditFormProps {
  company: 'EHI' | 'EMPL';
  onBack: () => void;
  existingAudit?: ComplianceAudit | null;
}

interface ChecklistItem {
  code: string;
  question: string;
  response?: 'Yes' | 'No' | 'NA';
  remarks?: string;
  evidence?: string[];
}

interface AuditPart {
  title: string;
  items: ChecklistItem[];
}

const auditParts: AuditPart[] = [
  {
    title: "Design Control",
    items: [
      { code: "C1", question: "Are design and development procedures established?" },
      { code: "C2", question: "Are design input requirements identified and reviewed?" },
      { code: "C3", question: "Are design reviews conducted at key stages?" },
      { code: "C4", question: "Does design output include all necessary production info?" },
      { code: "C5", question: "Are design changes verified and controlled?" },
      { code: "C6", question: "Is prototype or pilot testing done before production?" },
      { code: "C7", question: "Are design personnel competent and qualified?" }
    ]
  },
  {
    title: "Purchasing Control",
    items: [
      { code: "C8", question: "Are suppliers evaluated and approved before ordering?" },
      { code: "C9", question: "Are materials purchased from approved sources?" },
      { code: "C10", question: "Are product specs and requirements agreed with suppliers?" },
      { code: "C11", question: "Is supplier performance monitored and recorded?" },
      { code: "C12", question: "Is supplier risk assessed to avoid material shortages?" }
    ]
  },
  {
    title: "Storage Management",
    items: [
      { code: "C13", question: "Is inventory recorded for incoming and outgoing goods?" },
      { code: "C14", question: "Is inventory stored in safe and suitable conditions?" },
      { code: "C15", question: "Are materials clearly identified and segregated?" },
      { code: "C16", question: "Is product condition checked regularly in storage?" },
      { code: "C17", question: "Is inventory managed using FIFO or similar systems?" }
    ]
  },
  {
    title: "Incoming Inspection",
    items: [
      { code: "C18", question: "Is there a separate area for uninspected materials?" },
      { code: "C19", question: "Are inspection criteria defined for incoming goods?" },
      { code: "C20", question: "Are inspections conducted and results recorded?" },
      { code: "C21", question: "Are unverified materials checked via alternate methods?" },
      { code: "C22", question: "Are customer-designated sources properly controlled?" },
      { code: "C23", question: "Is inspection status clearly marked on materials?" },
      { code: "C24", question: "Are rejected materials properly handled and recorded?" },
      { code: "C25", question: "Are inspection results analyzed for supplier evaluation?" }
    ]
  },
  {
    title: "Production Control",
    items: [
      { code: "C26", question: "Are manufacturing inputs reviewed and documented?" },
      { code: "C27", question: "Are outputs expressed in specs and drawings?" },
      { code: "C28", question: "Is there a control plan for production?" },
      { code: "C29", question: "Are QC staff and work instructions in place?" },
      { code: "C30", question: "Are materials defined via BOM or similar?" },
      { code: "C31", question: "Is production scheduled based on capacity and orders?" },
      { code: "C32", question: "Are products traceable and batch-controlled?" },
      { code: "C33", question: "Are rejected items isolated and rechecked?" },
      { code: "C34", question: "Are defects and trends analyzed?" },
      { code: "C35", question: "Are new tools evaluated before use?" },
      { code: "C36", question: "Are process parameters monitored and recorded?" },
      { code: "C37", question: "Can QC stop production for quality issues?" },
      { code: "C38", question: "Is equipment maintenance planned and recorded?" },
      { code: "C39", question: "Are handling and transport methods suitable?" },
      { code: "C40", question: "Are packing and packaging requirements defined?" },
      { code: "C41", question: "Is the production flow chart available and clear?" },
      { code: "C42", question: "Are outsourced processes identified?" },
      { code: "C43", question: "Does the factory have relevant production experience?" },
      { code: "C44", question: "Are workers skilled and observed during audit?" },
      { code: "C45", question: "Are machines and facilities adequate for production?" }
    ]
  },
  {
    title: "Final Product Inspection & Testing",
    items: [
      { code: "C46", question: "Are customer specs available for QC?" },
      { code: "C47", question: "Are final inspection criteria defined?" },
      { code: "C48", question: "Are final inspections conducted and recorded?" },
      { code: "C49", question: "Are appearance checks done with proper tools?" },
      { code: "C50", question: "Are safety and functionality checks performed?" },
      { code: "C51", question: "Are rejected lots isolated and handled properly?" },
      { code: "C52", question: "Are causes of rejects investigated and improved?" },
      { code: "C53", question: "Is ongoing reliability testing conducted?" }
    ]
  },
  {
    title: "Measuring & Testing Equipment",
    items: [
      { code: "C54", question: "Is life/reliability testing equipment available?" },
      { code: "C55", question: "Are gauges and tools maintained and protected?" },
      { code: "C56", question: "Is equipment calibrated regularly?" },
      { code: "C57", question: "Are display devices checked frequently?" },
      { code: "C58", question: "Is equipment condition verified with fault simulation?" }
    ]
  },
  {
    title: "Resource Management",
    items: [
      { code: "C59", question: "Is infrastructure adequate and layout optimized?" },
      { code: "C60", question: "Is the factory clean and well-maintained?" },
      { code: "C61", question: "Are training needs identified and addressed?" },
      { code: "C62", question: "Are employees motivated for quality and innovation?" },
      { code: "C63", question: "Are contingency plans in place for emergencies?" }
    ]
  },
  {
    title: "Continuous Improvement",
    items: [
      { code: "C64", question: "Is data collected to support improvement?" },
      { code: "C65", question: "Are failures recorded and investigated?" },
      { code: "C66", question: "Are quality objectives defined and measured?" },
      { code: "C67", question: "Are internal audits planned and conducted?" },
      { code: "C68", question: "Does top management review the QMS?" },
      { code: "C69", question: "Are corrective actions taken and reviewed?" },
      { code: "C70", question: "Are preventive actions implemented?" },
      { code: "C71", question: "Are improvement programs like 5S or Kaizen used?" },
      { code: "C72", question: "Are audit and review results followed up?" },
      { code: "C73", question: "Are customer complaints reviewed?" }
    ]
  },
  {
    title: "Social & Environmental Responsibility",
    items: [
      { code: "C74", question: "Are working conditions (air, light, cleanliness) acceptable?" },
      { code: "C75", question: "Are all workers above the legal working age?" },
      { code: "C76", question: "Do working hours comply with labor laws?" },
      { code: "C77", question: "Do workers get at least one day off per week?" },
      { code: "C78", question: "Are workers employed voluntarily?" },
      { code: "C79", question: "Are wages equal to or above legal minimum?" },
      { code: "C80", question: "Do women have equal rights and protections?" },
      { code: "C81", question: "Are workers treated respectfully without abuse?" },
      { code: "C82", question: "Is the fire protection system adequate and functional?" },
      { code: "C83", question: "Are fire and evacuation drills conducted regularly?" }
    ]
  },
  {
    title: "Health & Safety",
    items: [
      { code: "C84", question: "Are buildings in good physical condition?" },
      { code: "C85", question: "Are machine guards installed for safety?" },
      { code: "C86", question: "Are special equipment registered and inspected?" },
      { code: "C87", question: "Are safety instructions about clothing/jewelry followed?" },
      { code: "C88", question: "Is PPE provided and in good condition?" },
      { code: "C89", question: "Are PPE signs posted in required areas?" },
      { code: "C90", question: "Do workers follow safety instructions and use PPE?" },
      { code: "C91", question: "Is dormitory separate from production areas?" },
      { code: "C92", question: "Is a valid restaurant license available if required?" },
      { code: "C93", question: "Is medical service (e.g., first aid) available for workers?" }
    ]
  }
];

export function ComplianceAuditForm({ company, onBack, existingAudit }: ComplianceAuditFormProps) {
  const { toast } = useToast();
  const [currentPart, setCurrentPart] = useState(0);
  const [auditData, setAuditData] = useState<{
    auditorName: string;
    location: string;
    auditScope: string;
    checklist: ChecklistItem[];
    partScores: Record<string, number>;
  }>({
    auditorName: '',
    location: '',
    auditScope: '',
    checklist: auditParts.flatMap(part => part.items),
    partScores: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(existingAudit?.id || null);
  const [uploadingEvidence, setUploadingEvidence] = useState<Set<string>>(new Set());

  // Load existing audit data if editing
  useEffect(() => {
    if (existingAudit) {
      setAuditData({
        auditorName: existingAudit.auditorName,
        location: existingAudit.location,
        auditScope: existingAudit.auditScope,
        checklist: existingAudit.parts?.flatMap(part => 
          part.items.map(item => ({
            code: item.id || `C${Math.random().toString(36).substr(2, 3)}`,
            question: item.question || '',
            response: item.response as 'Yes' | 'No' | 'NA' | undefined,
            remarks: item.remark,
            evidence: item.evidenceImages || []
          }))
        ) || auditParts.flatMap(part => part.items),
        partScores: {}
      });
    }
  }, [existingAudit]);

  const updateResponse = (code: string, response: 'Yes' | 'No' | 'NA') => {
    setAuditData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.code === code ? { ...item, response } : item
      )
    }));
  };

  const updateRemarks = (code: string, remarks: string) => {
    setAuditData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.code === code ? { ...item, remarks } : item
      )
    }));
  };

  const addEvidence = (code: string, imageUrl: string) => {
    setAuditData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.code === code 
          ? { ...item, evidence: [...(item.evidence || []), imageUrl] }
          : item
      )
    }));
  };

  const removeEvidence = (code: string, index: number) => {
    setAuditData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.code === code 
          ? { ...item, evidence: item.evidence?.filter((_, i) => i !== index) || [] }
          : item
      )
    }));
  };

  const calculatePartScore = (partIndex: number) => {
    const part = auditParts[partIndex];
    const partItems = auditData.checklist.filter(item => 
      part.items.some(partItem => partItem.code === item.code)
    );
    
    const applicableItems = partItems.filter(item => item.response && item.response !== 'NA');
    const yesCount = partItems.filter(item => item.response === 'Yes').length;
    
    return applicableItems.length > 0 ? Math.round((yesCount / applicableItems.length) * 100) : 0;
  };

  const calculateTotalScore = () => {
    const applicableItems = auditData.checklist.filter(item => item.response && item.response !== 'NA');
    const yesCount = auditData.checklist.filter(item => item.response === 'Yes').length;
    
    return applicableItems.length > 0 ? Math.round((yesCount / applicableItems.length) * 100) : 0;
  };

  const updateEvidenceInFirestore = async (auditId: string, questionCode: string, evidenceUrl: string) => {
    try {
      // Get current audit data
      const response = await fetch(`/api/audits/compliance/${auditId}`);
      if (!response.ok) throw new Error('Failed to fetch audit');
      
      const { audit } = await response.json();
      
      // Update the specific question's evidence array in parts structure
      const updatedParts = audit.parts.map((part: any) => ({
        ...part,
        items: part.items.map((item: any) => {
          if (item.code === questionCode) {
            return {
              ...item,
              evidenceImages: [...(item.evidenceImages || []), evidenceUrl]
            };
          }
          return item;
        })
      }));
      
      // CRITICAL: Also update the checklist field for PDF generation
      const updatedChecklist = (audit.checklist || []).map((item: ChecklistItem) => {
        if (item.code === questionCode) {
          return {
            ...item,
            evidence: [...(item.evidence || []), evidenceUrl]
          };
        }
        return item;
      });
      
      console.log(`🔄 Updating evidence for ${questionCode}: ${evidenceUrl.substring(0, 50)}...`);
      console.log(`📋 Updated checklist item:`, updatedChecklist.find(item => item.code === questionCode));
      
      // Update Firestore with BOTH parts and checklist fields
      const updateResponse = await fetch(`/api/audits/compliance/${auditId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...audit,
          parts: updatedParts,
          checklist: updatedChecklist,
          updatedAt: new Date().toISOString()
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update audit in Firestore');
      }
      
      console.log(`✅ Evidence URL successfully added to both parts and checklist for ${questionCode}`);
    } catch (error) {
      console.error('Error updating evidence in Firestore:', error);
      throw error;
    }
  };

  const handleImageUpload = async (code: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // If no audit ID yet, we need to create a draft first
    if (!auditId) {
      toast({
        title: "Saving audit first",
        description: "Creating audit draft before uploading evidence...",
      });
      await saveDraft();
      if (!auditId) {
        toast({
          title: "Error",
          description: "Failed to create audit. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    // Add to uploading set for UI feedback
    setUploadingEvidence(prev => new Set([...prev, code]));
    
    try {
      toast({
        title: "Uploading evidence",
        description: "Saving evidence image...",
      });

      // Upload to Firebase Storage
      const uploadResult = await uploadEvidenceImage(file, auditId, code);
      
      // Add the Firebase Storage URL to local state
      addEvidence(code, uploadResult.url);
      
      // Update Firestore with the new evidence URL
      await updateEvidenceInFirestore(auditId, code, uploadResult.url);
      
      toast({
        title: "Evidence uploaded",
        description: "Evidence image saved successfully.",
      });
    } catch (error) {
      console.error('Evidence upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload evidence. Please retry.",
        variant: "destructive",
      });
    } finally {
      // Remove from uploading set
      setUploadingEvidence(prev => {
        const newSet = new Set(prev);
        newSet.delete(code);
        return newSet;
      });
    }
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      // Create flattened checklist array
      const flattenedChecklist = auditParts.flatMap(part => 
        part.items.map(item => {
          const checklistItem = auditData.checklist.find(c => c.code === item.code);
          return {
            code: item.code,
            question: item.question,
            response: checklistItem?.response,
            remark: checklistItem?.remarks,
            evidence: checklistItem?.evidence || []
          };
        })
      );
      
      console.log('📋 Flattened checklist before saving:', flattenedChecklist);
      console.log('📊 Checklist items with evidence:', flattenedChecklist.filter(item => item.evidence && item.evidence.length > 0));

      const auditToSave: InsertComplianceAudit = {
        auditorName: auditData.auditorName,
        location: auditData.location,
        auditScope: auditData.auditScope,
        company,
        auditDate: new Date().toISOString().split('T')[0],
        // Keep original parts structure
        parts: auditParts.map((part, index) => ({
          id: `part-${index + 1}`,
          title: part.title,
          items: part.items.map(item => {
            const checklistItem = auditData.checklist.find(c => c.code === item.code);
            return {
              code: item.code,
              question: item.question,
              response: checklistItem?.response,
              remark: checklistItem?.remarks,
              evidenceImages: checklistItem?.evidence || []
            };
          }),
          weight: 1,
          maxPoints: part.items.length
        })),
        // Add flattened checklist array
        checklist: flattenedChecklist,
        status: 'draft'
      };

      // API call to save draft
      const response = await fetch('/api/audits/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditToSave)
      });

      if (response.ok) {
        const result = await response.json();
        // Set the audit ID for future evidence uploads
        if (result.id && !auditId) {
          setAuditId(result.id);
        }
        
        // Trigger cache refresh for real-time UI updates
        window.dispatchEvent(new CustomEvent('compliance-audit-saved'));
        
        toast({
          title: "Draft saved",
          description: "Audit draft saved successfully.",
        });
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      toast({
        title: "Error saving draft",
        description: "Failed to save audit draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const submitAudit = async () => {
    setIsSubmitting(true);
    try {
      // Create flattened checklist array for submission
      const flattenedChecklist = auditParts.flatMap(part => 
        part.items.map(item => {
          const checklistItem = auditData.checklist.find(c => c.code === item.code);
          return {
            code: item.code,
            question: item.question,
            response: checklistItem?.response,
            remark: checklistItem?.remarks,
            evidence: checklistItem?.evidence || []
          };
        })
      );
      
      console.log('📋 Flattened checklist before submission:', flattenedChecklist);
      console.log('📊 Checklist items with evidence:', flattenedChecklist.filter(item => item.evidence && item.evidence.length > 0));

      const auditToSubmit: InsertComplianceAudit = {
        auditorName: auditData.auditorName,
        location: auditData.location,
        auditScope: auditData.auditScope,
        company,
        auditDate: new Date().toISOString().split('T')[0],
        // Keep original parts structure
        parts: auditParts.map((part, index) => ({
          id: `part-${index + 1}`,
          title: part.title,
          items: part.items.map(item => {
            const checklistItem = auditData.checklist.find(c => c.code === item.code);
            return {
              code: item.code,
              question: item.question,
              response: checklistItem?.response,
              remark: checklistItem?.remarks,
              evidenceImages: checklistItem?.evidence || []
            };
          }),
          weight: 1,
          maxPoints: part.items.length
        })),
        // Add flattened checklist array
        checklist: flattenedChecklist,
        status: 'submitted'
      };

      const response = await fetch('/api/audits/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditToSubmit)
      });

      if (response.ok) {
        // Trigger cache refresh for real-time UI updates
        window.dispatchEvent(new CustomEvent('compliance-audit-submitted'));
        
        toast({
          title: "Audit submitted",
          description: "Compliance audit submitted successfully.",
        });
        onBack();
      } else {
        throw new Error('Failed to submit audit');
      }
    } catch (error) {
      toast({
        title: "Error submitting audit",
        description: "Failed to submit audit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPartData = auditParts[currentPart];
  const currentPartItems = auditData.checklist.filter(item => 
    currentPartData.items.some(partItem => partItem.code === item.code)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Badge variant="secondary" className="text-sm">
              {company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Private Limited'}
            </Badge>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Compliance Audit Form
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Part {currentPart + 1} of {auditParts.length}</span>
            <span>•</span>
            <span>{currentPartData.title}</span>
            <span>•</span>
            <span>Score: {calculatePartScore(currentPart)}%</span>
          </div>
        </div>

        {/* Basic Info (only on first part) */}
        {currentPart === 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Audit Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Auditor Name</label>
                <Input
                  value={auditData.auditorName}
                  onChange={(e) => setAuditData(prev => ({ ...prev, auditorName: e.target.value }))}
                  placeholder="Enter auditor name"
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
        )}

        {/* Checklist Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Part {currentPart + 1}: {currentPartData.title}</span>
              <Badge variant="secondary">
                {calculatePartScore(currentPart)}% Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentPartData.items.map((item, index) => {
              const checklistItem = auditData.checklist.find(c => c.code === item.code);
              return (
                <div key={item.code} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.code}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">
                          {item.question}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Response Buttons */}
                  <div className="flex gap-2 mb-3">
                    <Button
                      variant={checklistItem?.response === 'Yes' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateResponse(item.code, 'Yes')}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Yes
                    </Button>
                    <Button
                      variant={checklistItem?.response === 'No' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => updateResponse(item.code, 'No')}
                      className="flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      No
                    </Button>
                    <Button
                      variant={checklistItem?.response === 'NA' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => updateResponse(item.code, 'NA')}
                      className="flex items-center gap-1"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      N/A
                    </Button>
                  </div>

                  {/* Remarks */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Remarks (Optional)
                    </label>
                    <Textarea
                      value={checklistItem?.remarks || ''}
                      onChange={(e) => updateRemarks(item.code, e.target.value)}
                      placeholder="Add any remarks or observations..."
                      className="text-sm"
                      rows={2}
                    />
                  </div>

                  {/* Evidence Images */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Evidence Images (Optional - Max 5)
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {checklistItem?.evidence?.map((imageUrl, imgIndex) => (
                        <div key={imgIndex} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Evidence ${imgIndex + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0"
                            onClick={() => removeEvidence(item.code, imgIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      {(!checklistItem?.evidence || checklistItem.evidence.length < 5) && (
                        <label className="cursor-pointer">
                          <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-blue-400 transition-colors">
                            {uploadingEvidence.has(item.code) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <Plus className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(item.code, e)}
                            disabled={uploadingEvidence.has(item.code)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPart(Math.max(0, currentPart - 1))}
              disabled={currentPart === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous Part
            </Button>
            
            {currentPart < auditParts.length - 1 && (
              <Button
                onClick={() => setCurrentPart(Math.min(auditParts.length - 1, currentPart + 1))}
                className="flex items-center gap-2"
              >
                Next Part
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveDraft}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            
            {currentPart === auditParts.length - 1 && (
              <Button
                onClick={submitAudit}
                disabled={isSubmitting || !auditData.auditorName || !auditData.location}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Audit'}
              </Button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{currentPart + 1} / {auditParts.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPart + 1) / auditParts.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}