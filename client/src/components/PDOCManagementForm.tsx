import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { FileText, Package, TestTube, Tag, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface PDOCManagementFormProps {
  pdoc?: any;
}

interface DWP {
  id?: number;
  pdocId?: number;
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
  approvedPackagingPpt?: string;
  packagingArtwork?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TestReport {
  id?: number;
  pdocId?: number;
  versionNo: string;
  isCurrentVersion?: boolean;
  reportFile?: string;
  testType?: string;
  testReportNo?: string;
  issueDate?: string;
  expirationDate?: string;
  testedByLab?: string;
  testResult?: string;
  passFail?: string;
  internalReviewStatus?: string;
  reminderStatus?: string;
  ocrRawData?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LabelItem {
  id?: number;
  pdocId?: number;
  labelName: string;
  labelType?: string;
  labelSupplierName?: string;
  labelArtwork?: string;
  approvalStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

const PDOCManagementForm: React.FC<PDOCManagementFormProps> = ({ pdoc }) => {
  const [dwps, setDwps] = useState<DWP[]>([]);
  const [testReports, setTestReports] = useState<TestReport[]>([]);
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [editingDwp, setEditingDwp] = useState<DWP | null>(null);
  const [editingTestReport, setEditingTestReport] = useState<TestReport | null>(null);
  const [editingLabel, setEditingLabel] = useState<LabelItem | null>(null);
  const { toast } = useToast();

  // Fetch data when pdoc changes
  useEffect(() => {
    if (pdoc?.id) {
      fetchDwps();
      fetchTestReports();
      fetchLabels();
    }
  }, [pdoc?.id]);

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

  const fetchLabels = async () => {
    try {
      const response = await fetch(`/api/pdocs/${pdoc.id}/labels`);
      if (response.ok) {
        const data = await response.json();
        setLabels(data);
      }
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const saveDwp = async (dwpData: DWP) => {
    try {
      const isEdit = dwpData.id;
      const url = isEdit ? `/api/dwp/${dwpData.id}` : '/api/dwp';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? dwpData : { ...dwpData, pdocId: pdoc.id }),
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

  const saveTestReport = async (reportData: TestReport) => {
    try {
      const isEdit = reportData.id;
      const url = isEdit ? `/api/test-reports/${reportData.id}` : '/api/test-reports';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? reportData : { 
          ...reportData, 
          pdocId: pdoc.id,
          internalReviewStatus: 'under_review',
          reminderStatus: 'none'
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

  const saveLabel = async (labelData: LabelItem) => {
    try {
      const isEdit = labelData.id;
      const url = isEdit ? `/api/labels/${labelData.id}` : '/api/labels';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? labelData : { 
          ...labelData, 
          pdocId: pdoc.id,
          approvalStatus: 'pending'
        }),
      });

      if (response.ok) {
        await fetchLabels();
        setEditingLabel(null);
        toast({ title: `Label ${isEdit ? 'updated' : 'created'} successfully` });
      }
    } catch (error) {
      toast({ title: 'Error saving label', variant: 'destructive' });
    }
  };

  const deleteItem = async (type: 'dwp' | 'test-report' | 'label', id: number) => {
    try {
      const endpoints = {
        'dwp': `/api/dwp/${id}`,
        'test-report': `/api/test-reports/${id}`,
        'label': `/api/labels/${id}`
      };

      const response = await fetch(endpoints[type], { method: 'DELETE' });
      
      if (response.ok) {
        if (type === 'dwp') await fetchDwps();
        else if (type === 'test-report') await fetchTestReports();
        else await fetchLabels();
        
        toast({ title: `${type.replace('-', ' ')} deleted successfully` });
      }
    } catch (error) {
      toast({ title: `Error deleting ${type.replace('-', ' ')}`, variant: 'destructive' });
    }
  };

  if (!pdoc) {
    return (
      <div className="text-center text-gray-500 p-8">
        Select a PDOC from the list to view its management details
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">PDOC Management</h2>
        <Badge variant={pdoc.pdocStatus === 'approved' ? 'default' : 'secondary'}>
          {pdoc.pdocStatus}
        </Badge>
      </div>

      {/* Basic PDOC Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">PDOC Number</Label>
              <p className="mt-1 text-sm text-gray-900">{pdoc.pdocNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Buyer Product Design Code</Label>
              <p className="mt-1 text-sm text-gray-900">{pdoc.buyerProductDesignCode}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">TED</Label>
              <p className="mt-1 text-sm text-gray-900">{pdoc.ted}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Product Type</Label>
              <p className="mt-1 text-sm text-gray-900">{pdoc.productType}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Created Date</Label>
              <p className="mt-1 text-sm text-gray-900">{new Date(pdoc.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
              <p className="mt-1 text-sm text-gray-900">{new Date(pdoc.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for DWP, Test Reports, and Labels */}
      <Tabs defaultValue="dwp" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-gray-100 rounded-lg h-auto">
          <TabsTrigger value="dwp" className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 hover:bg-gray-50 transition-all duration-200">
            <Package className="h-4 w-4" />
            DWP ({dwps.length})
          </TabsTrigger>
          <TabsTrigger value="test-reports" className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 hover:bg-gray-50 transition-all duration-200">
            <TestTube className="h-4 w-4" />
            Test Reports ({testReports.length})
          </TabsTrigger>
          <TabsTrigger value="labels" className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 hover:bg-gray-50 transition-all duration-200">
            <Tag className="h-4 w-4" />
            Labels ({labels.length})
          </TabsTrigger>
        </TabsList>

        {/* DWP Tab */}
        <TabsContent value="dwp" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Detail Working Procedure (DWP)</h3>
            <Button onClick={() => setEditingDwp({ dwpVersion: '' })} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add DWP
            </Button>
          </div>

          {editingDwp && (
            <Card>
              <CardHeader>
                <CardTitle>{editingDwp.id ? 'Edit DWP' : 'New DWP'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dwpVersion">DWP Version *</Label>
                    <Input
                      id="dwpVersion"
                      value={editingDwp.dwpVersion || ''}
                      onChange={(e) => setEditingDwp({...editingDwp, dwpVersion: e.target.value})}
                      placeholder="e.g., v1.0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryPackagingType">Primary Packaging Type</Label>
                    <Input
                      id="primaryPackagingType"
                      value={editingDwp.primaryPackagingType || ''}
                      onChange={(e) => setEditingDwp({...editingDwp, primaryPackagingType: e.target.value})}
                      placeholder="e.g., Box, Bag, Vacuum Packed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryPackagingDimensions">Primary Packaging Dimensions</Label>
                    <Input
                      id="primaryPackagingDimensions"
                      value={editingDwp.primaryPackagingDimensions || ''}
                      onChange={(e) => setEditingDwp({...editingDwp, primaryPackagingDimensions: e.target.value})}
                      placeholder="L x W x H (cm)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryPackagingMaterial">Primary Packaging Material</Label>
                    <Input
                      id="primaryPackagingMaterial"
                      value={editingDwp.primaryPackagingMaterial || ''}
                      onChange={(e) => setEditingDwp({...editingDwp, primaryPackagingMaterial: e.target.value})}
                      placeholder="e.g., Cardboard, Plastic"
                    />
                  </div>
                  <div>
                    <Label htmlFor="masterCartonType">Master Carton Type</Label>
                    <Input
                      id="masterCartonType"
                      value={editingDwp.masterCartonType || ''}
                      onChange={(e) => setEditingDwp({...editingDwp, masterCartonType: e.target.value})}
                      placeholder="e.g., Single Wall, Double Wall"
                    />
                  </div>
                  <div>
                    <Label htmlFor="masterCartonDimensions">Master Carton Dimensions</Label>
                    <Input
                      id="masterCartonDimensions"
                      value={editingDwp.masterCartonDimensions || ''}
                      onChange={(e) => setEditingDwp({...editingDwp, masterCartonDimensions: e.target.value})}
                      placeholder="L x W x H (cm)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="unitWeightProduct">Unit Weight Product (kg)</Label>
                    <Input
                      id="unitWeightProduct"
                      type="number"
                      step="0.01"
                      value={editingDwp.unitWeightProduct || ''}
                      onChange={(e) => setEditingDwp({...editingDwp, unitWeightProduct: parseFloat(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitWeightPackaged">Unit Weight Packaged (kg)</Label>
                    <Input
                      id="unitWeightPackaged"
                      type="number"
                      step="0.01"
                      value={editingDwp.unitWeightPackaged || ''}
                      onChange={(e) => setEditingDwp({...editingDwp, unitWeightPackaged: parseFloat(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="masterCartonWeightGross">Master Carton Weight Gross (kg)</Label>
                    <Input
                      id="masterCartonWeightGross"
                      type="number"
                      step="0.01"
                      value={editingDwp.masterCartonWeightGross || ''}
                      onChange={(e) => setEditingDwp({...editingDwp, masterCartonWeightGross: parseFloat(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="palletizationInfo">Palletization Information</Label>
                  <Textarea
                    id="palletizationInfo"
                    value={editingDwp.palletizationInfo || ''}
                    onChange={(e) => setEditingDwp({...editingDwp, palletizationInfo: e.target.value})}
                    placeholder="Pallet specifications, stacking information, etc."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveDwp(editingDwp)} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingDwp(null)} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {dwps.map((dwp) => (
              <Card key={dwp.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{dwp.dwpVersion}</h4>
                      <p className="text-sm text-gray-600">{dwp.primaryPackagingType}</p>
                      <p className="text-xs text-gray-400">Created: {new Date(dwp.createdAt!).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingDwp(dwp)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem('dwp', dwp.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {dwps.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No DWP records found. Click "Add DWP" to create the first one.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Test Reports Tab */}
        <TabsContent value="test-reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Test Reports</h3>
            <Button onClick={() => setEditingTestReport({ versionNo: '' })} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Test Report
            </Button>
          </div>

          {editingTestReport && (
            <Card>
              <CardHeader>
                <CardTitle>{editingTestReport.id ? 'Edit Test Report' : 'New Test Report'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="versionNo">Version Number *</Label>
                    <Input
                      id="versionNo"
                      value={editingTestReport.versionNo || ''}
                      onChange={(e) => setEditingTestReport({...editingTestReport, versionNo: e.target.value})}
                      placeholder="e.g., V1.0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="testType">Test Type</Label>
                    <Select
                      value={editingTestReport.testType || ''}
                      onValueChange={(value) => setEditingTestReport({...editingTestReport, testType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flammability">Flammability</SelectItem>
                        <SelectItem value="colorfastness">Colorfastness</SelectItem>
                        <SelectItem value="physical">Physical Properties</SelectItem>
                        <SelectItem value="chemical">Chemical</SelectItem>
                        <SelectItem value="dimensional">Dimensional Stability</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="testReportNo">Test Report Number</Label>
                    <Input
                      id="testReportNo"
                      value={editingTestReport.testReportNo || ''}
                      onChange={(e) => setEditingTestReport({...editingTestReport, testReportNo: e.target.value})}
                      placeholder="e.g., TR-2025-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testedByLab">Tested By Lab</Label>
                    <Input
                      id="testedByLab"
                      value={editingTestReport.testedByLab || ''}
                      onChange={(e) => setEditingTestReport({...editingTestReport, testedByLab: e.target.value})}
                      placeholder="e.g., SGS, Intertek, BV"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={editingTestReport.issueDate || ''}
                      onChange={(e) => setEditingTestReport({...editingTestReport, issueDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={editingTestReport.expirationDate || ''}
                      onChange={(e) => setEditingTestReport({...editingTestReport, expirationDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="testResult">Test Result</Label>
                    <Select
                      value={editingTestReport.testResult || ''}
                      onValueChange={(value) => setEditingTestReport({...editingTestReport, testResult: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pass">Pass</SelectItem>
                        <SelectItem value="fail">Fail</SelectItem>
                        <SelectItem value="conditional_pass">Conditional Pass</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="internalReviewStatus">Internal Review Status</Label>
                    <Select
                      value={editingTestReport.internalReviewStatus || 'under_review'}
                      onValueChange={(value) => setEditingTestReport({...editingTestReport, internalReviewStatus: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="needs_revision">Needs Revision</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveTestReport(editingTestReport)} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTestReport(null)} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {testReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{report.versionNo} - {report.testType}</h4>
                      <p className="text-sm text-gray-600">{report.testReportNo}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={report.testResult === 'pass' ? 'default' : 'destructive'}>
                          {report.testResult}
                        </Badge>
                        <Badge variant="outline">
                          {report.internalReviewStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">Created: {new Date(report.createdAt!).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingTestReport(report)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem('test-report', report.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {testReports.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No test reports found. Click "Add Test Report" to create the first one.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Labels Tab */}
        <TabsContent value="labels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Labels</h3>
            <Button onClick={() => setEditingLabel({ labelName: '' })} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Label
            </Button>
          </div>

          {editingLabel && (
            <Card>
              <CardHeader>
                <CardTitle>{editingLabel.id ? 'Edit Label' : 'New Label'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="labelName">Label Name *</Label>
                    <Input
                      id="labelName"
                      value={editingLabel.labelName || ''}
                      onChange={(e) => setEditingLabel({...editingLabel, labelName: e.target.value})}
                      placeholder="e.g., Care Label, Brand Label"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="labelType">Label Type</Label>
                    <Select
                      value={editingLabel.labelType || ''}
                      onValueChange={(value) => setEditingLabel({...editingLabel, labelType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select label type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="care_label">Care Label</SelectItem>
                        <SelectItem value="brand_label">Brand Label</SelectItem>
                        <SelectItem value="composition_label">Composition Label</SelectItem>
                        <SelectItem value="size_label">Size Label</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="labelSupplierName">Supplier Name</Label>
                    <Input
                      id="labelSupplierName"
                      value={editingLabel.labelSupplierName || ''}
                      onChange={(e) => setEditingLabel({...editingLabel, labelSupplierName: e.target.value})}
                      placeholder="Label supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="approvalStatus">Approval Status</Label>
                    <Select
                      value={editingLabel.approvalStatus || 'pending'}
                      onValueChange={(value) => setEditingLabel({...editingLabel, approvalStatus: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="needs_revision">Needs Revision</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="labelArtwork">Label Artwork Details</Label>
                  <Textarea
                    id="labelArtwork"
                    value={editingLabel.labelArtwork || ''}
                    onChange={(e) => setEditingLabel({...editingLabel, labelArtwork: e.target.value})}
                    placeholder="Artwork specifications, colors, dimensions, etc."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveLabel(editingLabel)} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingLabel(null)} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {labels.map((label) => (
              <Card key={label.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{label.labelName}</h4>
                      <p className="text-sm text-gray-600">{label.labelType}</p>
                      <p className="text-sm text-gray-500">{label.labelSupplierName}</p>
                      <Badge variant={label.approvalStatus === 'approved' ? 'default' : 'secondary'} className="mt-1">
                        {label.approvalStatus}
                      </Badge>
                      <p className="text-xs text-gray-400">Created: {new Date(label.createdAt!).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingLabel(label)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem('label', label.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {labels.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No labels found. Click "Add Label" to create the first one.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PDOCManagementForm;