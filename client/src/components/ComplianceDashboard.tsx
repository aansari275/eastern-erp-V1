import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  Trash2,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  ShieldCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useComplianceAudit } from '../hooks/useComplianceAudit';
import { useToast } from '../hooks/use-toast';
import { ComplianceAudit } from '../../../shared/schema';
import { ComplianceAuditForm } from './ComplianceAuditForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ComplianceDashboardProps {
  selectedCompany: 'EHI' | 'EMPL';
}

export function ComplianceDashboard({ selectedCompany }: ComplianceDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { audits, draftAudits, submittedAudits, isLoading: auditsLoading, deleteAuditMutation } = useComplianceAudit();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<'EHI' | 'EMPL'>(selectedCompany);
  const [editingAudit, setEditingAudit] = useState<ComplianceAudit | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update when selectedCompany changes
  useEffect(() => {
    setCurrentCompany(selectedCompany);
  }, [selectedCompany]);

  // Listen for real-time audit updates via window events
  useEffect(() => {
    const handleAuditUpdate = () => {
      console.log('🔄 Received audit update event, refreshing data...');
      setIsRefreshing(true);
      // Force refresh the audits data
      queryClient.invalidateQueries({ queryKey: ['compliance-audits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/audit'] }); // Also refresh new audit API
      setTimeout(() => setIsRefreshing(false), 1500);
    };

    // Listen for both old and new event types
    window.addEventListener('compliance-audit-saved', handleAuditUpdate);
    window.addEventListener('compliance-audit-submitted', handleAuditUpdate);
    window.addEventListener('auditSaved', handleAuditUpdate); // New event from AuditFormV2

    return () => {
      window.removeEventListener('compliance-audit-saved', handleAuditUpdate);
      window.removeEventListener('compliance-audit-submitted', handleAuditUpdate);
      window.removeEventListener('auditSaved', handleAuditUpdate);
    };
  }, [queryClient]);

  // Show form if requested
  if (showCreateForm) {
    return (
      <ComplianceAuditForm
        company={currentCompany}
        onBack={() => setShowCreateForm(false)}
        existingAudit={editingAudit}
      />
    );
  }

  // Filter data by company and search term
  const companyAudits = audits.filter((audit: ComplianceAudit) => 
    audit.company === currentCompany &&
    (audit.auditorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     audit.location?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const companyDraftAudits = draftAudits.filter((audit: ComplianceAudit) => 
    audit.company === currentCompany &&
    (audit.auditorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     audit.location?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const companySubmittedAudits = submittedAudits.filter((audit: ComplianceAudit) => 
    audit.company === currentCompany &&
    (audit.auditorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     audit.location?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate metrics
  const totalAudits = companyAudits.length;
  const totalDrafts = companyDraftAudits.length;
  const totalSubmitted = companySubmittedAudits.length;
  
  // This week calculations
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const submittedThisWeek = companySubmittedAudits.filter((audit: ComplianceAudit) => {
    const submittedDate = audit.submittedAt ? new Date(audit.submittedAt) : null;
    return submittedDate && submittedDate >= oneWeekAgo;
  }).length;

  // Pass rate calculation (assuming score > 80 is pass)
  const auditssWithScores = companySubmittedAudits.filter((audit: ComplianceAudit) => audit.scoreData?.score !== undefined);
  const passedAudits = auditssWithScores.filter((audit: ComplianceAudit) => (audit.scoreData?.score || 0) >= 80);
  const passRate = auditssWithScores.length > 0 ? Math.round((passedAudits.length / auditssWithScores.length) * 100) : 0;
  
  const failedAudits = auditssWithScores.filter((audit: ComplianceAudit) => (audit.scoreData?.score || 0) < 80).length;

  const handleDeleteAudit = async (auditId: string) => {
    if (window.confirm('Are you sure you want to delete this audit? This action cannot be undone.')) {
      try {
        await deleteAuditMutation.mutateAsync(auditId);
        toast({
          title: "✅ Audit Deleted",
          description: "Compliance audit has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "❌ Delete Failed",
          description: "Failed to delete audit. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewAudit = (audit: ComplianceAudit) => {
    // Open the audit in a new tab/window using the HTML view route
    const viewUrl = `/api/audits/compliance/${audit.id}/view`;
    window.open(viewUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  const handleDownloadPDF = async (audit: ComplianceAudit) => {
    try {
      setIsRefreshing(true);
      
      // Create download URL for the audit PDF
      const downloadUrl = `/api/audits/compliance/${audit.id}/pdf`;
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `compliance-audit-${audit.company}-${audit.id}.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "📄 PDF download started",
      });
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Error",
        description: "❌ Failed to download PDF",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks}w ago`;
    } catch {
      return 'Unknown';
    }
  };

  const MetricCard = ({ title, value, icon: Icon, description, color }: {
    title: string;
    value: number | string;
    icon: any;
    description: string;
    color: string;
  }) => (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
            <p className={`text-lg sm:text-2xl font-bold ${color} truncate`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1 truncate">{description}</p>
          </div>
          <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ml-2 ${color.includes('blue') ? 'bg-blue-100' : color.includes('green') ? 'bg-green-100' : color.includes('red') ? 'bg-red-100' : 'bg-gray-100'}`}>
            <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AuditCard = ({ audit, showStatus = true }: { audit: ComplianceAudit, showStatus?: boolean }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {`${audit.auditorName} - ${audit.location}`}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(audit.createdAt?.toString())}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(audit.updatedAt?.toString())}
              </span>
            </div>
          </div>
          {showStatus && (
            <Badge variant={audit.status === 'submitted' ? 'default' : 'secondary'}>
              {audit.status === 'submitted' ? 'Submitted' : 'Draft'}
            </Badge>
          )}
        </div>
        
        {audit.scoreData?.score !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">Compliance Score</span>
              <span className={`font-medium ml-2 flex-shrink-0 ${audit.scoreData.score >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                {audit.scoreData.score}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${audit.scoreData.score >= 80 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, Math.max(0, audit.scoreData.score))}%` }}
              />
            </div>
          </div>
        )}

        {/* Mobile: Stack buttons, Desktop: Horizontal layout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex gap-2 flex-1">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleViewAudit(audit)}
              className="flex-1 sm:flex-none"
            >
              <Eye className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">View</span>
            </Button>
            {audit.status === 'draft' && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setEditingAudit(audit);
                  setShowCreateForm(true);
                }}
                className="flex-1 sm:flex-none"
              >
                <Edit className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            {audit.status === 'submitted' && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleDownloadPDF(audit)}
                className="flex-1 sm:flex-none"
                disabled={isRefreshing}
              >
                <Download className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
            )}
            {audit.status === 'draft' && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleDeleteAudit(audit.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
              >
                <Trash2 className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (auditsLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading compliance audits...</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header with Search and New Button */}
      <div className="bg-white border-b p-3 sm:p-6">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 lg:mb-0">Compliance Audits</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-sm text-gray-600">Company:</span>
              <Select
                value={currentCompany}
                onValueChange={(value: 'EHI' | 'EMPL') => setCurrentCompany(value)}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EHI">Eastern Home Industries</SelectItem>
                  <SelectItem value="EMPL">Eastern Mills Private Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Mobile: Full width button, Desktop: Regular button */}
          <Button 
            onClick={() => setShowCreateForm(true)} 
            className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Refreshing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Compliance Audit</span>
                <span className="sm:hidden">+ New Audit</span>
              </>
            )}
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search audits by auditor, location, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-blue-50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="drafts" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Drafts ({totalDrafts})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Submitted ({totalSubmitted})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            {/* Summary Cards - Mobile responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
              <MetricCard
                title="Total Audits"
                value={totalAudits}
                icon={ShieldCheck}
                description="All compliance audits"
                color="text-blue-600"
              />
              <MetricCard
                title="Draft Audits"
                value={totalDrafts}
                icon={FileText}
                description="In progress"
                color="text-yellow-600"
              />
              <MetricCard
                title="Submitted Audits"
                value={totalSubmitted}
                icon={CheckCircle}
                description="Completed audits"
                color="text-green-600"
              />
              <MetricCard
                title="Submitted This Week"
                value={submittedThisWeek}
                icon={TrendingUp}
                description="Last 7 days"
                color="text-blue-600"
              />
              <MetricCard
                title="Pass Rate"
                value={`${passRate}%`}
                icon={BarChart3}
                description="Score ≥ 80%"
                color="text-green-600"
              />
              <MetricCard
                title="Failed Audits"
                value={failedAudits}
                icon={XCircle}
                description="Score < 80%"
                color="text-red-600"
              />
            </div>

            {/* Recent Audits */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Audits</h3>
              {companyAudits.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="p-8 text-center">
                    <ShieldCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No audits found</h3>
                    <p className="text-gray-600 mb-4">Create your first compliance audit to get started</p>
                    <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Audit
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyAudits.slice(0, 6).map((audit: ComplianceAudit) => (
                    <AuditCard key={audit.id} audit={audit} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Drafts Tab */}
          <TabsContent value="drafts" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Draft Audits</h3>
              {companyDraftAudits.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No draft audits</h3>
                    <p className="text-gray-600">All audits have been completed and submitted</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyDraftAudits.map((audit: ComplianceAudit) => (
                    <AuditCard key={audit.id} audit={audit} showStatus={false} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Submitted Tab */}
          <TabsContent value="submitted" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Submitted Audits</h3>
              {companySubmittedAudits.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No submitted audits</h3>
                    <p className="text-gray-600">Complete and submit audits to see them here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companySubmittedAudits.map((audit: ComplianceAudit) => (
                    <AuditCard key={audit.id} audit={audit} showStatus={false} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}