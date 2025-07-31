import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Save, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Lock,
  ArrowLeft,
  Download
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useComplianceAudit } from '../hooks/useComplianceAudit';
import { ComplianceAudit, ComplianceAuditItem, ComplianceAuditPart } from '../../../shared/schema';
import { MultiImageUpload } from './MultiImageUpload';

interface EnhancedComplianceAuditProps {
  auditId?: string;
  onClose?: () => void;
}

// ISO 9001:2015 Compliance Checklist Data
const compliancePartsData: ComplianceAuditPart[] = [
  {
    id: 'part1',
    title: 'Design Control (C1-C7)',
    weight: 10,
    maxPoints: 7,
    items: [
      { id: 'C1', question: 'Are design and development procedures established?', response: '', remark: '', evidenceImages: [] },
      { id: 'C2', question: 'Are design and development inputs defined and recorded?', response: '', remark: '', evidenceImages: [] },
      { id: 'C3', question: 'Are design and development outputs documented?', response: '', remark: '', evidenceImages: [] },
      { id: 'C4', question: 'Is design and development review conducted at suitable stages?', response: '', remark: '', evidenceImages: [] },
      { id: 'C5', question: 'Is design and development verification performed?', response: '', remark: '', evidenceImages: [] },
      { id: 'C6', question: 'Is design and development validation performed?', response: '', remark: '', evidenceImages: [] },
      { id: 'C7', question: 'Are design and development changes controlled?', response: '', remark: '', evidenceImages: [] },
    ]
  },
  {
    id: 'part2',
    title: 'Purchasing Control (C8-C15)',
    weight: 12,
    maxPoints: 8,
    items: [
      { id: 'C8', question: 'Are purchasing procedures established?', response: '', remark: '', evidenceImages: [] },
      { id: 'C9', question: 'Are suppliers evaluated and selected based on defined criteria?', response: '', remark: '', evidenceImages: [] },
      { id: 'C10', question: 'Are supplier evaluation records maintained?', response: '', remark: '', evidenceImages: [] },
      { id: 'C11', question: 'Are purchasing documents reviewed and approved?', response: '', remark: '', evidenceImages: [] },
      { id: 'C12', question: 'Do purchasing documents contain clear product specifications?', response: '', remark: '', evidenceImages: [] },
      { id: 'C13', question: 'Are purchased products verified upon receipt?', response: '', remark: '', evidenceImages: [] },
      { id: 'C14', question: 'Are non-conforming purchased products identified and controlled?', response: '', remark: '', evidenceImages: [] },
      { id: 'C15', question: 'Is supplier performance monitored and reviewed?', response: '', remark: '', evidenceImages: [] },
    ]
  },
  {
    id: 'part3',
    title: 'Storage Management (C16-C22)',
    weight: 10,
    maxPoints: 7,
    items: [
      { id: 'C16', question: 'Are storage areas properly identified and organized?', response: '', remark: '', evidenceImages: [] },
      { id: 'C17', question: 'Are storage conditions appropriate for materials?', response: '', remark: '', evidenceImages: [] },
      { id: 'C18', question: 'Is FIFO (First In, First Out) system implemented?', response: '', remark: '', evidenceImages: [] },
      { id: 'C19', question: 'Are materials properly protected during storage?', response: '', remark: '', evidenceImages: [] },
      { id: 'C20', question: 'Are inventory records maintained and accurate?', response: '', remark: '', evidenceImages: [] },
      { id: 'C21', question: 'Are damaged or deteriorated materials identified?', response: '', remark: '', evidenceImages: [] },
      { id: 'C22', question: 'Is access to storage areas controlled?', response: '', remark: '', evidenceImages: [] },
    ]
  },
  // Continue with remaining parts...
  {
    id: 'part4',
    title: 'Incoming Inspection (C23-C30)',
    weight: 12,
    maxPoints: 8,
    items: [
      { id: 'C23', question: 'Are incoming inspection procedures documented?', response: '', remark: '', evidenceImages: [] },
      { id: 'C24', question: 'Are inspection criteria and methods defined?', response: '', remark: '', evidenceImages: [] },
      { id: 'C25', question: 'Are inspection records maintained?', response: '', remark: '', evidenceImages: [] },
      { id: 'C26', question: 'Are sampling plans appropriate and documented?', response: '', remark: '', evidenceImages: [] },
      { id: 'C27', question: 'Are measuring equipment calibrated and controlled?', response: '', remark: '', evidenceImages: [] },
      { id: 'C28', question: 'Are non-conforming materials identified and segregated?', response: '', remark: '', evidenceImages: [] },
      { id: 'C29', question: 'Are inspection results communicated to relevant parties?', response: '', remark: '', evidenceImages: [] },
      { id: 'C30', question: 'Are corrective actions taken for recurring issues?', response: '', remark: '', evidenceImages: [] },
    ]
  }
  // Add remaining parts 5-10 as needed...
];

