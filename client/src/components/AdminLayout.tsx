import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  Shield, 
  BarChart3, 
  Factory, 
  Scissors, 
  Palette, 
  ClipboardCheck, 
  UserCheck,
  Briefcase,
  Building2,
  Settings
} from 'lucide-react';
import { PreAuthUserManagement } from './PreAuthUserManagement';

// Department configurations
const DEPARTMENTS = [
  {
    id: 'sampling',
    name: 'Sampling',
    icon: Scissors,
    description: 'Sample creation and management',
    color: 'bg-blue-500',
  },
  {
    id: 'designing',
    name: 'Designing',
    icon: Palette,
    description: 'Design and pattern creation',
    color: 'bg-purple-500',
  },
  {
    id: 'production',
    name: 'Production',
    icon: Factory,
    description: 'Manufacturing and production',
    color: 'bg-green-500',
  },
  {
    id: 'spinning',
    name: 'Spinning',
    icon: Settings,
    description: 'Yarn and fiber processing',
    color: 'bg-orange-500',
  },
  {
    id: 'quality',
    name: 'Quality',
    icon: ClipboardCheck,
    description: 'Quality control and assurance',
    color: 'bg-red-500',
  },
  {
    id: 'hr',
    name: 'HR',
    icon: UserCheck,
    description: 'Human resources management',
    color: 'bg-pink-500',
  },
  {
    id: 'compliance',
    name: 'Compliance',
    icon: Shield,
    description: 'Regulatory compliance',
    color: 'bg-yellow-500',
  },
  {
    id: 'broadloom',
    name: 'Broadloom',
    icon: Building2,
    description: 'Broadloom carpet production',
    color: 'bg-indigo-500',
  },
  {
    id: 'merchandising',
    name: 'Merchandising',
    icon: Briefcase,
    description: 'Product merchandising',
    color: 'bg-teal-500',
  },
];

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('sampling');
  
  const selectedDept = DEPARTMENTS.find(d => d.id === selectedDepartment);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Department Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Department Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure users and permissions</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Departments
            </h2>
            <div className="space-y-2">
              {DEPARTMENTS.map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedDepartment === dept.id;
                
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDepartment(dept.id)}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-md ${dept.color} text-white mr-3`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{dept.name}</p>
                      <p className="text-xs text-gray-500 truncate">{dept.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Department Info */}
        {selectedDept && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center mb-2">
              <selectedDept.icon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="font-medium text-gray-900">{selectedDept.name}</h3>
            </div>
            <p className="text-sm text-gray-600">{selectedDept.description}</p>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {selectedDept && (
                <>
                  <selectedDept.icon className="h-6 w-6 text-gray-600 mr-3" />
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      {selectedDept.name} Department
                    </h1>
                    <p className="text-sm text-gray-500">Manage users and permissions</p>
                  </div>
                </>
              )}
            </div>
            <Badge variant="secondary">Admin Panel</Badge>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="members" className="h-full flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="privileges">Privileges</TabsTrigger>
                <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="members" className="mt-0">
                <DepartmentMembers department={selectedDepartment} />
              </TabsContent>
              
              <TabsContent value="privileges" className="mt-0">
                <DepartmentPrivileges department={selectedDepartment} />
              </TabsContent>
              
              <TabsContent value="dashboards" className="mt-0">
                <DepartmentDashboards department={selectedDepartment} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Component placeholders - will implement these next
function DepartmentMembers({ department }: { department: string }) {
  return <PreAuthUserManagement department={department} />;
}

function DepartmentPrivileges({ department }: { department: string }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Department Privileges</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Read & Write</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Read Dashboards</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Create Reports</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Create Discovery Charts</span>
            </label>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Management</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Edit Dashboard Settings</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Edit Permissions</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Clone Dashboards</span>
            </label>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Sharing</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Download PDF</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Share Dashboards</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Export Reports</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function DepartmentDashboards({ department }: { department: string }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Dashboard Access</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">Dashboard configurations for {department} department.</p>
      </div>
    </div>
  );
}