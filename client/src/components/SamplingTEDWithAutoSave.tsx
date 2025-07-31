import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { useAutoSave, useAutoSaveId } from '../hooks/useAutoSave';
import { Clock, Lock, CheckCircle, Save, Palette, Upload, Camera, Plus, Minus } from 'lucide-react';

interface MaterialSpec {
  id: string;
  name: string;
  type: 'warp' | 'weft';
  gsm: string;
  rate: string;
  total: string;
}

interface ProcessCost {
  id: string;
  name: string;
  cost: string;
}

interface TEDFormData {
  basicInfo: {
    designName: string;
    construction: string;
    buyer: string;
    carpetNumber: string;
    finishedSize: string;
    finishedGSM: string;
    unfinishedGSM: string;
    createdBy: string;
  };
  materialSpecs: MaterialSpec[];
  processCosts: ProcessCost[];
  finishingDetails: {
    washType: string;
    shadeCard: string;
    specialInstructions: string;
  };
  costCalculation: {
    overhead: string;
    profit: string;
    finalCostPSM: string;
    currency: 'INR' | 'USD';
  };
  attachments: File[];
}

interface SamplingTEDWithAutoSaveProps {
  onSave?: (data: TEDFormData) => void;
  onCancel?: () => void;
  existingData?: Partial<TEDFormData>;
}

