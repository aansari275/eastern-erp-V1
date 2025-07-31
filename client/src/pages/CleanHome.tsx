import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Package, 
  Shield, 
  Users, 
  BarChart3, 
  ArrowRight,
  Building2
} from 'lucide-react';

const CleanHome: React.FC = () => {
  const stats = [
    { title: 'Active Orders', value: '12', color: 'text-blue-600' },
    { title: 'Quality Score', value: '96%', color: 'text-green-600' },
    { title: 'Pending Tasks', value: '5', color: 'text-orange-600' },
    { title: 'Team Members', value: '24', color: 'text-purple-600' },
  ];

  const quickActions = [
    { title: 'Create Rug Sample', icon: Package, href: '/sampling', color: 'bg-blue-500 hover:bg-blue-600' },
    { title: 'Quality Inspection', icon: Shield, href: '/quality', color: 'bg-green-500 hover:bg-green-600' },
    { title: 'View Reports', icon: BarChart3, href: '/reports', color: 'bg-purple-500 hover:bg-purple-600' },
    { title: 'Manage Users', icon: Users, href: '/admin/users', color: 'bg-orange-500 hover:bg-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Eastern Mills ERP</h1>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">Here's what's happening with your manufacturing operations today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {stat.title}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={() => window.location.href = action.href}
                  className={`${action.color} text-white h-24 flex flex-col items-center justify-center space-y-2 rounded-lg transition-colors`}
                >
                  <action.icon className="h-6 w-6" />
                  <span className="text-sm font-medium text-center">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-gray-900">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Quality inspection completed for Order #1234</span>
                  <span className="text-gray-400 text-xs">2h ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">New rug sample created: Persian Design</span>
                  <span className="text-gray-400 text-xs">4h ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">Lab inspection scheduled for tomorrow</span>
                  <span className="text-gray-400 text-xs">6h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-gray-900">Upcoming Tasks</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Monthly Quality Review</div>
                    <div className="text-xs text-gray-500">Due in 2 days</div>
                  </div>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Update Material Inventory</div>
                    <div className="text-xs text-gray-500">Due in 5 days</div>
                  </div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Team Performance Meeting</div>
                    <div className="text-xs text-gray-500">Due in 1 week</div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CleanHome;