import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Package, Shield, BarChart3, Users, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Clock, FileText, Calendar, Activity 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';

interface DashboardMetrics {
  totalRugs: number;
  totalBuyers: number;
  totalUsers: number;
  labInspections: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    thisWeek: number;
    passRate: number;
  };
  qualityAudits: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    avgScore: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'inspection' | 'audit' | 'rug' | 'buyer';
    title: string;
    description: string;
    timestamp: string;
    status?: string;
  }>;
}

const CleanHomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard metrics from all collections
  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : '';

      // Fetch multiple data sources in parallel
      const [rugsRes, buyersRes, usersRes, inspectionsRes, auditsRes] = await Promise.all([
        fetch(`${apiUrl}/api/rugs`),
        fetch(`${apiUrl}/api/buyers`),
        fetch(`${apiUrl}/api/admin/users`),
        fetch(`${apiUrl}/api/lab-inspections`),
        fetch(`${apiUrl}/api/audits`)
      ]);

      const [rugs, buyers, users, inspections, audits] = await Promise.all([
        rugsRes.json(),
        buyersRes.json(),
        usersRes.json(),
        inspectionsRes.json(),
        auditsRes.json()
      ]);

      // Calculate lab inspection metrics
      const submittedInspections = inspections.filter((i: any) => i.status === 'submitted');
      const passedInspections = submittedInspections.filter((i: any) => i.overallStatus === 'ok');
      const failedInspections = submittedInspections.filter((i: any) => i.overallStatus === 'not_ok');
      const pendingInspections = inspections.filter((i: any) => i.status === 'draft');
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekInspections = inspections.filter((i: any) => 
        new Date(i.createdAt || i.dateOfIncoming) >= oneWeekAgo
      );

      const passRate = submittedInspections.length > 0 
        ? Math.round((passedInspections.length / submittedInspections.length) * 100)
        : 0;

      // Calculate audit metrics
      const submittedAudits = audits.filter((a: any) => a.status === 'submitted');
      const passedAudits = submittedAudits.filter((a: any) => (a.complianceScore || 0) >= 80);
      const failedAudits = submittedAudits.filter((a: any) => (a.complianceScore || 0) < 80);
      const pendingAudits = audits.filter((a: any) => a.status === 'draft');
      
      const avgScore = submittedAudits.length > 0
        ? Math.round(submittedAudits.reduce((sum: number, a: any) => sum + (a.complianceScore || 0), 0) / submittedAudits.length)
        : 0;

      // Generate recent activity from all sources
      const recentActivity: any[] = [];
      
      // Add recent inspections
      inspections.slice(0, 5).forEach((inspection: any) => {
        recentActivity.push({
          id: inspection.id,
          type: 'inspection',
          title: `Lab Inspection ${inspection.status === 'submitted' ? 'Completed' : 'Created'}`,
          description: `${inspection.supplierName || 'Unknown Supplier'} - ${inspection.inspectionType || 'Material'} inspection`,
          timestamp: inspection.updatedAt || inspection.createdAt,
          status: inspection.overallStatus || inspection.status
        });
      });

      // Add recent audits
      audits.slice(0, 3).forEach((audit: any) => {
        recentActivity.push({
          id: audit.id,
          type: 'audit',
          title: `Compliance Audit ${audit.status === 'submitted' ? 'Completed' : 'Created'}`,
          description: `${audit.company || 'Company'} audit - Score: ${audit.complianceScore || 'N/A'}%`,
          timestamp: audit.updatedAt || audit.createdAt,
          status: audit.status
        });
      });

      // Add recent rugs
      rugs.slice(0, 3).forEach((rug: any) => {
        recentActivity.push({
          id: rug.id,
          type: 'rug',
          title: 'New Rug Sample Created',
          description: `${rug.designName || rug.rugName || 'Unnamed Design'} - ${rug.construction || 'Hand Woven'}`,
          timestamp: rug.createdAt || new Date().toISOString(),
          status: 'created'
        });
      });

      // Sort by timestamp and take latest 8
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      const dashboardMetrics: DashboardMetrics = {
        totalRugs: rugs.length,
        totalBuyers: buyers.length,
        totalUsers: users.length,
        labInspections: {
          total: inspections.length,
          passed: passedInspections.length,
          failed: failedInspections.length,
          pending: pendingInspections.length,
          thisWeek: thisWeekInspections.length,
          passRate
        },
        qualityAudits: {
          total: audits.length,
          passed: passedAudits.length,
          failed: failedAudits.length,
          pending: pendingAudits.length,
          avgScore
        },
        recentActivity: recentActivity.slice(0, 8)
      };

      setMetrics(dashboardMetrics);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const departmentCards = [
    {
      title: 'Sampling',
      description: 'Create and manage rug samples with technical specifications',
      icon: Package,
      path: '/sampling',
      color: 'bg-blue-50 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      stats: `${metrics?.totalRugs || 0} rugs`,
      metric: metrics?.totalRugs || 0,
      trend: '+12%'
    },
    {
      title: 'Quality',
      description: 'Lab testing, compliance audits, and quality inspections',
      icon: Shield,
      path: '/quality',
      color: 'bg-green-50 hover:bg-green-100',
      iconColor: 'text-green-600',
      stats: `${metrics?.labInspections?.passRate || 0}% pass rate`,
      metric: `${metrics?.labInspections?.total || 0} inspections`,
      trend: (metrics?.labInspections?.passRate || 0) >= 90 ? '+5%' : '-2%'
    },
    {
      title: 'Merchandising',
      description: 'Buyer management and production order tracking',
      icon: BarChart3,
      path: '/merchandising',
      color: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      stats: `${metrics?.totalBuyers || 0} buyers`,
      metric: `${metrics?.totalUsers || 0} users`,
      trend: '+8%'
    }
  ];

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Helper function to get activity icon and color
  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case 'inspection':
        return status === 'ok' 
          ? { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' }
          : status === 'not_ok' 
            ? { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' }
            : { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'audit':
        return { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'rug':
        return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' };
      default:
        return { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quality Management System</h1>
        <p className="text-gray-600">Access your department's tools and workflows</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          <span className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            System Status: Online
          </span>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Total Rugs</p>
                <p className="text-lg font-semibold text-gray-900">{metrics?.totalRugs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Quality Pass Rate</p>
                <p className="text-lg font-semibold text-gray-900">{metrics?.labInspections?.passRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Active Buyers</p>
                <p className="text-lg font-semibold text-gray-900">{metrics?.totalBuyers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Lab Tests</p>
                <p className="text-lg font-semibold text-gray-900">{metrics?.labInspections?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Shield className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Audits</p>
                <p className="text-lg font-semibold text-gray-900">{metrics?.qualityAudits?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">System Users</p>
                <p className="text-lg font-semibold text-gray-900">{metrics?.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Lab Inspections Analytics */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Lab Inspections Analytics
            </CardTitle>
            <CardDescription>Quality testing performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics?.labInspections?.passed || 0}</div>
                <div className="text-sm text-gray-500">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{metrics?.labInspections?.failed || 0}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pass Rate</span>
                <span className="font-medium">{metrics?.labInspections?.passRate || 0}%</span>
              </div>
              <Progress 
                value={metrics?.labInspections?.passRate || 0} 
                className="h-2"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-gray-600">This Week</span>
              </div>
              <Badge variant="secondary">{metrics?.labInspections?.thisWeek || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Audits Analytics */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Compliance Audits Analytics
            </CardTitle>
            <CardDescription>ISO 9001:2015 compliance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics?.qualityAudits?.passed || 0}</div>
                <div className="text-sm text-gray-500">Passed (≥80%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{metrics?.qualityAudits?.failed || 0}</div>
                <div className="text-sm text-gray-500">Failed (&lt;80%)</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avg Score</span>
                <span className="font-medium">{metrics?.qualityAudits?.avgScore || 0}%</span>
              </div>
              <Progress 
                value={metrics?.qualityAudits?.avgScore || 0} 
                className="h-2"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Trending</span>
              </div>
              <Badge variant={metrics?.qualityAudits?.avgScore >= 80 ? "default" : "destructive"}>
                {metrics?.qualityAudits?.avgScore >= 80 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {departmentCards.map((dept) => {
          const IconComponent = dept.icon;
          const TrendIcon = dept.trend.startsWith('+') ? TrendingUp : TrendingDown;
          const trendColor = dept.trend.startsWith('+') ? 'text-green-600' : 'text-red-600';
          
          return (
            <Card 
              key={dept.title} 
              className={`cursor-pointer transition-all duration-200 border-0 shadow-sm hover:shadow-md ${dept.color}`}
              onClick={() => setLocation(dept.path)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <IconComponent className={`h-6 w-6 ${dept.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {dept.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{dept.stats}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                    <span className={`text-sm font-medium ${trendColor}`}>{dept.trend}</span>
                  </div>
                </div>
                <CardDescription className="text-gray-600 mt-2">
                  {dept.description}
                </CardDescription>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>{dept.metric}</span>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-white/80">
                  Access Department →
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates across all departments</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {metrics.recentActivity.map((activity) => {
                const activityIcon = getActivityIcon(activity.type, activity.status);
                const IconComponent = activityIcon.icon;
                
                return (
                  <div key={activity.id} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-50 ${activityIcon.bg}`}>
                    <div className={`p-1.5 rounded-full ${activityIcon.bg}`}>
                      <IconComponent className={`h-4 w-4 ${activityIcon.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                      {activity.status && (
                        <Badge 
                          variant={
                            activity.status === 'ok' || activity.status === 'submitted' 
                              ? 'default' 
                              : activity.status === 'not_ok' 
                                ? 'destructive' 
                                : 'secondary'
                          }
                          className="text-xs"
                        >
                          {activity.status === 'ok' ? 'Passed' : 
                           activity.status === 'not_ok' ? 'Failed' : 
                           activity.status === 'submitted' ? 'Submitted' :
                           activity.status === 'draft' ? 'Draft' : activity.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No recent activity to display</p>
              <p className="text-xs">Activity will appear here as you use the system</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CleanHomePage;