import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { Plus, User, Lock, Edit, Eye, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  departmentId: z.string().min(1, 'Department is required'),
});

type UserFormData = z.infer<typeof userSchema>;

interface Department {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface DepartmentTab {
  id: string;
  departmentId: string;
  tabId: string;
  tabName: string;
  description?: string;
  route?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  isActive: boolean;
  hasLoggedIn: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserPermission {
  id: string;
  userId: string;
  departmentId: string;
  tabId: string;
  permission: 'read' | 'edit';
  isActive: boolean;
}

export function PreAuthUserManagement() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch departments
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/admin/departments'],
  });

  // Fetch users for selected department
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users', selectedDepartment],
    queryFn: async () => {
      const url = selectedDepartment 
        ? `/api/admin/users?departmentId=${selectedDepartment}`
        : '/api/admin/users';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: true,
  });

  // Create user form
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      departmentId: selectedDepartment || '',
    },
  });

  // Update form when department changes
  useEffect(() => {
    if (selectedDepartment) {
      form.setValue('departmentId', selectedDepartment);
    }
  }, [selectedDepartment, form]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return apiRequest('POST', '/api/admin/users', data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsCreateUserOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });

  const handleCreateUser = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Pre-Authorization User Management</h1>
        <p className="text-muted-foreground">
          Manage users and their department access with tab-level permissions
        </p>
      </div>

      {/* Department Tabs */}
      <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment} className="mb-6">
        <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-2">
          <TabsTrigger value="" className="data-[state=active]:bg-primary">
            All
          </TabsTrigger>
          {departments.map((dept) => (
            <TabsTrigger
              key={dept.id}
              value={dept.id}
              className={`data-[state=active]:${dept.color} data-[state=active]:text-white`}
            >
              {dept.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Logged In Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.hasLoggedIn).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Create User Button */}
      <div className="mb-6">
        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateUserOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            departments={departments}
          />
        ))}
        {users.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {selectedDepartment 
                  ? 'No users found in this department' 
                  : 'No users found'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function UserCard({ user, departments }: { user: User; departments: Department[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [tabs, setTabs] = useState<DepartmentTab[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const department = departments.find(d => d.id === user.departmentId);

  // Fetch tabs for the user's department
  useEffect(() => {
    if (isExpanded && user.departmentId) {
      fetch(`/api/admin/departments/${user.departmentId}/tabs`)
        .then(res => res.json())
        .then(setTabs)
        .catch(console.error);
    }
  }, [isExpanded, user.departmentId]);

  // Fetch user permissions
  useEffect(() => {
    if (isExpanded) {
      fetch(`/api/admin/users/${user.id}/permissions`)
        .then(res => res.json())
        .then(setPermissions)
        .catch(console.error);
    }
  }, [isExpanded, user.id]);

  const toggleUserStatus = useMutation({
    mutationFn: async () => {
      return apiRequest('PUT', `/api/admin/users/${user.id}`, { isActive: !user.isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Success',
        description: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
      });
    },
  });

  const updatePermission = useMutation({
    mutationFn: async ({ tabId, permission }: { tabId: string; permission: 'read' | 'edit' | null }) => {
      if (permission === null) {
        return apiRequest('DELETE', `/api/admin/users/${user.id}/permissions/${tabId}`);
      } else {
        return apiRequest('POST', `/api/admin/users/${user.id}/permissions`, {
          departmentId: user.departmentId,
          tabId,
          permission,
        });
      }
    },
    onSuccess: () => {
      // Refetch permissions
      fetch(`/api/admin/users/${user.id}/permissions`)
        .then(res => res.json())
        .then(setPermissions)
        .catch(console.error);
      
      toast({
        title: 'Success',
        description: 'Permission updated successfully',
      });
    },
  });

  const getPermissionForTab = (tabId: string) => {
    const perm = permissions.find(p => p.tabId === tabId && p.isActive);
    return perm?.permission || null;
  };

  return (
    <Card className={!user.isActive ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {department && (
              <Badge className={department.color}>
                {department.name}
              </Badge>
            )}
            <Badge variant={user.isActive ? 'default' : 'secondary'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {user.hasLoggedIn && (
              <Badge variant="outline">Logged In</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'} Permissions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleUserStatus.mutate()}
              disabled={toggleUserStatus.isPending}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-3">Tab Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tabs.map((tab) => {
                const permission = getPermissionForTab(tab.tabId);
                return (
                  <div key={tab.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">{tab.tabName}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={permission === 'read' ? 'default' : 'outline'}
                        onClick={() => updatePermission.mutate({ 
                          tabId: tab.tabId, 
                          permission: permission === 'read' ? null : 'read' 
                        })}
                        disabled={updatePermission.isPending}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={permission === 'edit' ? 'default' : 'outline'}
                        onClick={() => updatePermission.mutate({ 
                          tabId: tab.tabId, 
                          permission: permission === 'edit' ? null : 'edit' 
                        })}
                        disabled={updatePermission.isPending}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}