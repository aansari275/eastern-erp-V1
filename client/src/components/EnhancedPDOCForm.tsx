import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  FileText, 
  Package, 
  TestTube, 
  Upload, 
  File, 
  X, 
  Save, 
  Plus, 
  Edit, 
  Trash2,
  Loader,
  CheckCircle
} from 'lucide-react';

interface EnhancedPDOCFormProps {
  pdoc?: any;
  onSave?: () => void;
}

interface FileUpload {
  file: File;
  name: string;
  type: string;
  uploadedUrl?: string;
  isUploading?: boolean;
}

interface TestReport {
  id?: number;
  versionNo: string;
  testReportNo?: string;
  issueDate?: string;
  expirationDate?: string;
  testedByLab?: string;
  testResult?: string;
  testType?: string;
  uploadedFileUrl?: string;
  ocrExtractedData?: any;
  isUploading?: boolean;
}

interface DWP {
  id?: number;
  dwpVersion: string;
  primaryPackagingType?: string;
  primaryPackagingDimensions?: string;
  primaryPackagingMaterial?: string;
  masterCartonType?: string;
  masterCartonDimensions?: string;
  masterCartonMaterial?: string;
  unitWeightProduct?: number;
  unitWeightPackaged?: number;
  masterCartonWeightGross?: number;
  palletizationInfo?: string;
}

