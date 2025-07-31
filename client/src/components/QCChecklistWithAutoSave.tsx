import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { useAutoSave, useAutoSaveId } from '../hooks/useAutoSave';
import { Clock, Lock, CheckCircle, Save, Shield, Upload, Camera, Plus } from 'lucide-react';

interface QCCheckItem {
  id: string;
  category: string;
  checkPoint: string;
  status: 'pass' | 'fail' | 'na' | 'pending';
  severity: 'minor' | 'major' | 'critical';
  remarks: string;
  evidence: File[];
  corrective_action?: string;
}

interface QCChecklistData {
  basicInfo: {
    opsNumber: string;
    carpetNumber: string;
    designName: string;
    construction: string;
    size: string;
    contractor: string;
    inspector: string;
    inspectionDate: string;
    stage: 'bazaar' | 'binding' | 'clipping_finishing' | 'final_inspection';
  };
  checkItems: QCCheckItem[];
  summary: {
    totalChecks: number;
    passCount: number;
    failCount: number;
    naCount: number;
    overallStatus: 'pass' | 'fail' | 'pending';
    qualityScore: number;
  };
  attachments: File[];
}

interface QCChecklistWithAutoSaveProps {
  stage: 'bazaar' | 'binding' | 'clipping_finishing' | 'final_inspection';
  onSave?: (data: QCChecklistData) => void;
  onCancel?: () => void;
  existingData?: Partial<QCChecklistData>;
}

// Default check items based on inspection stage
const getDefaultCheckItems = (stage: string): QCCheckItem[] => {
  const baseItems = [
    { id: '1', category: 'Visual Inspection', checkPoint: 'Overall appearance and finish quality', status: 'pending' as const, severity: 'major' as const, remarks: '', evidence: [] },
    { id: '2', category: 'Dimensions', checkPoint: 'Size accuracy within tolerance', status: 'pending' as const, severity: 'critical' as const, remarks: '', evidence: [] },
    { id: '3', category: 'Pattern', checkPoint: 'Design pattern alignment and consistency', status: 'pending' as const, severity: 'major' as const, remarks: '', evidence: [] },
  ];

  const stageSpecificItems: { [key: string]: QCCheckItem[] } = {
    bazaar: [
      ...baseItems,
      { id: '4', category: 'Yarn Quality', checkPoint: 'Yarn tension and uniformity', status: 'pending' as const, severity: 'major' as const, remarks: '', evidence: [] },
      { id: '5', category: 'Weaving', checkPoint: 'Proper knot formation and density', status: 'pending' as const, severity: 'critical' as const, remarks: '', evidence: [] },
    ],
    binding: [
      ...baseItems,
      { id: '4', category: 'Edge Binding', checkPoint: 'Binding attachment and alignment', status: 'pending' as const, severity: 'critical' as const, remarks: '', evidence: [] },
      { id: '5', category: 'Corner Finish', checkPoint: 'Corner binding neatness', status: 'pending' as const, severity: 'major' as const, remarks: '', evidence: [] },
    ],
    clipping_finishing: [
      ...baseItems,
      { id: '4', category: 'Pile Height', checkPoint: 'Uniform pile height across surface', status: 'pending' as const, severity: 'major' as const, remarks: '', evidence: [] },
      { id: '5', category: 'Surface Finish', checkPoint: 'Clean surface without loose fibers', status: 'pending' as const, severity: 'major' as const, remarks: '', evidence: [] },
      { id: '6', category: 'Washing Quality', checkPoint: 'Proper washing and drying results', status: 'pending' as const, severity: 'major' as const, remarks: '', evidence: [] },
    ],
    final_inspection: [
      ...baseItems,
      { id: '4', category: 'Final Quality', checkPoint: 'Overall product meets specifications', status: 'pending' as const, severity: 'critical' as const, remarks: '', evidence: [] },
      { id: '5', category: 'Packaging Ready', checkPoint: 'Product ready for packaging', status: 'pending' as const, severity: 'major' as const, remarks: '', evidence: [] },
    ],
  };

  return stageSpecificItems[stage] || baseItems;
};

