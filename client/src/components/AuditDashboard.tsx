import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Plus, 
  FileText, 
  Eye, 
  Download, 
  Edit, 
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search
} from 'lucide-react';
import { useComplianceAudit } from '../hooks/useComplianceAudit';
import { EnhancedComplianceAudit } from './EnhancedComplianceAudit';
import { useToast } from '../hooks/use-toast';

interface AuditDashboardProps {
  selectedCompany: 'EHI' | 'EMPL';
}

export function AuditDashboard({ selectedCompany }: AuditDashboardProps) {
  const { toast } = useToast();
  const { audits, draftAudits, submittedAudits, isLoading: auditsLoading } = useComplianceAudit();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [editingAuditId, setEditingAuditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data by company and search term
  const companyAudits = audits.filter(audit => 
    audit.company === selectedCompany &&
    (audit.auditorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     audit.location?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const companyDraftAudits = draftAudits.filter(audit => audit.company === selectedCompany);
  const companySubmittedAudits = submittedAudits.filter(audit => audit.company === selectedCompany);

  const handleViewAudit = (auditId: string) => {
    setEditingAuditId(auditId);
    setShowAuditForm(true);
  };

  const handleCloseAuditForm = () => {
    setShowAuditForm(false);
    setEditingAuditId(null);
  };

  const downloadPDF = async (type: 'audit' | 'inspection', id: string) => {
    try {
      const endpoint = type === 'audit' 
        ? `/api/audits/${id}/generate-pdf`
        : '/api/lab-inspection-fallback/test-pdf';
      
      const method = type === 'audit' ? 'POST' : 'GET';
      const response = await fetch(endpoint, { method });
      
      if (!response.ok) throw new Error('PDF generation failed');
      
      const result = await response.json();
      if (result.success) {
        const link = document.createElement('a');
        link.href = result.downloadUrl || result.pdfUrl;
        link.download = result.fileName || `audit-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "PDF downloaded",
          description: `${type === 'audit' ? 'Audit' : 'Inspection'} report downloaded successfully.`,
        });
      }
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (showAuditForm) {
    return (
      <EnhancedComplianceAudit 
        auditId={editingAuditId || undefined}
        onClose={handleCloseAuditForm}
      />
    );
  }

  const isLoading = auditsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Management Dashboard</h2>
          <p className="text-muted-foreground">
            {selectedCompany === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAuditForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Compliance Audit
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft Audits</p>
                <p className="text-2xl font-bold">{companyDraftAudits.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted Audits</p>
                <p className="text-2xl font-bold">{companySubmittedAudits.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search compliance audits..."
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
            Drafts ({companyDraftAudits.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({companySubmittedAudits.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6">
            {/* Recent Compliance Audits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Compliance Audits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companyAudits.slice(0, 10).map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{audit.auditorName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(audit.auditDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={audit.status === 'submitted' ? 'default' : 'secondary'}>
                          {audit.status}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => handleViewAudit(audit.id)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => downloadPDF('audit', audit.id)}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {companyAudits.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No compliance audits found. Create your first audit to get started.
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
            {/* Draft Compliance Audits */}
            <Card>
              <CardHeader>
                <CardTitle>Draft Compliance Audits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companyDraftAudits.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{audit.auditorName || 'Draft Audit'}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Last saved {new Date(audit.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Draft</Badge>
                        <Button size="sm" variant="ghost" onClick={() => handleViewAudit(audit.id)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                  {companyDraftAudits.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No draft audits found.
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
            {/* Submitted Compliance Audits */}
            <Card>
              <CardHeader>
                <CardTitle>Submitted Compliance Audits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companySubmittedAudits.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{audit.auditorName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(audit.auditDate).toLocaleDateString()}
                          {audit.submittedAt && (
                            <>
                              <span>•</span>
                              <span>Submitted {new Date(audit.submittedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                        {audit.scoreData && (
                          <div className="text-sm">
                            Score: <span className={`font-medium ${
                              audit.scoreData.score >= 90 ? 'text-green-600' : 
                              audit.scoreData.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {audit.scoreData.score}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Submitted</Badge>
                        <Button size="sm" variant="ghost" onClick={() => handleViewAudit(audit.id)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => downloadPDF('audit', audit.id)}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {companySubmittedAudits.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No submitted audits found.
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