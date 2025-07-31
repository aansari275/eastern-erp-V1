// client/src/components/DepartmentPermissionManagement.tsx
import React, { useState, useEffect } from 'react';
import { useFirebasePermissions } from '../hooks/useFirebasePermissions';
import { Department, Role, DEPARTMENT_TABS } from '@shared/permissions';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { useToast } from '../hooks/use-toast';
import { Shield, UserCheck, Building, Users, Save, CheckCircle } from 'lucide-react';

const DepartmentPermissionManagement: React.FC = () => {
  const { users, isLoading, updateUserRole, updateUserDepartments, toggleUserActive } = useFirebasePermissions();
  const { toast } = useToast();
  const [pendingChanges, setPendingChanges] = useState<number>(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleRoleChange = (userId: string, newRole: Role) => {
    console.log(`Changing role for user ${userId} to ${newRole}`);
    updateUserRole(userId, newRole);
    setPendingChanges(prev => prev + 1);
    setLastSaved(new Date());
    toast({
      title: "Role Updated",
      description: `User role changed to ${newRole}`,
      duration: 2000,
    });
  };

  const handleDepartmentChange = (userId: string, department: Department, checked: boolean) => {
    const user = users.find(u => u.userId === userId);
    if (!user) return;

    const newDepartments = checked 
      ? [...user.departments, department]
      : user.departments.filter(d => d !== department);
    
    console.log(`Updating departments for user ${userId}:`, newDepartments);
    updateUserDepartments(userId, newDepartments);
    setPendingChanges(prev => prev + 1);
    setLastSaved(new Date());
    toast({
      title: "Department Access Updated",
      description: `${department} access ${checked ? 'granted' : 'removed'}`,
      duration: 2000,
    });
  };

  const handleActiveToggle = (userId: string, isActive: boolean) => {
    console.log(`Setting user ${userId} active status to ${isActive}`);
    toggleUserActive(userId, isActive);
    setPendingChanges(prev => prev + 1);
    setLastSaved(new Date());
    toast({
      title: "User Status Updated",
      description: `User ${isActive ? 'activated' : 'deactivated'}`,
      duration: 2000,
    });
  };

  const handleSaveAllChanges = () => {
    toast({
      title: "All Changes Saved",
      description: `Successfully saved ${pendingChanges} changes to user permissions`,
      duration: 3000,
    });
    setPendingChanges(0);
    setLastSaved(new Date());
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'Editor':
        return 'bg-green-100 text-green-800';
      case 'Viewer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentBadgeColor = (department: Department) => {
    switch (department) {
      case 'Products':
        return 'bg-purple-100 text-purple-800';
      case 'Production':
        return 'bg-orange-100 text-orange-800';
      case 'Quality':
        return 'bg-green-100 text-green-800';
      case 'Compliance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Department Access Control
          </h1>
          <p className="text-gray-600 mt-2">
            Manage user roles (Editor/Viewer) and department access (Products, Production, Quality, Compliance)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            {users.length} Users
          </Badge>
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          <Button 
            onClick={handleSaveAllChanges}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={pendingChanges === 0}
          >
            <Save className="h-4 w-4" />
            Save All Changes
            {pendingChanges > 0 && (
              <Badge variant="secondary" className="ml-1 bg-white text-green-600">
                {pendingChanges}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Permission Legend */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Permission System Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Role Types
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Editor</Badge>
                  <span>Can view and edit data in assigned departments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Viewer</Badge>
                  <span>Can only view data in assigned departments</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Department Access
              </h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">Products</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">Production</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Quality</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Compliance</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Permissions Management
          </CardTitle>
          <CardDescription>
            Configure role-based access control for each user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {users.map((user) => (
                <div key={user.userId} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  {/* User Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={user.isActive ? "default" : "secondary"}
                        className={user.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={(checked) => handleActiveToggle(user.userId, checked)}
                      />
                    </div>
                  </div>

                  {/* Role and Department Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Role Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        User Role
                      </label>
                      <Select 
                        value={user.role} 
                        onValueChange={(value: Role) => handleRoleChange(user.userId, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Editor">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">Editor</Badge>
                              <span>Can edit data</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Viewer">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-100 text-blue-800">Viewer</Badge>
                              <span>View-only access</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        Current: {user.role}
                      </Badge>
                    </div>

                    {/* Department Access */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Department Access
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Products', 'Production', 'Quality', 'Compliance'] as Department[]).map((department) => (
                          <div key={department} className="flex items-center space-x-3 p-2 border rounded-md">
                            <Checkbox
                              id={`${user.userId}-${department}`}
                              checked={user.departments.includes(department)}
                              onCheckedChange={(checked) => 
                                handleDepartmentChange(user.userId, department, checked as boolean)
                              }
                            />
                            <label 
                              htmlFor={`${user.userId}-${department}`}
                              className="text-sm font-medium cursor-pointer flex-1"
                            >
                              {department}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      {/* Current Departments Display */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.departments.map((dept) => (
                          <Badge key={dept} className={getDepartmentBadgeColor(dept)}>
                            {dept}
                          </Badge>
                        ))}
                        {user.departments.length === 0 && (
                          <Badge variant="outline" className="text-gray-500">
                            No departments assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Access Summary */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Access Summary:</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Role:</strong> {user.role} - 
                        {user.role === 'Editor' ? ' Can view and edit data' : ' Can only view data'}
                      </p>
                      <p>
                        <strong>Departments:</strong> {user.departments.length > 0 ? user.departments.join(', ') : 'None assigned'}
                      </p>
                      <p>
                        <strong>Accessible Tabs:</strong> {
                          user.departments.flatMap(dept => 
                            DEPARTMENT_TABS[dept]?.filter(tab => 
                              !tab.requiresEditAccess || user.role === 'Editor'
                            ).map(tab => tab.name) || []
                          ).length
                        } tabs available
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentPermissionManagement;