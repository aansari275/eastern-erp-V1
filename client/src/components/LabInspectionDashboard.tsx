import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { 
  Plus, 
  FileText, 
  Eye, 
  Download, 
  Edit, 
  Clock,
  Calendar,
  CheckCircle,
  Search,
  AlertTriangle,
  Trash2,
  Check,
  Tag
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import EscalationDialog from './EscalationDialog';
import DynamicLabInspectionForm from './DynamicLabInspectionForm';

interface LabInspectionDashboardProps {
  selectedCompany: 'EHI' | 'EMPL';
}

export function LabInspectionDashboard({ selectedCompany }: LabInspectionDashboardProps) {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [editingInspectionId, setEditingInspectionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inspections, setInspections] = useState<any[]>([]);
  const [draftInspections, setDraftInspections] = useState<any[]>([]);
  const [submittedInspections, setSubmittedInspections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [isDeletingDrafts, setIsDeletingDrafts] = useState(false);

  // Filter data by company and search term
  const companyInspections = inspections.filter(inspection => 
    inspection.company === selectedCompany &&
    (inspection.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     inspection.challanInvoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const companyDraftInspections = draftInspections.filter(inspection => inspection.company === selectedCompany);
  const companySubmittedInspections = submittedInspections.filter(inspection => inspection.company === selectedCompany);

  // Fetch lab inspections
  const fetchInspections = async () => {
    try {
      setIsLoading(true);
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/lab-inspections'
        : '/api/lab-inspections';
        
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const drafts = data.filter(insp => insp.status === 'draft');
        const submitted = data.filter(insp => insp.status === 'submitted');
        
        setInspections(data);
        setDraftInspections(drafts);
        setSubmittedInspections(submitted);
      }
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lab inspections.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleViewInspection = (inspectionId: string) => {
    console.log('Viewing inspection:', inspectionId);
    setEditingInspectionId(inspectionId);
    setShowInspectionForm(true);
  };

  const handleCloseInspectionForm = () => {
    setShowInspectionForm(false);
    setEditingInspectionId(null);
  };

  // Bulk select handlers for drafts
  const handleSelectDraft = (inspectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedDrafts(prev => [...prev, inspectionId]);
    } else {
      setSelectedDrafts(prev => prev.filter(id => id !== inspectionId));
    }
  };

  const handleSelectAllDrafts = (checked: boolean) => {
    if (checked) {
      setSelectedDrafts(companyDraftInspections.map(draft => draft.id));
    } else {
      setSelectedDrafts([]);
    }
  };

  const handleBulkDeleteDrafts = async () => {
    if (selectedDrafts.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedDrafts.length} draft inspection(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeletingDrafts(true);
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/lab-inspections'
        : '/api/lab-inspections';

      // Delete each selected draft
      const deletePromises = selectedDrafts.map(inspectionId =>
        fetch(`${apiUrl}/${inspectionId}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);

      toast({
        title: "Drafts deleted",
        description: `Successfully deleted ${selectedDrafts.length} draft inspection(s).`,
      });

      // Clear selection and refresh data
      setSelectedDrafts([]);
      fetchInspections();
    } catch (error) {
      console.error('Error deleting drafts:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete selected drafts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingDrafts(false);
    }
  };

  const downloadPDF = async (inspectionId: string) => {
    try {
      console.log('Downloading PDF for inspection:', inspectionId);
      const apiUrl = window.location.hostname === 'localhost' 
        ? `http://localhost:5000/api/lab-inspections/${inspectionId}/pdf`
        : `/api/lab-inspections/${inspectionId}/pdf`;
        
      console.log('PDF API URL:', apiUrl);
      const response = await fetch(apiUrl);
      
      if (!response.ok) throw new Error('PDF generation failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lab_Inspection_${inspectionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF downloaded",
        description: "Lab inspection report downloaded successfully.",
      });
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const escalateInspection = async (inspectionId: string) => {
    try {
      console.log('Escalating inspection:', inspectionId);
      const apiUrl = window.location.hostname === 'localhost' 
        ? `http://localhost:5000/api/lab-inspections/${inspectionId}`
        : `/api/lab-inspections/${inspectionId}`;
      
      // Get the current inspection to trigger escalation
      const response = await fetch(apiUrl);
      const inspection = await response.json();
      
      // Send escalation request (this should trigger Level 1 escalation)
      const escalationUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/escalation/manual'
        : '/api/escalation/manual';
        
      const escalationResponse = await fetch(escalationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionId,
          inspection: {
            id: inspectionId,
            supplierName: inspection.supplierName,
            company: inspection.company,
            inspectionType: inspection.inspectionType,
            dateOfIncoming: inspection.dateOfIncoming,
            lotNo: inspection.lotNo,
            overallStatus: inspection.overallStatus,
            sampleResults: inspection.sampleResults
          }
        })
      });
      
      if (!escalationResponse.ok) {
        throw new Error('Escalation failed');
      }
      
      toast({
        title: "Escalation sent",
        description: "Failed inspection has been escalated to Quality Manager.",
      });
      
      // Refresh inspections to show updated escalation status
      fetchInspections();
    } catch (error) {
      console.error('❌ Escalation error:', error);
      toast({
        title: "Escalation failed", 
        description: "Failed to escalate inspection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const printLabel = (inspection: any) => {
    try {
      // Create simplified label content with 2" x 3.5" dimensions
      const labelContent = `
        <html>
          <head>
            <style>
              @page { 
                size: 2in 3.5in; 
                margin: 0.1in; 
              }
              body { 
                font-family: Arial, sans-serif; 
                font-size: 10px; 
                line-height: 1.4;
                margin: 0;
                padding: 8px;
                height: 100%;
                display: flex;
                flex-direction: column;
                gap: 8px;
              }
              .field { 
                margin: 4px 0; 
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .label { 
                font-weight: bold; 
                font-size: 9px;
              }
              .value {
                font-size: 10px;
                text-align: right;
                max-width: 60%;
                word-wrap: break-word;
              }
              .remark {
                margin-top: 8px;
                padding: 4px;
                border: 1px solid #ccc;
                border-radius: 2px;
                font-size: 8px;
                background-color: #f9f9f9;
                min-height: 40px;
              }
            </style>
          </head>
          <body>
            <div class="field">
              <span class="label">Lot No:</span>
              <span class="value">${inspection.lotNo || inspection.lotNumber || 'N/A'}</span>
            </div>
            <div class="field">
              <span class="label">Material Date:</span>
              <span class="value">${new Date(inspection.dateOfIncoming || inspection.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="remark">
              <div style="font-weight: bold; margin-bottom: 2px; font-size: 8px;">Lab Inspector Remark:</div>
              <div>${inspection.testingParametersRemarks || inspection.remarks || 'No remarks'}</div>
            </div>
          </body>
        </html>
      `;

      // Open new window with label content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(labelContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
        
        toast({
          title: "Label printed",
          description: "Lab inspection label sent to printer.",
        });
      }
    } catch (error) {
      console.error('Print label error:', error);
      toast({
        title: "Print failed",
        description: "Failed to print label. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (showInspectionForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Lab Inspection Form</h2>
          <Button variant="outline" onClick={handleCloseInspectionForm}>
            Back to Dashboard
          </Button>
        </div>
        <DynamicLabInspectionForm 
          selectedCompany={selectedCompany}
          editingInspectionId={editingInspectionId}
          onFormClose={() => {
            setShowInspectionForm(false);
            setEditingInspectionId(null);
            fetchInspections();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-[18px]">Incoming Material</h2>
          <p className="text-muted-foreground text-[14px]">
            Un-Dyed, Dyed, Cotton
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowInspectionForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Lab Inspection
          </Button>
        </div>
      </div>

      {/* Enhanced Dashboard Stats - 6 Comprehensive Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Inspections</p>
                <p className="text-xl font-bold">{companyInspections.length}</p>
              </div>
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Draft Reports</p>
                <p className="text-xl font-bold">{companyDraftInspections.length}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Submitted</p>
                <p className="text-xl font-bold">{companySubmittedInspections.length}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Pass Rate</p>
                <p className="text-xl font-bold">
                  {(() => {
                    const submittedWithStatus = companySubmittedInspections.filter(i => i.overallStatus || i.status);
                    const passedInspections = submittedWithStatus.filter(i => (i.overallStatus || i.status) === 'pass');
                    return submittedWithStatus.length > 0 
                      ? Math.round((passedInspections.length / submittedWithStatus.length) * 100)
                      : 0;
                  })()}%
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">This Week</p>
                <p className="text-xl font-bold">
                  {(() => {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return companyInspections.filter(i => {
                      const inspectionDate = new Date(i.submittedAt || i.createdAt || i.dateOfIncoming);
                      return inspectionDate >= oneWeekAgo;
                    }).length;
                  })()}
                </p>
              </div>
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Failed Tests</p>
                <p className="text-xl font-bold">
                  {companySubmittedInspections.filter(i => (i.overallStatus || i.status) === 'fail').length}
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lab inspections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({companyDraftInspections.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({companySubmittedInspections.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6">
            {/* Recent Lab Inspections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Lab Inspections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companyInspections.slice(0, 10).map((inspection) => (
                    <div key={inspection.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                      inspection.status === 'submitted' 
                        ? (inspection.overallStatus || inspection.status) === 'pass' 
                          ? 'bg-green-50' 
                          : (inspection.overallStatus || inspection.status) === 'fail' 
                            ? 'bg-red-50' 
                            : ''
                        : ''
                    }`}>
                      <div className="flex-1">
                        <div className="font-medium">{inspection.supplierName || 'Unnamed Supplier'}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(inspection.dateOfIncoming || inspection.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={inspection.status === 'submitted' ? 'default' : 'secondary'}>
                          {inspection.status}
                        </Badge>
                        {inspection.status === 'submitted' && (inspection.overallStatus || inspection.status) && (
                          <Badge variant={(inspection.overallStatus || inspection.status) === 'pass' ? 'default' : 'destructive'} className={
                            (inspection.overallStatus || inspection.status) === 'pass' 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-red-600 hover:bg-red-700'
                          }>
                            {(inspection.overallStatus || inspection.status) === 'pass' ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Pass
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Fail
                              </>
                            )}
                          </Badge>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleViewInspection(inspection.id)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => downloadPDF(inspection.id)}>
                          <Download className="h-3 w-3" />
                        </Button>
                        
                        {/* Escalation button for failed inspections */}
                        {inspection.status === 'submitted' && (inspection.overallStatus || inspection.status) === 'fail' && (
                          <EscalationDialog
                            inspectionId={inspection.id}
                            inspection={{
                              materialType: inspection.inspectionType,
                              supplierName: inspection.supplierName,
                              company: inspection.company,
                              incomingDate: inspection.dateOfIncoming,
                              status: inspection.overallStatus || inspection.status || 'fail',
                              testingParameters: inspection.sampleResults?.flatMap(sample => 
                                Object.entries(sample.results || {})
                                  .filter(([_, result]) => result === 'Fail' || result === 'fail')
                                  .map(([param, _]) => ({ parameter: param, result: 'Fail' }))
                              ) || []
                            }}
                            trigger={
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Escalate Failed Inspection">
                                <AlertTriangle className="h-3 w-3" />
                              </Button>
                            }
                            onEscalationSent={() => {
                              toast({
                                title: "✅ Escalation Sent",
                                description: "Escalation email sent with approve/fail buttons.",
                                duration: 5000
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {companyInspections.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No lab inspections found. Create your first inspection to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts">
          <div className="space-y-6">
            {/* Draft Lab Inspections */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Draft Lab Inspections</CardTitle>
                {companyDraftInspections.length > 0 && (
                  <div className="flex items-center gap-2">
                    {selectedDrafts.length > 0 && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleBulkDeleteDrafts}
                        disabled={isDeletingDrafts}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete Selected ({selectedDrafts.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {companyDraftInspections.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 p-2 bg-muted rounded-lg">
                    <Checkbox
                      id="select-all-drafts"
                      checked={selectedDrafts.length === companyDraftInspections.length}
                      onCheckedChange={handleSelectAllDrafts}
                    />
                    <label htmlFor="select-all-drafts" className="text-sm font-medium cursor-pointer">
                      Select All ({companyDraftInspections.length} drafts)
                    </label>
                  </div>
                )}
                <div className="space-y-3">
                  {companyDraftInspections.map((inspection) => (
                    <div key={inspection.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={selectedDrafts.includes(inspection.id)}
                          onCheckedChange={(checked) => handleSelectDraft(inspection.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{inspection.supplierName || 'Unnamed Supplier'}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Last saved {new Date(inspection.updatedAt || inspection.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">draft</Badge>
                        <Button size="sm" variant="ghost" onClick={() => handleViewInspection(inspection.id)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {companyDraftInspections.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No draft inspections found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Submitted Tab */}
        <TabsContent value="submitted">
          <div className="space-y-6">
            {/* Submitted Lab Inspections */}
            <Card>
              <CardHeader>
                <CardTitle>Submitted Lab Inspections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companySubmittedInspections.map((inspection) => (
                    <div key={inspection.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                      (inspection.overallStatus || inspection.status) === 'pass' 
                        ? 'bg-green-50' 
                        : (inspection.overallStatus || inspection.status) === 'fail' 
                          ? 'bg-red-50' 
                          : ''
                    }`}>
                      <div className="flex-1">
                        <div className="font-medium">{inspection.supplierName || 'Unnamed Supplier'}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(inspection.submittedAt || inspection.createdAt).toLocaleDateString()}
                          <span className="mx-1">•</span>
                          <span>Lot: {inspection.lotNo || inspection.lotNumber || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {(inspection.overallStatus || inspection.status) && (
                          <Badge variant={(inspection.overallStatus || inspection.status) === 'pass' ? 'default' : 'destructive'} className={
                            (inspection.overallStatus || inspection.status) === 'pass' 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-red-600 hover:bg-red-700'
                          }>
                            {(inspection.overallStatus || inspection.status) === 'pass' ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                PASS
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                FAIL
                              </>
                            )}
                          </Badge>
                        )}
                        {/* Print label button */}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => printLabel(inspection)}
                          title="Print Label"
                          className="h-8 w-8 p-0"
                        >
                          <Tag className="h-3 w-3" />
                        </Button>
                        {/* View and download buttons */}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleViewInspection(inspection.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => downloadPDF(inspection.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        
                        {/* Escalation button for failed inspections */}
                        {(inspection.overallStatus || inspection.status) === 'fail' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => escalateInspection(inspection.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            title="Escalate Failed Inspection"
                          >
                            <AlertTriangle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {companySubmittedInspections.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No submitted inspections found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LabInspectionDashboard;