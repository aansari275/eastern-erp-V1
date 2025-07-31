import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Package,
  DollarSign,
  Target,
  Award,
  Zap,
} from 'lucide-react';

// Sample data for various charts
const qualityMetricsData = [
  { month: 'Jan', pass: 95, fail: 5, total: 100 },
  { month: 'Feb', pass: 92, fail: 8, total: 100 },
  { month: 'Mar', pass: 97, fail: 3, total: 100 },
  { month: 'Apr', pass: 94, fail: 6, total: 100 },
  { month: 'May', pass: 96, fail: 4, total: 100 },
  { month: 'Jun', pass: 98, fail: 2, total: 100 },
];

const productionTrendsData = [
  { week: 'W1', planned: 120, actual: 115, efficiency: 96 },
  { week: 'W2', planned: 130, actual: 128, efficiency: 98 },
  { week: 'W3', planned: 125, actual: 122, efficiency: 98 },
  { week: 'W4', planned: 140, actual: 135, efficiency: 96 },
  { week: 'W5', planned: 135, actual: 138, efficiency: 102 },
  { week: 'W6', planned: 145, actual: 142, efficiency: 98 },
];

const materialUsageData = [
  { name: 'Wool', value: 35, cost: 245000 },
  { name: 'Silk', value: 25, cost: 189000 },
  { name: 'Cotton', value: 20, cost: 95000 },
  { name: 'Bamboo Silk', value: 15, cost: 126000 },
  { name: 'Others', value: 5, cost: 34000 },
];

const complianceScoresData = [
  { category: 'Safety', score: 92, target: 95 },
  { category: 'Labor', score: 88, target: 90 },
  { category: 'Environmental', score: 94, target: 92 },
  { category: 'Quality', score: 96, target: 95 },
  { category: 'Documentation', score: 89, target: 90 },
];

const rugTypesData = [
  { type: 'Hand Knotted', count: 45, value: 2250000 },
  { type: 'Hand Tufted', count: 38, value: 1520000 },
  { type: 'Machine Made', count: 22, value: 660000 },
  { type: 'Flat Weave', count: 18, value: 540000 },
  { type: 'Hand Woven', count: 12, value: 480000 },
];

const orderStatusData = [
  { status: 'Completed', count: 156, percentage: 65 },
  { status: 'In Progress', count: 48, percentage: 20 },
  { status: 'Pending', count: 24, percentage: 10 },
  { status: 'On Hold', count: 12, percentage: 5 },
];

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, color, description }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {change > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
          )}
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change)}% from last month
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

interface DataVisualizationDashboardProps {
  timeRange?: string;
  department?: string;
}

const DataVisualizationDashboard: React.FC<DataVisualizationDashboardProps> = ({
  timeRange = '30d',
  department = 'all'
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedDepartment, setSelectedDepartment] = useState(department);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const exportData = (chartName: string) => {
    // Implement export functionality
    console.log(`Exporting ${chartName} data...`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="sampling">Sampling</SelectItem>
              <SelectItem value="merchandising">Merchandising</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Orders"
          value="240"
          change={12}
          icon={<Package className="h-6 w-6 text-white" />}
          color="bg-blue-500"
          description="This month"
        />
        <KPICard
          title="Quality Score"
          value="96.2%"
          change={2.5}
          icon={<Award className="h-6 w-6 text-white" />}
          color="bg-green-500"
          description="Average quality rating"
        />
        <KPICard
          title="Production Efficiency"
          value="98.4%"
          change={-1.2}
          icon={<Zap className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
          description="Overall efficiency"
        />
        <KPICard
          title="Revenue"
          value="₹54.8L"
          change={8.7}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          description="This month"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>Current order status breakdown</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportData('order-status')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Rug Types Performance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Rug Types Performance</CardTitle>
                  <CardDescription>Production count by rug type</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportData('rug-types')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rugTypesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Count' : 'Value (₹)']} />
                    <Legend />
                    <Bar dataKey="count" fill="#3B82F6" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Metrics Trend */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Quality Metrics Trend</CardTitle>
                  <CardDescription>Pass/Fail rates over time</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportData('quality-metrics')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={qualityMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pass" stroke="#10B981" strokeWidth={3} name="Pass Rate %" />
                    <Line type="monotone" dataKey="fail" stroke="#EF4444" strokeWidth={3} name="Fail Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quality Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Score Distribution</CardTitle>
                <CardDescription>Current quality metrics summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qualityMetricsData.slice(-1).map((data, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Pass Rate</span>
                      <span className="text-sm font-bold text-green-600">{data.pass}%</span>
                    </div>
                    <Progress value={data.pass} className="h-3" />
                  </div>
                ))}
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {qualityMetricsData.reduce((sum, d) => sum + d.pass, 0) / qualityMetricsData.length}%
                    </div>
                    <div className="text-sm text-green-700">Avg Pass Rate</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">
                      {qualityMetricsData.reduce((sum, d) => sum + d.fail, 0) / qualityMetricsData.length}%
                    </div>
                    <div className="text-sm text-red-700">Avg Fail Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Production Tab */}
        <TabsContent value="production" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Production Efficiency Trends</CardTitle>
                <CardDescription>Planned vs Actual production with efficiency rates</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportData('production-trends')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={productionTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="planned" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Planned" />
                  <Area type="monotone" dataKey="actual" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Actual" />
                  <Line type="monotone" dataKey="efficiency" stroke="#F59E0B" strokeWidth={3} name="Efficiency %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Material Usage Distribution */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Material Usage Distribution</CardTitle>
                  <CardDescription>Usage percentage by material type</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportData('material-usage')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={materialUsageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {materialUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Material Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Material Cost Analysis</CardTitle>
                <CardDescription>Cost breakdown by material type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={materialUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Cost']} />
                    <Bar dataKey="cost" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Compliance Scores</CardTitle>
                <CardDescription>Current scores vs targets across categories</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportData('compliance-scores')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceScoresData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#3B82F6" name="Current Score" />
                    <Bar dataKey="target" fill="#10B981" name="Target" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {complianceScoresData.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{item.category}</h4>
                        <Badge 
                          variant={item.score >= item.target ? "default" : "destructive"}
                        >
                          {item.score}%
                        </Badge>
                      </div>
                      <Progress 
                        value={item.score} 
                        className="h-2 mb-2" 
                      />
                      <div className="text-sm text-gray-600">
                        Target: {item.target}% 
                        {item.score >= item.target ? (
                          <CheckCircle className="inline h-4 w-4 text-green-600 ml-1" />
                        ) : (
                          <AlertTriangle className="inline h-4 w-4 text-red-600 ml-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataVisualizationDashboard;