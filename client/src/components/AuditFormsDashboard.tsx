import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  FileText, 
  Eye, 
  Download, 
  Edit, 
  Trash2,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  ClipboardCheck
} from 'lucide-react';
import { useAuditForms, type AuditForm } from '../hooks/useAuditForms';
import { AuditFormEditor } from './AuditFormEditor';

interface AuditFormsDashboardProps {
  selectedCompany: 'EHI' | 'EMPL';
}

export function AuditFormsDashboard({ selectedCompany }: AuditFormsDashboardProps) {
  const [view, setView] = useState('internal');
  const { auditForms, isLoading } = useAuditForms(selectedCompany);
  const [showFormEditor, setShowFormEditor] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Filter audit forms
  const filteredForms = auditForms.filter((form: AuditForm) => {
    const matchesSearch = form.createdBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.auditType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || form.status === filterStatus;
    const matchesType = filterType === 'all' || form.auditType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate metrics
  const totalForms = auditForms.length;
  const draftForms = auditForms.filter((form: AuditForm) => form.status === 'draft').length;
  const submittedForms = auditForms.filter((form: AuditForm) => form.status === 'submitted').length;
  const droppedForms = auditForms.filter((form: AuditForm) => form.status === 'dropped').length;

  const handleCreateForm = () => {
    setEditingFormId(null);
    setShowFormEditor(true);
  };

  const handleEditForm = (formId: string) => {
    setEditingFormId(formId);
    setShowFormEditor(true);
  };

  const handleCloseEditor = () => {
    setShowFormEditor(false);
    setEditingFormId(null);
  };

  if (showFormEditor) {
    return (
      <AuditFormEditor
        formId={editingFormId}
        selectedCompany={selectedCompany}
        onClose={handleCloseEditor}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <ClipboardCheck className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading audit forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Dashboard</h2>
          <p className="text-gray-600">Manage quality audit forms for {selectedCompany}</p>
        </div>
        <Button onClick={handleCreateForm} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Audit
        </Button>
      </div>

      {/* Internal/External Tabs */}
      <Tabs value={view} onValueChange={setView} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white border">
          <TabsTrigger 
            value="internal" 
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
          >
            Internal Audits
          </TabsTrigger>
          <TabsTrigger 
            value="external" 
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
          >
            External Audits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="mt-0">
          <InternalAuditView 
            auditForms={filteredForms}
            isLoading={isLoading}
            totalForms={totalForms}
            draftForms={draftForms}
            submittedForms={submittedForms}
            droppedForms={droppedForms}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterType={filterType}
            setFilterType={setFilterType}
            handleEditForm={handleEditForm}
            handleCreateForm={handleCreateForm}
          />
        </TabsContent>

        <TabsContent value="external" className="mt-0">
          <ExternalAuditView selectedCompany={selectedCompany} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Internal Audit View Component
interface InternalAuditViewProps {
  auditForms: AuditForm[];
  isLoading: boolean;
  totalForms: number;
  draftForms: number;
  submittedForms: number;
  droppedForms: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  handleEditForm: (id: string) => void;
  handleCreateForm: () => void;
}

function InternalAuditView({
  auditForms,
  isLoading,
  totalForms,
  draftForms,
  submittedForms,
  droppedForms,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  handleEditForm,
  handleCreateForm
}: InternalAuditViewProps) {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Forms</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">{totalForms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Draft</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-600">{draftForms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Submitted</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{submittedForms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dropped</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-600">{droppedForms}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search by creator or audit type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Audit Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Final Inspection">Final Inspection</SelectItem>
            <SelectItem value="Washing">Washing</SelectItem>
            <SelectItem value="Bazar">Bazar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Audit Forms List */}
      <div className="space-y-4">
        {auditForms.length === 0 ? (
          <Card className="p-8 text-center">
            <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No internal audit forms found</h3>
            <p className="text-gray-600 mb-4">
              Create your first internal audit form to get started
            </p>
            <Button onClick={handleCreateForm} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create First Internal Audit
            </Button>
          </Card>
        ) : (
          auditForms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{form.auditType}</h3>
                      <Badge 
                        variant={
                          form.status === 'submitted' ? 'default' :
                          form.status === 'draft' ? 'secondary' : 'destructive'
                        }
                      >
                        {form.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Created by: {form.createdBy}</span>
                      <span>Company: {form.company}</span>
                      {form.createdAt && (
                        <span>
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {new Date(form.createdAt?.seconds * 1000).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditForm(form.id!)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {form.status === 'draft' ? 'Edit' : 'View'}
                    </Button>
                    {form.status === 'submitted' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// External Audit View Component
interface ExternalAuditViewProps {
  selectedCompany: 'EHI' | 'EMPL';
}

function ExternalAuditView({ selectedCompany }: ExternalAuditViewProps) {
  return (
    <div className="space-y-6">
      {/* External Audit Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">External Audits</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-600">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-600">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-600">1</div>
          </CardContent>
        </Card>
      </div>

      {/* External Audit Placeholder */}
      <Card className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">External Audits Coming Soon</h3>
        <p className="text-gray-600 mb-4">
          External audit management system for third-party auditors and certification bodies
        </p>
        <div className="text-sm text-gray-500">
          Features will include:
          <ul className="mt-2 space-y-1">
            <li>• Third-party auditor management</li>
            <li>• Certification tracking</li>
            <li>• Compliance reports</li>
            <li>• Audit scheduling</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}