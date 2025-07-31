import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Package, Shield, BarChart3, Users, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Clock, FileText, Calendar, Activity,
  Target, Award, Zap, Eye, Settings, Bell, Filter, Download,
  ArrowUpRight, ArrowDownRight, Plus, Search, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

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
    trend: number;
  };
  qualityAudits: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    avgScore: number;
    trend: number;
  };
  production: {
    activeOrders: number;
    completedToday: number;
    efficiency: number;
    delayedOrders: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'inspection' | 'audit' | 'rug' | 'buyer' | 'production';
    title: string;
    description: string;
    timestamp: string;
    status?: string;
    priority?: 'low' | 'medium' | 'high';
  }>;
}

const EnhancedHome: React.FC = () => {
  const [, setLocation] = useLocation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

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
          status: inspection.overallStatus || inspection.status,
          priority: inspection.overallStatus === 'not_ok' ? 'high' : 'medium'
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
          status: audit.status,
          priority: (audit.complianceScore || 0) < 80 ? 'high' : 'low'
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
          status: 'created',
          priority: 'low'
        });
      });

      // Sort by timestamp and take latest 10
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
          passRate,
          trend: Math.random() > 0.5 ? 5.2 : -2.1 // Mock trend data
        },
        qualityAudits: {
          total: audits.length,
          passed: passedAudits.length,
          failed: failedAudits.length,
          pending: pendingAudits.length,
          avgScore,
          trend: Math.random() > 0.5 ? 3.8 : -1.5 // Mock trend data
        },
        production: {
          activeOrders: Math.floor(Math.random() * 50) + 20,
          completedToday: Math.floor(Math.random() * 15) + 5,
          efficiency: Math.floor(Math.random() * 20) + 80,
          delayedOrders: Math.floor(Math.random() * 5)
        },
        recentActivity: recentActivity.slice(0, 10)
      };

      setMetrics(dashboardMetrics);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const departmentCards = [
    {
      title: 'Sampling',
      description: 'Create and manage rug samples with technical specifications',
      icon: Package,
      path: '/sampling',
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-600',
      stats: `${metrics?.totalRugs || 0} rugs`,
      metric: metrics?.totalRugs || 0,
      trend: '+12%',
      actions: ['Create New', 'View All', 'Analytics']
    },
    {
      title: 'Quality',
      description: 'Lab testing, compliance audits, and quality inspections',
      icon: Shield,
      path: '/quality',
      color: 'bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-600',
      stats: `${metrics?.labInspections?.passRate || 0}% pass rate`,
      metric: `${metrics?.labInspections?.total || 0} inspections`,
      trend: (metrics?.labInspections?.trend || 0) >= 0 ? `+${metrics?.labInspections?.trend}%` : `${metrics?.labInspections?.trend}%`,
      actions: ['New Inspection', 'Lab Tests', 'Reports']
    },
    {
      title: 'Merchandising',
      description: 'Buyer management and production order tracking',
      icon: BarChart3,
      path: '/merchandising',
      color: 'bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-600',
      stats: `${metrics?.totalBuyers || 0} buyers`,
      metric: `${metrics?.production?.activeOrders || 0} active orders`,
      trend: '+8%',
      actions: ['Orders', 'Buyers', 'Analytics']
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
  const getActivityIcon = (type: string, status?: string, priority?: string) => {
    const priorityColors = {
      high: { border: 'border-red-200', bg: 'bg-red-50' },
      medium: { border: 'border-yellow-200', bg: 'bg-yellow-50' },
      low: { border: 'border-gray-200', bg: 'bg-gray-50' }
    };

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
      case 'production':
        return { icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' };
      default:
        return { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return 'border-l-4 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manufacturing Dashboard</h1>
          <p className="text-gray-600">Monitor your operations and quality metrics in real-time</p>
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
              <Activity className="h-4 w-4 text-green-500" />
              System Online
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={fetchDashboardMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Total Rugs</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.totalRugs || 0}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Quality Pass Rate</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.labInspections?.passRate || 0}%</p>
                <div className="flex items-center gap-1">
                  {(metrics?.labInspections?.trend || 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${(metrics?.labInspections?.trend || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(metrics?.labInspections?.trend || 0) >= 0 ? '+' : ''}{metrics?.labInspections?.trend || 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Active Buyers</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.totalBuyers || 0}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Lab Tests</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.labInspections?.total || 0}</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-yellow-600">{metrics?.labInspections?.pending || 0} pending</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Shield className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Compliance Score</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.qualityAudits?.avgScore || 0}%</p>
                <div className="flex items-center gap-1">
                  {(metrics?.qualityAudits?.trend || 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${(metrics?.qualityAudits?.trend || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(metrics?.qualityAudits?.trend || 0) >= 0 ? '+' : ''}{metrics?.qualityAudits?.trend || 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Efficiency</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.production?.efficiency || 0}%</p>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-600">{metrics?.production?.completedToday || 0} today</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departmentCards.map((dept) => {
          const IconComponent = dept.icon;
          const TrendIcon = dept.trend.startsWith('+') ? TrendingUp : TrendingDown;
          const trendColor = dept.trend.startsWith('+') ? 'text-green-600' : 'text-red-600';
          
          return (
            <Card 
              key={dept.title} 
              className={`cursor-pointer transition-all duration-300 border-0 shadow-sm hover:shadow-lg ${dept.color} group`}
              onClick={() => setLocation(dept.path)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${dept.bgColor} rounded-xl shadow-sm group-hover:shadow-md transition-shadow`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                    <span className={`text-sm font-medium ${trendColor}`}>{dept.trend}</span>
                  </div>
                </div>
                
                <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                  {dept.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  {dept.description}
                </CardDescription>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">{dept.metric}</span>
                    <Badge variant="outline" className="text-xs">
                      {dept.stats}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex gap-2 mb-4">
                  {dept.actions.map((action, idx) => (
                    <Button key={idx} variant="ghost" size="sm" className="text-xs">
                      {action}
                    </Button>
                  ))}
                </div>
                <Button className="w-full bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 shadow-sm">
                  Access Department
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Analytics */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Quality Analytics
                </CardTitle>
                <CardDescription>Performance metrics and trends</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTimeframe} className="space-y-6 mt-6">
                {/* Lab Inspections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Lab Inspections</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Passed: {metrics?.labInspections?.passed || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Failed: {metrics?.labInspections?.failed || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{metrics?.labInspections?.passed || 0}</div>
                      <div className="text-sm text-gray-600">Passed</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{metrics?.labInspections?.failed || 0}</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{metrics?.labInspections?.pending || 0}</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pass Rate</span>
                      <span className="font-medium">{metrics?.labInspections?.passRate || 0}%</span>
                    </div>
                    <Progress 
                      value={metrics?.labInspections?.passRate || 0} 
                      className="h-3"
                    />
                  </div>
                </div>

                {/* Compliance Audits */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Compliance Audits</h4>
                    <Badge variant={metrics?.qualityAudits?.avgScore >= 80 ? "default" : "destructive"}>
                      {metrics?.qualityAudits?.avgScore >= 80 ? "Excellent" : "Needs Improvement"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Score</span>
                      <span className="font-medium">{metrics?.qualityAudits?.avgScore || 0}%</span>
                    </div>
                    <Progress 
                      value={metrics?.qualityAudits?.avgScore || 0} 
                      className="h-3"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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
                {metrics.recentActivity
                  .filter(activity => 
                    searchQuery === '' || 
                    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    activity.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((activity) => {
                    const activityIcon = getActivityIcon(activity.type, activity.status, activity.priority);
                    const IconComponent = activityIcon.icon;
                    
                    return (
                      <div 
                        key={activity.id} 
                        className={`flex items-start space-x-3 p-3 rounded-lg transition-all hover:bg-gray-50 cursor-pointer ${getPriorityColor(activity.priority)}`}
                      >
                        <div className={`p-2 rounded-full ${activityIcon.bg} flex-shrink-0`}>
                          <IconComponent className={`h-4 w-4 ${activityIcon.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">{formatTimestamp(activity.timestamp)}</span>
                            {activity.priority && (
                              <Badge 
                                variant={activity.priority === 'high' ? 'destructive' : activity.priority === 'medium' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {activity.priority} priority
                              </Badge>
                            )}
                          </div>
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
    </div>
  );
};

export default EnhancedHome;