const EnhancedPDOCForm: React.FC<EnhancedPDOCFormProps> = ({ pdoc, onSave }) => {
  const [activeTab, setActiveTab] = useState('requirements');
  const [formData, setFormData] = useState({
    pdocNumber: '',
    buyerId: '',
    buyerProductDesignCode: '',
    ted: '',
    productType: '',
    pdocStatus: 'draft',
    productTestRequirements: '',
    callouts: '',
    ctq: '',
    sizeTolerance: '',
    weightTolerance: '',
    buyerEmailCommunication: '',
    ppmNotes: '',
    communicationFiles: '',
    notesFiles: '',
  });

  const [communicationFiles, setCommunicationFiles] = useState<FileUpload[]>([]);
  const [testReports, setTestReports] = useState<TestReport[]>([]);
  const [dwps, setDwps] = useState<DWP[]>([]);
  const [editingTestReport, setEditingTestReport] = useState<TestReport | null>(null);
  const [editingDwp, setEditingDwp] = useState<DWP | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const testFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pdoc) {
      setFormData({
        pdocNumber: pdoc.pdocNumber || '',
        buyerId: pdoc.buyerId?.toString() || '',
        buyerProductDesignCode: pdoc.buyerProductDesignCode || '',
        ted: pdoc.ted || '',
        productType: pdoc.productType || '',
        pdocStatus: pdoc.pdocStatus || 'draft',
        productTestRequirements: pdoc.productTestRequirements || '',
        callouts: pdoc.callouts || '',
        ctq: pdoc.ctq || '',
        sizeTolerance: pdoc.sizeTolerance || '',
        weightTolerance: pdoc.weightTolerance || '',
        buyerEmailCommunication: pdoc.buyerEmailCommunication || '',
        ppmNotes: pdoc.ppmNotes || '',
        communicationFiles: pdoc.communicationFiles || '',
        notesFiles: pdoc.notesFiles || '',
      });
      
      // Load associated data
      if (pdoc.id) {
        fetchTestReports();
        fetchDwps();
      }
    }
  }, [pdoc]);

  const fetchTestReports = async () => {
    try {
      const response = await fetch(`/api/pdocs/${pdoc.id}/test-reports`);
      if (response.ok) {
        const data = await response.json();
        setTestReports(data);
      }
    } catch (error) {
      console.error('Error fetching test reports:', error);
    }
  };

  const fetchDwps = async () => {
    try {
      const response = await fetch(`/api/pdocs/${pdoc.id}/dwp`);
      if (response.ok) {
        const data = await response.json();
        setDwps(data);
      }
    } catch (error) {
      console.error('Error fetching DWPs:', error);
    }
  };

  // File upload function for communication files
  const uploadCommunicationFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/communication', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const result = await response.json();
    return result.url;
  };

  // File upload function for test reports with OCR
  const uploadTestReportWithOCR = async (file: File): Promise<{ url: string; ocrData: any }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/test-report', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Test report upload failed');
    }

    const result = await response.json();
    return { url: result.url, ocrData: result.ocrData };
  };

  const handleFileUpload = async (files: FileList | null, type: 'communication' | 'test') => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const newFile: FileUpload = {
      file,
      name: file.name,
      type: file.type,
      isUploading: true
    };

    if (type === 'communication') {
      setCommunicationFiles(prev => [...prev, newFile]);
    }

    try {
      if (type === 'communication') {
        const uploadedUrl = await uploadCommunicationFile(file);
        setCommunicationFiles(prev =>
          prev.map(f => f.name === file.name ? { ...f, uploadedUrl, isUploading: false } : f)
        );
        toast({
          title: 'File Uploaded',
          description: 'Communication file uploaded successfully.',
        });
      } else if (type === 'test') {
        // Handle test report with OCR
        const { url: uploadedUrl, ocrData } = await uploadTestReportWithOCR(file);
        
        const newTestReport: TestReport = {
          versionNo: `V${testReports.length + 1}.0`,
          testReportNo: ocrData.reportNo,
          issueDate: ocrData.issueDate,
          testedByLab: ocrData.testedByLab,
          testResult: ocrData.testResult,
          testType: ocrData.testType,
          uploadedFileUrl: uploadedUrl,
          ocrExtractedData: ocrData,
          isUploading: false
        };
        
        setTestReports(prev => [...prev, newTestReport]);
        toast({
          title: 'Test Report Uploaded',
          description: 'OCR processing completed. Fields auto-populated.',
        });
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const saveTestReport = async (testReport: TestReport) => {
    try {
      const isEdit = testReport.id;
      const url = isEdit ? `/api/test-reports/${testReport.id}` : '/api/test-reports';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? testReport : { 
          ...testReport, 
          pdocId: pdoc?.id,
          internalReviewStatus: 'under_review'
        }),
      });

      if (response.ok) {
        await fetchTestReports();
        setEditingTestReport(null);
        toast({ title: `Test report ${isEdit ? 'updated' : 'created'} successfully` });
      }
    } catch (error) {
      toast({ title: 'Error saving test report', variant: 'destructive' });
    }
  };

  const saveDwp = async (dwp: DWP) => {
    try {
      const isEdit = dwp.id;
      const url = isEdit ? `/api/dwp/${dwp.id}` : '/api/dwp';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? dwp : { ...dwp, pdocId: pdoc?.id }),
      });

      if (response.ok) {
        await fetchDwps();
        setEditingDwp(null);
        toast({ title: `DWP ${isEdit ? 'updated' : 'created'} successfully` });
      }
    } catch (error) {
      toast({ title: 'Error saving DWP', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = pdoc ? `/api/pdocs/${pdoc.id}` : '/api/pdocs';
      const method = pdoc ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          communicationFiles: communicationFiles.map(f => f.uploadedUrl).filter(Boolean).join(','),
        }),
      });

      if (response.ok) {
        toast({
          title: `PDOC ${pdoc ? 'Updated' : 'Created'} Successfully`,
          description: `PDOC has been ${pdoc ? 'updated' : 'created'}.`,
        });
        onSave?.();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${pdoc ? 'update' : 'create'} PDOC.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {pdoc ? 'Edit PDOC' : 'Create New PDOC'}
        </h2>
        <Badge variant={formData.pdocStatus === 'approved' ? 'default' : 'secondary'}>
          {formData.pdocStatus}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requirements" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Product Requirements
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing (CONNECT)
          </TabsTrigger>
          <TabsTrigger value="dwp" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            DWP
          </TabsTrigger>
        </TabsList>

        {/* Product Requirements Tab */}
        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pdocNumber">PDOC Number *</Label>
                <Input
                  id="pdocNumber"
                  value={formData.pdocNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, pdocNumber: e.target.value }))}
                  placeholder="e.g., PDOC-2025-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="buyerProductDesignCode">Buyer Product Design Code</Label>
                <Input
                  id="buyerProductDesignCode"
                  value={formData.buyerProductDesignCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyerProductDesignCode: e.target.value }))}
                  placeholder="e.g., A02/EM-25-MA-2502"
                />
              </div>
              <div>
                <Label htmlFor="productType">Product Type</Label>
                <Select 
                  value={formData.productType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, productType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="domestic">Domestic</SelectItem>
                    <SelectItem value="sample">Sample</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pdocStatus">Status</Label>
                <Select 
                  value={formData.pdocStatus} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, pdocStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ted">Technical Description (TED)</Label>
                <Textarea
                  id="ted"
                  value={formData.ted}
                  onChange={(e) => setFormData(prev => ({ ...prev, ted: e.target.value }))}
                  placeholder="Detailed technical description..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sizeTolerance">Size Tolerance</Label>
                  <Input
                    id="sizeTolerance"
                    value={formData.sizeTolerance}
                    onChange={(e) => setFormData(prev => ({ ...prev, sizeTolerance: e.target.value }))}
                    placeholder="e.g., ±3%"
                  />
                </div>
                <div>
                  <Label htmlFor="weightTolerance">Weight Tolerance</Label>
                  <Input
                    id="weightTolerance"
                    value={formData.weightTolerance}
                    onChange={(e) => setFormData(prev => ({ ...prev, weightTolerance: e.target.value }))}
                    placeholder="e.g., ±5%"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ctq">Critical to Quality (CTQ)</Label>
                <Textarea
                  id="ctq"
                  value={formData.ctq}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctq: e.target.value }))}
                  placeholder="Critical quality parameters..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="buyerEmailCommunication">Buyer Email Communication</Label>
                <Textarea
                  id="buyerEmailCommunication"
                  value={formData.buyerEmailCommunication}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyerEmailCommunication: e.target.value }))}
                  placeholder="Key email communications..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="ppmNotes">PPM Notes</Label>
                <Textarea
                  id="ppmNotes"
                  value={formData.ppmNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, ppmNotes: e.target.value }))}
                  placeholder="Pre-production meeting notes..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Communication Files</Label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Communication Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => handleFileUpload(e.target.files, 'communication')}
                    className="hidden"
                  />
                  {communicationFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                        {file.isUploading && <Loader className="h-4 w-4 animate-spin" />}
                        {file.uploadedUrl && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setCommunicationFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Test Reports</CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => testFileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Test Report
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setEditingTestReport({ versionNo: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Manual
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <input
                ref={testFileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e.target.files, 'test')}
                className="hidden"
              />
              
              {editingTestReport && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>{editingTestReport.id ? 'Edit Test Report' : 'New Test Report'}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Version Number *</Label>
                      <Input
                        value={editingTestReport.versionNo}
                        onChange={(e) => setEditingTestReport({...editingTestReport, versionNo: e.target.value})}
                        placeholder="e.g., V1.0"
                      />
                    </div>
                    <div>
                      <Label>Test Report Number</Label>
                      <Input
                        value={editingTestReport.testReportNo || ''}
                        onChange={(e) => setEditingTestReport({...editingTestReport, testReportNo: e.target.value})}
                        placeholder="e.g., GR:TX:1641043086-A"
                      />
                    </div>
                    <div>
                      <Label>Issue Date</Label>
                      <Input
                        type="date"
                        value={editingTestReport.issueDate || ''}
                        onChange={(e) => setEditingTestReport({...editingTestReport, issueDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Tested By Lab</Label>
                      <Input
                        value={editingTestReport.testedByLab || ''}
                        onChange={(e) => setEditingTestReport({...editingTestReport, testedByLab: e.target.value})}
                        placeholder="e.g., SGS India Pvt. Ltd."
                      />
                    </div>
                    <div>
                      <Label>Test Type</Label>
                      <Select
                        value={editingTestReport.testType || ''}
                        onValueChange={(value) => setEditingTestReport({...editingTestReport, testType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="physical">Physical Tests</SelectItem>
                          <SelectItem value="flammability">Flammability</SelectItem>
                          <SelectItem value="colorfastness">Colorfastness</SelectItem>
                          <SelectItem value="chemical">Chemical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Test Result</Label>
                      <Select
                        value={editingTestReport.testResult || ''}
                        onValueChange={(value) => setEditingTestReport({...editingTestReport, testResult: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pass">Pass</SelectItem>
                          <SelectItem value="Fail">Fail</SelectItem>
                          <SelectItem value="Conditional Pass">Conditional Pass</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <Button type="button" onClick={() => saveTestReport(editingTestReport)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingTestReport(null)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {testReports.map((report, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{report.versionNo} - {report.testType}</h4>
                          <p className="text-sm text-gray-600">{report.testReportNo}</p>
                          <p className="text-sm text-gray-500">Lab: {report.testedByLab}</p>
                          <Badge variant={report.testResult === 'Pass' ? 'default' : 'destructive'}>
                            {report.testResult}
                          </Badge>
                          {report.ocrExtractedData && (
                            <div className="mt-2 text-xs text-green-600">
                              ✓ OCR Data: Auto-populated from uploaded file
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingTestReport(report)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {testReports.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No test reports yet. Upload a PDF or add manually.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DWP Tab */}
        <TabsContent value="dwp" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Detail Working Procedure (DWP)</CardTitle>
                <Button
                  type="button"
                  onClick={() => setEditingDwp({ dwpVersion: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add DWP
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editingDwp && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>{editingDwp.id ? 'Edit DWP' : 'New DWP'}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>DWP Version *</Label>
                      <Input
                        value={editingDwp.dwpVersion}
                        onChange={(e) => setEditingDwp({...editingDwp, dwpVersion: e.target.value})}
                        placeholder="e.g., v1.0"
                      />
                    </div>
                    <div>
                      <Label>Primary Packaging Type</Label>
                      <Input
                        value={editingDwp.primaryPackagingType || ''}
                        onChange={(e) => setEditingDwp({...editingDwp, primaryPackagingType: e.target.value})}
                        placeholder="e.g., Box, Bag"
                      />
                    </div>
                    <div>
                      <Label>Primary Packaging Dimensions</Label>
                      <Input
                        value={editingDwp.primaryPackagingDimensions || ''}
                        onChange={(e) => setEditingDwp({...editingDwp, primaryPackagingDimensions: e.target.value})}
                        placeholder="L x W x H (cm)"
                      />
                    </div>
                    <div>
                      <Label>Unit Weight Product (kg)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingDwp.unitWeightProduct || ''}
                        onChange={(e) => setEditingDwp({...editingDwp, unitWeightProduct: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Palletization Information</Label>
                      <Textarea
                        value={editingDwp.palletizationInfo || ''}
                        onChange={(e) => setEditingDwp({...editingDwp, palletizationInfo: e.target.value})}
                        placeholder="Pallet specifications..."
                        rows={3}
                      />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <Button type="button" onClick={() => saveDwp(editingDwp)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingDwp(null)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {dwps.map((dwp, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{dwp.dwpVersion}</h4>
                          <p className="text-sm text-gray-600">{dwp.primaryPackagingType}</p>
                          <p className="text-sm text-gray-500">Weight: {dwp.unitWeightProduct} kg</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingDwp(dwp)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {dwps.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No DWP records yet. Click "Add DWP" to create one.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {pdoc ? 'Update PDOC' : 'Create PDOC'}
        </Button>
      </div>
    </form>
  );
};

export default EnhancedPDOCForm;