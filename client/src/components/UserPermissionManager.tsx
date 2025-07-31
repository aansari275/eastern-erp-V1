
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Trash2, Plus, User, Shield, Eye, Edit, Settings } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface TabPermission {
  id: string;
  tabId: string;
  permission: 'view' | 'edit' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserPermissionManagerProps {
  userId: string;
}

const AVAILABLE_TABS = [
  { id: 'rugs', label: 'Rugs Management' },
  { id: 'buyers', label: 'Buyers Management' },
  { id: 'quotes', label: 'Quote History' },
  { id: 'quality', label: 'Quality Control' },
  { id: 'overview', label: 'Overview Dashboard' },
  { id: 'permissions', label: 'Permissions Management' },
  { id: 'pdocs', label: 'PDOC Management' },
  { id: 'materials', label: 'Materials Database' },
];

const PERMISSION_TYPES = [
  { value: 'view', label: 'View Only', icon: Eye, color: 'bg-blue-100 text-blue-800' },
  { value: 'edit', label: 'Edit Access', icon: Edit, color: 'bg-green-100 text-green-800' },
  { value: 'admin', label: 'Admin Access', icon: Settings, color: 'bg-red-100 text-red-800' },
];

const UserPermissionManager: React.FC<UserPermissionManagerProps> = ({ userId }) => {
  const [permissions, setPermissions] = useState<TabPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('');
  const { toast } = useToast();

  // Fetch permissions on component mount and after changes
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/users/${userId}/permissions`);
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user permissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [userId]);

  // Add new permission
  const handleAddPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTabId || !selectedPermission) {
      toast({
        title: 'Validation Error',
        description: 'Please select both tab and permission type',
        variant: 'destructive',
      });
      return;
    }

    // Check if permission already exists
    const existingPermission = permissions.find(p => p.tabId === selectedTabId && p.isActive);
    if (existingPermission) {
      toast({
        title: 'Permission Exists',
        description: 'This user already has permission for this tab',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`/api/admin/users/${userId}/permissions`, {
        tabId: selectedTabId,
        permission: selectedPermission,
      });

      toast({
        title: 'Success',
        description: 'Permission added successfully',
      });

      // Reset form and refresh data
      setSelectedTabId('');
      setSelectedPermission('');
      fetchPermissions();
    } catch (error) {
      console.error('Error adding permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to add permission',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Remove permission
  const handleRemovePermission = async (tabId: string) => {
    try {
      await axios.delete(`/api/admin/users/${userId}/permissions/${tabId}`);
      
      toast({
        title: 'Success',
        description: 'Permission removed successfully',
      });

      fetchPermissions();
    } catch (error) {
      console.error('Error removing permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove permission',
        variant: 'destructive',
      });
    }
  };

  // Get tab label by ID
  const getTabLabel = (tabId: string) => {
    const tab = AVAILABLE_TABS.find(t => t.id === tabId);
    return tab?.label || tabId;
  };

  // Get permission type details
  const getPermissionDetails = (permission: string) => {
    const permType = PERMISSION_TYPES.find(p => p.value === permission);
    return permType || PERMISSION_TYPES[0];
  };

  // Filter available tabs (exclude already assigned ones)
  const availableTabs = AVAILABLE_TABS.filter(tab => 
    !permissions.some(p => p.tabId === tab.id && p.isActive)
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading user permissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Permissions</h2>
          <p className="text-gray-600">Manage tab access permissions for user ID: {userId}</p>
        </div>
      </div>

      {/* Add New Permission Form */}
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-green-600" />
            Add New Permission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPermission} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tab Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Tab
                </label>
                <Select value={selectedTabId} onValueChange={setSelectedTabId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a tab..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTabs.map((tab) => (
                      <SelectItem key={tab.id} value={tab.id}>
                        {tab.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Permission Type Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Permission Type
                </label>
                <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose permission level..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PERMISSION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={submitting || !selectedTabId || !selectedPermission}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {submitting ? 'Adding...' : 'Add Permission'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Permissions List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Current Permissions ({permissions.filter(p => p.isActive).length})
        </h3>

        {permissions.filter(p => p.isActive).length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Permissions Assigned</h3>
              <p className="text-gray-600">This user doesn't have any tab permissions yet. Use the form above to add permissions.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions
              .filter(p => p.isActive)
              .map((permission) => {
                const permDetails = getPermissionDetails(permission.permission);
                const IconComponent = permDetails.icon;
                
                return (
                  <Card key={permission.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {getTabLabel(permission.tabId)}
                          </h4>
                          <Badge className={`${permDetails.color} flex items-center gap-1 w-fit`}>
                            <IconComponent className="h-3 w-3" />
                            {permDetails.label}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemovePermission(permission.tabId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Added: {new Date(permission.createdAt).toLocaleDateString()}</div>
                        {permission.updatedAt !== permission.createdAt && (
                          <div>Updated: {new Date(permission.updatedAt).toLocaleDateString()}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      {/* Available Tabs Info */}
      {availableTabs.length === 0 && (
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Shield className="h-5 w-5" />
              <span className="font-medium">All Available Tabs Assigned</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              This user has been granted permissions for all available tabs.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserPermissionManager;