export function EnhancedComplianceAudit({ auditId, onClose }: EnhancedComplianceAuditProps) {
  const { toast } = useToast();
  const { 
    createAudit, 
    updateAudit, 
    submitAudit, 
    getAudit,
    autoSave,
    isCreating,
    isUpdating,
    isSubmitting 
  } = useComplianceAudit();

  const [audit, setAudit] = useState<Partial<ComplianceAudit>>({
    auditDate: new Date().toISOString().split('T')[0],
    auditorName: '',
    company: 'EHI',
    location: '',
    auditScope: 'ISO 9001:2015 Compliance Verification',
    parts: compliancePartsData,
    status: 'draft',
  });

  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Load existing audit if auditId provided
  useEffect(() => {
    if (auditId) {
      loadAudit(auditId);
    }
  }, [auditId]);

  const loadAudit = async (id: string) => {
    try {
      const existingAudit = await getAudit(id);
      if (existingAudit) {
        console.log('📥 Loading existing audit:', existingAudit);
        
        // Debug loading audit images
        const loadedImageCount = existingAudit.parts?.reduce((total: number, part: any) => {
          return total + (part.items?.reduce((subtotal: number, item: any) => {
            if (item.evidenceImages && item.evidenceImages.length > 0) {
              console.log(`🔄 LOADING: Item ${item.id} has ${item.evidenceImages.length} images`);
            }
            return subtotal + (item.evidenceImages?.length || 0);
          }, 0) || 0);
        }, 0) || 0;
        console.log(`🔄 LOADING: Total images loaded from server: ${loadedImageCount}`);
        
        // Preserve ALL user data including responses, remarks, and images
        setAudit({
          ...existingAudit,
          // Ensure parts data is properly loaded with all user answers preserved
          parts: existingAudit.parts || compliancePartsData
        });
        console.log('✅ Audit loaded with', existingAudit.parts?.length || 0, 'parts');
      }
    } catch (error) {
      console.error('Failed to load audit:', error);
      toast({
        title: "Failed to load audit",
        description: "Could not load existing audit data.",
        variant: "destructive",
      });
    }
  };

  // Auto-save functionality - DISABLED to prevent double saves
  const triggerAutoSave = useCallback(() => {
    // Auto-save disabled - only manual saves allowed to prevent conflicts
    console.log('Auto-save disabled to prevent double saves');
  }, []);

  // Auto-save trigger disabled
  useEffect(() => {
    // Auto-save effect disabled to prevent double save bug
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  const handleBasicInfoChange = (field: string, value: string) => {
    setAudit(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemResponse = (partId: string, itemId: string, response: 'Yes' | 'No' | 'NA') => {
    setAudit(prev => ({
      ...prev,
      parts: prev.parts?.map(part =>
        part.id === partId
          ? {
              ...part,
              items: part.items.map(item =>
                item.id === itemId ? { ...item, response } : item
              )
            }
          : part
      ) || [],
    }));
  };

  const handleItemRemark = (partId: string, itemId: string, remark: string) => {
    setAudit(prev => ({
      ...prev,
      parts: prev.parts?.map(part =>
        part.id === partId
          ? {
              ...part,
              items: part.items.map(item =>
                item.id === itemId ? { ...item, remark } : item
              )
            }
          : part
      ) || [],
    }));
  };

  const handleItemImages = (partId: string, itemId: string, images: string[]) => {
    console.log(`🖼️ FRONTEND IMAGE UPDATE: Part ${partId}, Item ${itemId}, Images: ${images.length}`);
    
    setAudit(prev => ({
      ...prev,
      parts: prev.parts?.map(part =>
        part.id === partId
          ? {
              ...part,
              items: part.items.map(item =>
                item.id === itemId ? { ...item, evidenceImages: images } : item
              )
            }
          : part
      ) || [],
    }));
    
    console.log('🖼️ FRONTEND STATE UPDATED: Images updated for item', itemId);
  };

  const calculateScore = () => {
    if (!audit.parts) return { totalItems: 0, yesCount: 0, noCount: 0, naCount: 0, applicableItems: 0, score: 0 };

    let totalItems = 0;
    let yesCount = 0;
    let noCount = 0;
    let naCount = 0;

    audit.parts.forEach(part => {
      part.items.forEach(item => {
        totalItems++;
        if (item.response === 'Yes') yesCount++;
        else if (item.response === 'No') noCount++;
        else if (item.response === 'NA') naCount++;
      });
    });

    const applicableItems = totalItems - naCount;
    const score = applicableItems > 0 ? Math.round((yesCount / applicableItems) * 100) : 0;

    return { totalItems, yesCount, noCount, naCount, applicableItems, score };
  };

  const handleSaveDraft = async () => {
    // Prevent multiple simultaneous saves
    if (isUpdating || isCreating) {
      console.log('Save already in progress, skipping...');
      return;
    }

    try {
      const scoreData = calculateScore();
      const auditData = { ...audit, scoreData };

      console.log(`💾 SAVE DRAFT: Saving audit with ${auditData.parts?.length || 0} parts`);

      if (audit.id) {
        console.log('💾 UPDATING existing audit:', audit.id);
        await updateAudit({ id: audit.id, data: auditData });
      } else {
        console.log('💾 CREATING new audit');
        const newId = await createAudit(auditData);
        setAudit(prev => ({ ...prev, id: newId }));
      }
      
      setLastSaved(new Date());
      toast({
        title: "Draft saved",
        description: "Audit draft saved successfully.",
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save failed",
        description: "Failed to save audit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitAudit = async () => {
    try {
      let auditIdToSubmit = audit.id;
      
      // If audit hasn't been saved yet, save it first
      if (!auditIdToSubmit) {
        const scoreData = calculateScore();
        const auditData = { ...audit, scoreData };
        console.log('🔧 Creating new audit before submission...');
        auditIdToSubmit = await createAudit(auditData);
        setAudit(prev => ({ ...prev, id: auditIdToSubmit }));
      }

      // Submit the audit (no field validation required)
      console.log('🚀 Submitting audit:', auditIdToSubmit);
      if (!auditIdToSubmit) {
        throw new Error('Failed to get audit ID for submission');
      }
      await submitAudit(auditIdToSubmit);
      
      // Update local state optimistically after successful submission
      const submittedAt = new Date();
      setAudit(prev => ({ 
        ...prev, 
        status: 'submitted', 
        submittedAt: submittedAt
      }));
      
      console.log('✅ Audit submitted successfully, updating local state');
      
      toast({
        title: "Audit submitted",
        description: "Compliance audit submitted successfully.",
      });
      
      // Close the form after successful submission
      if (onClose) {
        setTimeout(() => onClose(), 500); // Small delay to show success state
      }
    } catch (error) {
      console.error('❌ Submit failed:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit audit. Images may be too large. Try reducing image count or quality.",
        variant: "destructive",
      });
    }
  };

  const generatePDF = async () => {
    if (!audit.id) {
      toast({
        title: "Save required",
        description: "Please save the audit first to generate PDF.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use the audit-specific PDF generation endpoint
      const response = await fetch(`/api/audits/${audit.id}/generate-pdf`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('PDF generation failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Download the PDF
        const link = document.createElement('a');
        link.href = result.downloadUrl || result.pdfUrl;
        link.download = result.fileName || `audit-${audit.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "PDF generated",
          description: "Audit report downloaded successfully with Eastern Mills branding.",
        });
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF generation failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scoreData = calculateScore();
  const currentPart = audit.parts?.[currentPartIndex];
  const isReadOnly = audit.status === 'submitted';

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-lg font-medium">Submitting compliance audit...</p>
            <p className="text-sm text-gray-600">Please wait while we process your submission</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ISO 9001:2015 Compliance Audit
                {isReadOnly && <Lock className="h-4 w-4 text-muted-foreground" />}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              <Badge variant={audit.status === 'submitted' ? 'default' : 'secondary'}>
                {audit.status === 'submitted' ? 'Submitted' : 'Draft'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="auditDate">Audit Date</Label>
              <Input
                id="auditDate"
                type="date"
                value={audit.auditDate}
                onChange={(e) => handleBasicInfoChange('auditDate', e.target.value)}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="auditorName">Auditor Name</Label>
              <Input
                id="auditorName"
                value={audit.auditorName}
                onChange={(e) => handleBasicInfoChange('auditorName', e.target.value)}
                placeholder="Enter auditor name"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Select
                value={audit.company}
                onValueChange={(value: 'EHI' | 'EMPL') => handleBasicInfoChange('company', value)}
                disabled={isReadOnly}
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

          {/* Score Display */}
          {scoreData.totalItems > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{scoreData.yesCount}</div>
                <div className="text-xs text-muted-foreground">Yes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{scoreData.noCount}</div>
                <div className="text-xs text-muted-foreground">No</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{scoreData.naCount}</div>
                <div className="text-xs text-muted-foreground">N/A</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{scoreData.applicableItems}</div>
                <div className="text-xs text-muted-foreground">Applicable</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  scoreData.score >= 90 ? 'text-green-600' : 
                  scoreData.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {scoreData.score}%
                </div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Parts */}
      {currentPart && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentPart.title}</span>
              <span className="text-sm text-muted-foreground">
                Part {currentPartIndex + 1} of {audit.parts?.length || 0}
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentPart.items.map((item, itemIndex) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">{item.id}: {item.question}</h4>
                    
                    {/* Response Buttons */}
                    <div className="flex gap-2 mb-3">
                      {(['Yes', 'No', 'NA'] as const).map((response) => (
                        <Button
                          key={response}
                          size="sm"
                          variant={item.response === response ? 'default' : 'outline'}
                          className={
                            item.response === response
                              ? response === 'Yes' ? 'bg-green-600 hover:bg-green-700' :
                                response === 'No' ? 'bg-red-600 hover:bg-red-700' :
                                'bg-gray-600 hover:bg-gray-700'
                              : ''
                          }
                          onClick={() => !isReadOnly && handleItemResponse(currentPart.id, item.id, response)}
                          disabled={isReadOnly}
                        >
                          {response === 'Yes' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {response === 'No' && <XCircle className="h-3 w-3 mr-1" />}
                          {response === 'NA' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {response}
                        </Button>
                      ))}
                    </div>

                    {/* Remarks */}
                    <div className="mb-3">
                      <Label htmlFor={`remark-${item.id}`} className="text-xs">Remarks</Label>
                      <Textarea
                        id={`remark-${item.id}`}
                        value={item.remark}
                        onChange={(e) => !isReadOnly && handleItemRemark(currentPart.id, item.id, e.target.value)}
                        placeholder="Add any remarks or observations..."
                        rows={2}
                        disabled={isReadOnly}
                      />
                    </div>

                    {/* Multi-Image Upload */}
                    <MultiImageUpload
                      images={item.evidenceImages}
                      onImagesChange={(images) => !isReadOnly && handleItemImages(currentPart.id, item.id, images)}
                      maxImages={5}
                      title={`Evidence for ${item.id}`}
                      className={isReadOnly ? 'opacity-60 pointer-events-none' : ''}
                      auditId={audit.id}
                      questionCode={item.id}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPartIndex(Math.max(0, currentPartIndex - 1))}
                disabled={currentPartIndex === 0}
              >
                Previous Part
              </Button>

              <div className="flex gap-2">
                {!isReadOnly && (
                  <Button
                    onClick={handleSaveDraft}
                    disabled={isUpdating || isCreating}
                    variant="outline"
                  >
                    {isUpdating || isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </>
                    )}
                  </Button>
                )}



                {currentPartIndex === (audit.parts?.length || 1) - 1 ? (
                  isReadOnly ? (
                    <Button onClick={generatePDF} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitAudit}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() => setCurrentPartIndex(currentPartIndex + 1)}
                    disabled={currentPartIndex >= (audit.parts?.length || 1) - 1}
                  >
                    Next Part
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}