export const SamplingTEDWithAutoSave: React.FC<SamplingTEDWithAutoSaveProps> = ({
  onSave,
  onCancel,
  existingData
}) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Generate unique document ID for this TED
  const generateId = useAutoSaveId('sampling_ted');
  const [tedId] = useState(() => generateId());

  // Initialize form data
  const [tedData, setTedData] = useState<TEDFormData>({
    basicInfo: {
      designName: '',
      construction: '',
      buyer: '',
      carpetNumber: '',
      finishedSize: '',
      finishedGSM: '',
      unfinishedGSM: '',
      createdBy: '',
    },
    materialSpecs: [
      { id: '1', name: '', type: 'warp', gsm: '', rate: '', total: '' },
    ],
    processCosts: [
      { id: '1', name: 'Weaving', cost: '' },
      { id: '2', name: 'Finishing', cost: '' },
    ],
    finishingDetails: {
      washType: '',
      shadeCard: '',
      specialInstructions: '',
    },
    costCalculation: {
      overhead: '5',
      profit: '15',
      finalCostPSM: '',
      currency: 'INR',
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
    collection: 'sampling_teds',
    documentId: tedId,
    data: tedData,
    debounceMs: 800,
    enabled: !isSubmitted
  });

  // Load existing draft on component mount
  useEffect(() => {
    const loadExistingDraft = async () => {
      try {
        const draft = await loadDraft();
        if (draft) {
          setTedData(draft.tedData || tedData);
          setIsSubmitted(draft.status === 'submitted');
          
          toast({
            title: "Draft Loaded",
            description: "Resuming your previous TED form",
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
    setTedData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, [field]: value }
    }));
  };

  // Update material spec
  const updateMaterialSpec = (id: string, updates: Partial<MaterialSpec>) => {
    if (isSubmitted) return;
    setTedData(prev => ({
      ...prev,
      materialSpecs: prev.materialSpecs.map(spec =>
        spec.id === id ? { ...spec, ...updates } : spec
      )
    }));
  };

  // Add material spec
  const addMaterialSpec = () => {
    if (isSubmitted) return;
    const newId = (tedData.materialSpecs.length + 1).toString();
    setTedData(prev => ({
      ...prev,
      materialSpecs: [...prev.materialSpecs, { 
        id: newId, 
        name: '', 
        type: 'warp', 
        gsm: '', 
        rate: '', 
        total: '' 
      }]
    }));
  };

  // Remove material spec
  const removeMaterialSpec = (id: string) => {
    if (isSubmitted || tedData.materialSpecs.length <= 1) return;
    setTedData(prev => ({
      ...prev,
      materialSpecs: prev.materialSpecs.filter(spec => spec.id !== id)
    }));
  };

  // Update process cost
  const updateProcessCost = (id: string, updates: Partial<ProcessCost>) => {
    if (isSubmitted) return;
    setTedData(prev => ({
      ...prev,
      processCosts: prev.processCosts.map(cost =>
        cost.id === id ? { ...cost, ...updates } : cost
      )
    }));
  };

  // Update finishing details
  const updateFinishingDetails = (field: string, value: string) => {
    if (isSubmitted) return;
    setTedData(prev => ({
      ...prev,
      finishingDetails: { ...prev.finishingDetails, [field]: value }
    }));
  };

  // Update cost calculation
  const updateCostCalculation = (field: string, value: string) => {
    if (isSubmitted) return;
    setTedData(prev => ({
      ...prev,
      costCalculation: { ...prev.costCalculation, [field]: value }
    }));
  };

  // Calculate final cost
  const calculateFinalCost = () => {
    const materialTotal = tedData.materialSpecs.reduce((sum, spec) => 
      sum + (parseFloat(spec.total) || 0), 0
    );
    const processTotal = tedData.processCosts.reduce((sum, cost) => 
      sum + (parseFloat(cost.cost) || 0), 0
    );
    
    const subtotal = materialTotal + processTotal;
    const overhead = subtotal * (parseFloat(tedData.costCalculation.overhead) / 100);
    const profit = (subtotal + overhead) * (parseFloat(tedData.costCalculation.profit) / 100);
    
    return subtotal + overhead + profit;
  };

  // Submit TED form
  const submitTED = async () => {
    try {
      const finalCost = calculateFinalCost();
      const finalData = {
        ...tedData,
        costCalculation: {
          ...tedData.costCalculation,
          finalCostPSM: finalCost.toFixed(2),
        },
        submittedAt: new Date(),
      };

      await markAsSubmitted();
      setIsSubmitted(true);
      
      if (onSave) {
        onSave(finalData);
      }

      toast({
        title: 'TED Submitted',
        description: 'Technical Engineering Document has been saved and locked',
      });

    } catch (error) {
      console.error('Error submitting TED:', error);
      toast({
        title: 'Submit Error',
        description: 'Failed to submit TED. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = (file: File) => {
    if (isSubmitted) return;
    setTedData(prev => ({
      ...prev,
      attachments: [...prev.attachments, file]
    }));
    toast({
      title: "File Added",
      description: `${file.name} uploaded successfully`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Auto-save Status */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            Technical Engineering Document (TED)
          </h3>
          <p className="text-sm text-gray-600">Sampling Department - TED #{tedId.slice(-8)}</p>
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
          
          {/* Action Buttons */}
          {!isSubmitted && (
            <Button 
              onClick={submitTED}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Submit TED
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-purple-900">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="designName">Design Name</Label>
            <Input
              id="designName"
              value={tedData.basicInfo.designName}
              onChange={(e) => updateBasicInfo('designName', e.target.value)}
              placeholder="Enter design name"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <Label htmlFor="construction">Construction</Label>
            <Select 
              value={tedData.basicInfo.construction} 
              onValueChange={(value) => updateBasicInfo('construction', value)}
              disabled={isSubmitted}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select construction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hand Knotted">Hand Knotted</SelectItem>
                <SelectItem value="Hand Woven">Hand Woven</SelectItem>
                <SelectItem value="Hand Tufted">Hand Tufted</SelectItem>
                <SelectItem value="Handloom">Handloom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="buyer">Buyer</Label>
            <Input
              id="buyer"
              value={tedData.basicInfo.buyer}
              onChange={(e) => updateBasicInfo('buyer', e.target.value)}
              placeholder="Enter buyer name"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <Label htmlFor="carpetNumber">Carpet Number</Label>
            <Input
              id="carpetNumber"
              value={tedData.basicInfo.carpetNumber}
              onChange={(e) => updateBasicInfo('carpetNumber', e.target.value)}
              placeholder="Enter carpet number"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <Label htmlFor="finishedSize">Finished Size</Label>
            <Input
              id="finishedSize"
              value={tedData.basicInfo.finishedSize}
              onChange={(e) => updateBasicInfo('finishedSize', e.target.value)}
              placeholder="e.g., 6x9 ft"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <Label htmlFor="createdBy">Created By</Label>
            <Input
              id="createdBy"
              value={tedData.basicInfo.createdBy}
              onChange={(e) => updateBasicInfo('createdBy', e.target.value)}
              placeholder="Enter creator name"
              disabled={isSubmitted}
            />
          </div>
        </CardContent>
      </Card>

      {/* Material Specifications */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-purple-900">Material Specifications</CardTitle>
            {!isSubmitted && (
              <Button onClick={addMaterialSpec} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Material
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tedData.materialSpecs.map((spec) => (
            <div key={spec.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Material {spec.id}</h4>
                {tedData.materialSpecs.length > 1 && !isSubmitted && (
                  <Button 
                    onClick={() => removeMaterialSpec(spec.id)} 
                    size="sm" 
                    variant="outline"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <Label className="text-sm">Material Name</Label>
                  <Input
                    value={spec.name}
                    onChange={(e) => updateMaterialSpec(spec.id, { name: e.target.value })}
                    placeholder="Enter material name"
                    disabled={isSubmitted}
                  />
                </div>
                
                <div>
                  <Label className="text-sm">Type</Label>
                  <Select 
                    value={spec.type} 
                    onValueChange={(value) => updateMaterialSpec(spec.id, { type: value as any })}
                    disabled={isSubmitted}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warp">Warp</SelectItem>
                      <SelectItem value="weft">Weft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm">GSM</Label>
                  <Input
                    value={spec.gsm}
                    onChange={(e) => updateMaterialSpec(spec.id, { gsm: e.target.value })}
                    placeholder="Enter GSM"
                    disabled={isSubmitted}
                  />
                </div>
                
                <div>
                  <Label className="text-sm">Rate (₹)</Label>
                  <Input
                    value={spec.rate}
                    onChange={(e) => updateMaterialSpec(spec.id, { rate: e.target.value })}
                    placeholder="Enter rate"
                    disabled={isSubmitted}
                  />
                </div>
                
                <div>
                  <Label className="text-sm">Total (₹)</Label>
                  <Input
                    value={spec.total}
                    onChange={(e) => updateMaterialSpec(spec.id, { total: e.target.value })}
                    placeholder="Enter total"
                    disabled={isSubmitted}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Process Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-purple-900">Process Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tedData.processCosts.map((cost) => (
            <div key={cost.id} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Process Name</Label>
                <Input
                  value={cost.name}
                  onChange={(e) => updateProcessCost(cost.id, { name: e.target.value })}
                  placeholder="Enter process name"
                  disabled={isSubmitted}
                />
              </div>
              <div>
                <Label className="text-sm">Cost (₹)</Label>
                <Input
                  value={cost.cost}
                  onChange={(e) => updateProcessCost(cost.id, { cost: e.target.value })}
                  placeholder="Enter cost"
                  disabled={isSubmitted}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cost Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-purple-900">Cost Calculation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm">Overhead (%)</Label>
            <Input
              value={tedData.costCalculation.overhead}
              onChange={(e) => updateCostCalculation('overhead', e.target.value)}
              placeholder="Enter overhead %"
              disabled={isSubmitted}
            />
          </div>
          <div>
            <Label className="text-sm">Profit (%)</Label>
            <Input
              value={tedData.costCalculation.profit}
              onChange={(e) => updateCostCalculation('profit', e.target.value)}
              placeholder="Enter profit %"
              disabled={isSubmitted}
            />
          </div>
          <div>
            <Label className="text-sm">Currency</Label>
            <Select 
              value={tedData.costCalculation.currency} 
              onValueChange={(value) => updateCostCalculation('currency', value)}
              disabled={isSubmitted}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Final Cost PSM</Label>
            <div className="p-2 bg-gray-50 rounded border font-medium">
              {tedData.costCalculation.currency === 'INR' ? '₹' : '$'}{calculateFinalCost().toFixed(2)}
            </div>
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
          <Button onClick={submitTED} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Submit TED
          </Button>
        )}
      </div>
    </div>
  );
};