export const QCChecklistWithAutoSave: React.FC<QCChecklistWithAutoSaveProps> = ({
  stage,
  onSave,
  onCancel,
  existingData
}) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Generate unique document ID for this QC checklist
  const generateId = useAutoSaveId('qc_checklist');
  const [checklistId] = useState(() => generateId(stage));

  // Initialize form data
  const [qcData, setQcData] = useState<QCChecklistData>({
    basicInfo: {
      opsNumber: '',
      carpetNumber: '',
      designName: '',
      construction: '',
      size: '',
      contractor: '',
      inspector: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      stage,
    },
    checkItems: getDefaultCheckItems(stage),
    summary: {
      totalChecks: 0,
      passCount: 0,
      failCount: 0,
      naCount: 0,
      overallStatus: 'pending',
      qualityScore: 0,
    },
    attachments: [],
    ...existingData,
  });

  // Initialize auto-save
  const { 
    saveData, 
    loadDraft, 
    markAsSubmitted, 
    isDraft, 
    lastSaved 
  } = useAutoSave({
    collection: 'qc_checklists',
    documentId: checklistId,
    data: qcData,
    debounceMs: 800,
    enabled: !isSubmitted
  });

  // Load existing draft on component mount
  useEffect(() => {
    const loadExistingDraft = async () => {
      try {
        const draft = await loadDraft();
        if (draft) {
          setQcData(draft.qcData || qcData);
          setIsSubmitted(draft.status === 'submitted');
          
          toast({
            title: "Draft Loaded",
            description: "Resuming your previous QC checklist",
          });
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    };

    loadExistingDraft();
  }, []);

  // Update basic info
  const updateBasicInfo = (field: string, value: string) => {
    if (isSubmitted) return;
    setQcData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, [field]: value }
    }));
  };

  // Update check item
  const updateCheckItem = (id: string, updates: Partial<QCCheckItem>) => {
    if (isSubmitted) return;
    setQcData(prev => ({
      ...prev,
      checkItems: prev.checkItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalChecks = qcData.checkItems.length;
    const passCount = qcData.checkItems.filter(item => item.status === 'pass').length;
    const failCount = qcData.checkItems.filter(item => item.status === 'fail').length;
    const naCount = qcData.checkItems.filter(item => item.status === 'na').length;
    
    const applicableChecks = totalChecks - naCount;
    const qualityScore = applicableChecks > 0 ? Math.round((passCount / applicableChecks) * 100) : 0;
    
    const criticalFailures = qcData.checkItems.filter(
      item => item.status === 'fail' && item.severity === 'critical'
    ).length;
    
    const overallStatus = criticalFailures > 0 || qualityScore < 70 ? 'fail' : 
                         passCount === applicableChecks ? 'pass' : 'pending';

    return {
      totalChecks,
      passCount,
      failCount,
      naCount,
      overallStatus,
      qualityScore,
    };
  };

  // Submit QC checklist
  const submitChecklist = async () => {
    try {
      const summary = calculateSummary();
      const finalData = {
        ...qcData,
        summary,
        submittedAt: new Date(),
      };

      await markAsSubmitted();
      setIsSubmitted(true);
      
      if (onSave) {
        onSave(finalData);
      }

      toast({
        title: 'QC Checklist Submitted',
        description: 'Quality inspection has been saved and locked',
      });

    } catch (error) {
      console.error('Error submitting checklist:', error);
      toast({
        title: 'Submit Error',
        description: 'Failed to submit checklist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = (itemId: string, file: File) => {
    if (isSubmitted) return;
    
    setQcData(prev => ({
      ...prev,
      checkItems: prev.checkItems.map(item =>
        item.id === itemId 
          ? { ...item, evidence: [...item.evidence, file] }
          : item
      )
    }));
    
    toast({
      title: "Evidence Added",
      description: `${file.name} uploaded for check item`,
    });
  };

  const getStageTitle = (stage: string) => {
    const titles = {
      bazaar: 'Bazaar Inspection',
      binding: 'Binding Process',
      clipping_finishing: 'Clipping & Finishing',
      final_inspection: 'Final Inspection',
    };
    return titles[stage] || 'Quality Inspection';
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      {/* Header with Auto-save Status */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            {getStageTitle(stage)} - QC Checklist
          </h3>
          <p className="text-sm text-gray-600">Quality Control - #{checklistId.slice(-8)}</p>
        </div>
        
        <div className="flex gap-2 items-center">
          {/* Auto-save Status */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {isSubmitted ? (
              <>
                <Lock className="h-4 w-4 text-red-500" />
                <span className="text-red-600">Submitted & Locked</span>
              </>
            ) : isDraft ? (
              <>
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Auto-saving...</span>
                {lastSaved && (
                  <span className="text-xs">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </>
            ) : null}
          </div>
          
          {/* Quality Score */}
          <Badge 
            variant={summary.qualityScore >= 90 ? "default" : summary.qualityScore >= 70 ? "secondary" : "destructive"}
            className={summary.qualityScore >= 90 ? 'bg-green-600' : ''}
          >
            Score: {summary.qualityScore}%
          </Badge>
          
          {/* Action Buttons */}
          {!isSubmitted && (
            <Button 
              onClick={submitChecklist}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Submit Checklist
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-900">Inspection Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="opsNumber">OPS Number</Label>
            <Input
              id="opsNumber"
              value={qcData.basicInfo.opsNumber}
              onChange={(e) => updateBasicInfo('opsNumber', e.target.value)}
              placeholder="Enter OPS number"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <Label htmlFor="carpetNumber">Carpet Number</Label>
            <Input
              id="carpetNumber"
              value={qcData.basicInfo.carpetNumber}
              onChange={(e) => updateBasicInfo('carpetNumber', e.target.value)}
              placeholder="Enter carpet number"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <Label htmlFor="designName">Design Name</Label>
            <Input
              id="designName"
              value={qcData.basicInfo.designName}
              onChange={(e) => updateBasicInfo('designName', e.target.value)}
              placeholder="Enter design name"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <Label htmlFor="construction">Construction</Label>
            <Input
              id="construction"
              value={qcData.basicInfo.construction}
              onChange={(e) => updateBasicInfo('construction', e.target.value)}
              placeholder="Enter construction type"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              value={qcData.basicInfo.size}
              onChange={(e) => updateBasicInfo('size', e.target.value)}
              placeholder="Enter size"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <Label htmlFor="contractor">Contractor</Label>
            <Input
              id="contractor"
              value={qcData.basicInfo.contractor}
              onChange={(e) => updateBasicInfo('contractor', e.target.value)}
              placeholder="Enter contractor name"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <Label htmlFor="inspector">Inspector</Label>
            <Input
              id="inspector"
              value={qcData.basicInfo.inspector}
              onChange={(e) => updateBasicInfo('inspector', e.target.value)}
              placeholder="Enter inspector name"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <Label htmlFor="inspectionDate">Inspection Date</Label>
            <Input
              id="inspectionDate"
              type="date"
              value={qcData.basicInfo.inspectionDate}
              onChange={(e) => updateBasicInfo('inspectionDate', e.target.value)}
              disabled={isSubmitted}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quality Check Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-900">Quality Check Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {qcData.checkItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <Badge variant="outline" className="mb-2">{item.category}</Badge>
                  <h4 className="font-medium">{item.checkPoint}</h4>
                </div>
                <div className="flex gap-2">
                  <Badge 
                    variant={item.severity === 'critical' ? 'destructive' : item.severity === 'major' ? 'secondary' : 'outline'}
                  >
                    {item.severity.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant={item.status === 'pass' ? 'default' : item.status === 'fail' ? 'destructive' : 'secondary'}
                    className={item.status === 'pass' ? 'bg-green-600' : ''}
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Status</Label>
                  <Select 
                    value={item.status} 
                    onValueChange={(value) => updateCheckItem(item.id, { status: value as any })}
                    disabled={isSubmitted}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="fail">Fail</SelectItem>
                      <SelectItem value="na">N/A</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm">Severity</Label>
                  <Select 
                    value={item.severity} 
                    onValueChange={(value) => updateCheckItem(item.id, { severity: value as any })}
                    disabled={isSubmitted}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-sm">Remarks</Label>
                <Textarea
                  value={item.remarks}
                  onChange={(e) => updateCheckItem(item.id, { remarks: e.target.value })}
                  placeholder="Add detailed remarks"
                  rows={2}
                  disabled={isSubmitted}
                />
              </div>

              {item.status === 'fail' && (
                <div>
                  <Label className="text-sm">Corrective Action</Label>
                  <Textarea
                    value={item.corrective_action || ''}
                    onChange={(e) => updateCheckItem(item.id, { corrective_action: e.target.value })}
                    placeholder="Describe corrective action required"
                    rows={2}
                    disabled={isSubmitted}
                  />
                </div>
              )}
              
              <div>
                <Label className="text-sm">Evidence</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(item.id, file);
                    }}
                    className="hidden"
                    id={`evidence-${item.id}`}
                    disabled={isSubmitted}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`evidence-${item.id}`)?.click()}
                    className="flex items-center gap-1"
                    disabled={isSubmitted}
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({ title: "Info", description: "Camera functionality coming soon" });
                    }}
                    className="flex items-center gap-1"
                    disabled={isSubmitted}
                  >
                    <Camera className="h-3 w-3" />
                    Camera
                  </Button>
                  {item.evidence.length > 0 && (
                    <Badge variant="secondary" className="text-green-700">
                      ✓ {item.evidence.length} file(s)
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-900">Inspection Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.totalChecks}</div>
            <div className="text-sm text-gray-600">Total Checks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.passCount}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.failCount}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{summary.naCount}</div>
            <div className="text-sm text-gray-600">N/A</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${summary.qualityScore >= 90 ? 'text-green-600' : summary.qualityScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
              {summary.qualityScore}%
            </div>
            <div className="text-sm text-gray-600">Quality Score</div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {!isSubmitted && (
          <Button onClick={submitChecklist} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Submit QC Checklist
          </Button>
        )}
      </div>
    </div>
  );
};