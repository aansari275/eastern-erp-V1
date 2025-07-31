import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useToast } from '../hooks/use-toast';
import { 
  Users, UserPlus, Settings, Shield, Eye, Edit, Trash2, 
  MoreHorizontal, Search, Filter, Download, RefreshCw,
  Check, X, AlertTriangle, Crown, Star, Key
} from 'lucide-react';

interface User {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  department?: 'sampling' | 'quality' | 'merchandising' | 'admin';
  role: 'user' | 'supervisor' | 'manager' | 'admin';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  level: 'read' | 'write' | 'admin';
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
}

const UserAccessControl: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('users');

  // Mock data - replace with actual API calls
  const mockUsers: User[] = [
    {
      id: '1',
      uid: 'user-1',
      email: 'admin@easternmills.com',
      displayName: 'System Administrator',
      department: 'admin',
      role: 'admin',
      permissions: ['*'],
      isActive: true,
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      uid: 'user-2',
      email: 'quality.manager@easternmills.com',
      displayName: 'Quality Manager',
      department: 'quality',
      role: 'manager',
      permissions: ['quality.read', 'quality.write', 'quality.manage', 'lab.inspect'],
      isActive: true,
      lastLogin: '2024-01-15T09:15:00Z',
      createdAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      uid: 'user-3',
      email: 'sampling.supervisor@easternmills.com',
      displayName: 'Sampling Supervisor',
      department: 'sampling',
      role: 'supervisor',
      permissions: ['sampling.read', 'sampling.write', 'rug.create', 'rug.edit'],
      isActive: true,
      lastLogin: '2024-01-14T16:45:00Z',
      createdAt: '2024-01-03T00:00:00Z',
    },
    {
      id: '4',
      uid: 'user-4',
      email: 'inspector@easternmills.com',
      displayName: 'Quality Inspector',
      department: 'quality',
      role: 'user',
      permissions: ['quality.read', 'lab.inspect'],
      isActive: true,
      lastLogin: '2024-01-15T08:20:00Z',
      createdAt: '2024-01-04T00:00:00Z',
    },
    {
      id: '5',
      uid: 'user-5',
      email: 'merchandiser@easternmills.com',
      displayName: 'Merchandiser',
      department: 'merchandising',
      role: 'user',
      permissions: ['merchandising.read', 'buyer.manage', 'order.create'],
      isActive: false,
      lastLogin: '2024-01-10T12:00:00Z',
      createdAt: '2024-01-05T00:00:00Z',
    },
  ];

  const mockPermissions: Permission[] = [
    { id: 'quality.read', name: 'Quality Read', description: 'View quality data', category: 'Quality', level: 'read' },
    { id: 'quality.write', name: 'Quality Write', description: 'Create and edit quality data', category: 'Quality', level: 'write' },
    { id: 'quality.manage', name: 'Quality Manage', description: 'Manage quality operations', category: 'Quality', level: 'admin' },
    { id: 'lab.inspect', name: 'Lab Inspection', description: 'Perform lab inspections', category: 'Quality', level: 'write' },
    { id: 'sampling.read', name: 'Sampling Read', description: 'View sampling data', category: 'Sampling', level: 'read' },
    { id: 'sampling.write', name: 'Sampling Write', description: 'Create and edit samples', category: 'Sampling', level: 'write' },
    { id: 'rug.create', name: 'Create Rugs', description: 'Create new rug samples', category: 'Sampling', level: 'write' },
    { id: 'rug.edit', name: 'Edit Rugs', description: 'Edit existing rug samples', category: 'Sampling', level: 'write' },
    { id: 'merchandising.read', name: 'Merchandising Read', description: 'View merchandising data', category: 'Merchandising', level: 'read' },
    { id: 'buyer.manage', name: 'Manage Buyers', description: 'Create and manage buyers', category: 'Merchandising', level: 'write' },
    { id: 'order.create', name: 'Create Orders', description: 'Create production orders', category: 'Merchandising', level: 'write' },
    { id: 'user.manage', name: 'Manage Users', description: 'Create and manage users', category: 'Admin', level: 'admin' },
    { id: 'system.admin', name: 'System Admin', description: 'Full system administration', category: 'Admin', level: 'admin' },
  ];

  const mockRoles: Role[] = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      permissions: ['*'],
      level: 5
    },
    {
      id: 'manager',
      name: 'Department Manager',
      description: 'Manage department operations',
      permissions: ['quality.read', 'quality.write', 'quality.manage', 'lab.inspect', 'user.manage'],
      level: 4
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      description: 'Supervise team operations',
      permissions: ['sampling.read', 'sampling.write', 'rug.create', 'rug.edit'],
      level: 3
    },
    {
      id: 'user',
      name: 'User',
      description: 'Standard user access',
      permissions: ['quality.read', 'lab.inspect'],
      level: 1
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setPermissions(mockPermissions);
      setRoles(mockRoles);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'manager': return <Star className="h-4 w-4 text-purple-500" />;
      case 'supervisor': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'manager': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'supervisor': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDepartmentColor = (department?: string) => {
    switch (department) {
      case 'quality': return 'bg-green-100 text-green-800';
      case 'sampling': return 'bg-blue-100 text-blue-800';
      case 'merchandising': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleUserAction = (action: string, userId: string) => {
    toast({
      title: "Action Performed",
      description: `${action} action performed for user ${userId}`,
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Access Control</h1>
        <p className="text-gray-600">Manage users, roles, and permissions across the system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Key className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Permissions</p>
                <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Roles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and access levels</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                      <SelectItem value="sampling">Sampling</SelectItem>
                      <SelectItem value="merchandising">Merchandising</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.displayName || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.department && (
                          <Badge className={getDepartmentColor(user.department)}>
                            {user.department}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.slice(0, 2).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission === '*' ? 'All' : permission.split('.')[0]}
                            </Badge>
                          ))}
                          {user.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <>
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-green-700 text-sm">Active</span>
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 text-red-500" />
                              <span className="text-red-700 text-sm">Inactive</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatLastLogin(user.lastLogin)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUserAction('View', user.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction('Edit', user.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction('Reset Password', user.id)}>
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(user.isActive ? 'Deactivate' : 'Activate', user.id)}
                              className={user.isActive ? 'text-red-600' : 'text-green-600'}
                            >
                              {user.isActive ? (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Role Management</CardTitle>
                  <CardDescription>Define roles and their associated permissions</CardDescription>
                </div>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map((role) => (
                  <Card key={role.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role.id)}
                          <h3 className="font-semibold text-gray-900">{role.name}</h3>
                        </div>
                        <Badge className={getRoleBadgeColor(role.id)}>
                          Level {role.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500">Permissions:</div>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission === '*' ? 'All' : permission.split('.')[0]}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Users with this role:</span>
                          <span>{users.filter(u => u.role === role.id).length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Permission Management</CardTitle>
                  <CardDescription>View and manage system permissions</CardDescription>
                </div>
                <Button>
                  <Key className="h-4 w-4 mr-2" />
                  Create Permission
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['Quality', 'Sampling', 'Merchandising', 'Admin'].map((category) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {permissions
                        .filter(p => p.category === category)
                        .map((permission) => (
                          <Card key={permission.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{permission.name}</h4>
                                <Badge 
                                  variant={
                                    permission.level === 'admin' ? 'destructive' :
                                    permission.level === 'write' ? 'default' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {permission.level}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{permission.description}</p>
                              <div className="mt-3 text-xs text-gray-500">
                                Permission ID: <code className="bg-gray-100 px-1 rounded">{permission.id}</code>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAccessControl;