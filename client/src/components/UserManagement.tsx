import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { USER_ROLES, DEPARTMENTS, PERMISSIONS, ROLE_PERMISSIONS } from '@shared/schema';
import { Edit2, Trash2, Plus, Users, Shield, Settings } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  department?: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  username: string;
  password: string;
  email: string;
  role: string;
  department: string;
  permissions: string[];
  isActive: boolean;
}

const UserManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    email: '',
    role: USER_ROLES.USER,
    department: '',
    permissions: [],
    isActive: true
  });

  const queryClient = useQueryClient();

  // Fetch users who have logged in
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/users');
      return response.json() as Promise<User[]>;
    },
  });

  // Show all users (both logged in and not logged in)
  const users = allUsers;

  // Fetch roles and permissions
  const { data: roles = {} } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/roles');
      return response.json();
    },
  });

  const { data: departments = {} } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/departments');
      return response.json();
    },
  });

  const { data: permissions = {} } = useQuery({
    queryKey: ['/api/permissions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/permissions');
      return response.json();
    },
  });

  const { data: rolePermissions = {} } = useQuery({
    queryKey: ['/api/role-permissions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/role-permissions');
      return response.json();
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const response = await apiRequest('POST', '/api/users', userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<UserFormData> }) => {
      const response = await apiRequest('PUT', `/api/users/${id}`, userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingUser(null);
      resetForm();
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      role: USER_ROLES.USER,
      department: '',
      permissions: [],
      isActive: true
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't populate password for security
      email: user.email || '',
      role: user.role,
      department: user.department || '',
      permissions: user.permissions || [],
      isActive: user.isActive
    });
  };

  const handleSave = () => {
    if (editingUser) {
      const { password, ...updateData } = formData;
      const finalData = password ? formData : updateData;
      updateUserMutation.mutate({ id: editingUser.id, userData: finalData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: rolePermissions[role] || []
    }));
  };

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN: return 'bg-red-100 text-red-800';
      case USER_ROLES.SAMPLING_MANAGER: return 'bg-blue-100 text-blue-800';
      case USER_ROLES.MERCHANDISING_MANAGER: return 'bg-green-100 text-green-800';
      case USER_ROLES.SAMPLING_USER: return 'bg-blue-50 text-blue-600';
      case USER_ROLES.MERCHANDISING_USER: return 'bg-green-50 text-green-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentBadgeColor = (department?: string) => {
    switch (department) {
      case DEPARTMENTS.ADMIN: return 'bg-purple-100 text-purple-800';
      case DEPARTMENTS.SAMPLING: return 'bg-indigo-100 text-indigo-800';
      case DEPARTMENTS.MERCHANDISING: return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h2>
          <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {resetForm(); setEditingUser(null);}}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user information and permissions' : 'Add a new user to the system'}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="password">Password {editingUser && '(leave blank to keep current)'}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roles).map(([key, value]) => (
                          <SelectItem key={key} value={value as string}>
                            {key.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(departments).map(([key, value]) => (
                          <SelectItem key={key} value={value as string}>
                            {key.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active User</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="permissions" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Role-based Permissions</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Role: <Badge className={getRoleBadgeColor(formData.role)}>{formData.role}</Badge>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(rolePermissions[formData.role] || []).map((permission: string) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Additional Permissions</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {Object.entries(permissions).map(([key, value]) => {
                      const isRolePermission = (rolePermissions[formData.role] || []).includes(value as string);
                      const isCustomPermission = formData.permissions.includes(value as string);
                      return (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={isRolePermission || isCustomPermission}
                            disabled={isRolePermission}
                            onCheckedChange={(checked) => handlePermissionToggle(value as string, checked as boolean)}
                          />
                          <Label
                            htmlFor={key}
                            className={`text-sm ${isRolePermission ? 'text-gray-500' : ''}`}
                          >
                            {key.replace('_', ' ')}
                            {isRolePermission && <span className="text-xs text-gray-400 ml-1">(role)</span>}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingUser(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createUserMutation.isPending || updateUserMutation.isPending}
              >
                {createUserMutation.isPending || updateUserMutation.isPending ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{user.username}</h3>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                    {user.department && (
                      <Badge className={getDepartmentBadgeColor(user.department)}>
                        {user.department}
                      </Badge>
                    )}
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {user.email && <p>Email: {user.email}</p>}
                    <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                    {user.lastLogin && <p>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</p>}
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions?.slice(0, 5).map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                      {user.permissions?.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.permissions.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleEdit(user);
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete user "{user.username}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first user account.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First User
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;