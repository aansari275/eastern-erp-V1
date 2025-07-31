import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';


import { Plus, UserPlus, Edit2, Trash2, Check, X, Users, Factory } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface SamplingTeamMember {
  id: string;
  email: string;
  name: string;
  role: 'Manager' | 'Member';
  samplingPermissions: {
    canCreateRugs: boolean;
    canEditRugs: boolean;
    canDeleteRugs: boolean;
    canViewGallery: boolean;
    canManageCosting: boolean;
    canGenerateQuotes: boolean;
  };
  isActive: boolean;
  addedDate: string;
}

const defaultSamplingPermissions = {
  canCreateRugs: true,
  canEditRugs: true,
  canDeleteRugs: false,
  canViewGallery: true,
  canManageCosting: false,
  canGenerateQuotes: false,
};

export const SamplingTeamManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    email: '',
    name: '',
    role: 'Member' as 'Manager' | 'Member',
    permissions: defaultSamplingPermissions
  });

  // Fetch all users from Firebase
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  // Filter to show only sampling team members (users with sampling department)
  const samplingTeamMembers: SamplingTeamMember[] = allUsers
    .filter((user: any) => user.departments && user.departments.includes('Sampling'))
    .map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.username || user.email.split('@')[0],
      role: user.role === 'Editor' ? 'Manager' : 'Member',
      samplingPermissions: user.samplingPermissions || defaultSamplingPermissions,
      isActive: user.isActive,
      addedDate: user.createdAt || new Date().toISOString()
    }));

  // Mutation to add team member
  const addMemberMutation = useMutation({
    mutationFn: async (memberData: any) => {
      const response = await fetch(`/api/users/${memberData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departments: ['Sampling'],
          role: memberData.role === 'Manager' ? 'Editor' : 'Viewer',
          samplingPermissions: memberData.permissions
        }),
      });
      if (!response.ok) throw new Error('Failed to add team member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Success", description: "Team member added successfully" });
      setIsAddingMember(false);
      setNewMember({ email: '', name: '', role: 'Member', permissions: defaultSamplingPermissions });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add team member", variant: "destructive" });
    }
  });

  // Mutation to update permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: string; permissions: any }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samplingPermissions: permissions }),
      });
      if (!response.ok) throw new Error('Failed to update permissions');
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update the cache directly with the new data
      queryClient.setQueryData(['/api/users'], (old: any) => {
        if (!old) return old;
        return old.map((user: any) => 
          user.id === variables.userId 
            ? { ...user, samplingPermissions: variables.permissions }
            : user
        );
      });
      toast({ title: "Success", description: "Permissions updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update permissions", variant: "destructive" });
      // Refetch to get the correct state if update failed
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  const handleAddMember = () => {
    if (!newMember.email) {
      toast({ title: "Error", description: "Please select a user from the list", variant: "destructive" });
      return;
    }

    // Find user by email - should exist since we're using a dropdown
    const existingUser = allUsers.find((user: any) => user.email === newMember.email);
    if (!existingUser) {
      toast({ title: "Error", description: "Selected user not found. Please try again", variant: "destructive" });
      return;
    }

    // Check if user is already in Sampling team
    if (existingUser.departments && existingUser.departments.includes('Sampling')) {
      toast({ title: "Error", description: "User is already in the Sampling Team", variant: "destructive" });
      return;
    }

    addMemberMutation.mutate({
      id: existingUser.id,
      role: newMember.role,
      permissions: newMember.permissions
    });
  };

  const updatePermission = (userId: string, permission: string, value: boolean) => {
    const member = samplingTeamMembers.find(m => m.id === userId);
    if (member) {
      const updatedPermissions = {
        ...member.samplingPermissions,
        [permission]: value
      };
      updatePermissionsMutation.mutate({ userId, permissions: updatedPermissions });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Factory className="h-6 w-6 text-blue-600" />
            Sampling Team Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage team members who can access the Sampling Department with specific permissions
          </p>
        </div>
        <Button onClick={() => setIsAddingMember(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      {/* Add Member Form */}
      {isAddingMember && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Add New Sampling Team Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Select User from System *</Label>
                <Select value={newMember.email} onValueChange={(value) => {
                  const user = allUsers.find((u: any) => u.email === value);
                  setNewMember(prev => ({ 
                    ...prev, 
                    email: value,
                    name: user ? (user.username || user.email.split('@')[0]) : ''
                  }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user to add to Sampling Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers
                      .filter((user: any) => !user.departments || !user.departments.includes('Sampling'))
                      .map((user: any) => (
                        <SelectItem key={user.id} value={user.email}>
                          {user.username || user.email.split('@')[0]} ({user.email})
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Only showing users who are not already in the Sampling Team. 
                  Users must sign in to Google first to appear in this list.
                </p>
              </div>
              
              {/* Display selected user info */}
              {newMember.email && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Selected User:</strong> {newMember.name || newMember.email.split('@')[0]} ({newMember.email})
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newMember.role} onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value as 'Manager' | 'Member' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">Team Member</SelectItem>
                  <SelectItem value="Manager">Team Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddMember} disabled={addMemberMutation.isPending}>
                <Check className="h-4 w-4 mr-2" />
                Add Member
              </Button>
              <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Team Members ({samplingTeamMembers.length})
          </h3>
        </div>

        {samplingTeamMembers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Members</h3>
              <p className="text-gray-600">Add team members to give them access to the Sampling Department</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {samplingTeamMembers.map((member) => (
              <Card key={member.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {member.name}
                        <Badge variant={member.role === 'Manager' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                        <Badge variant={member.isActive ? 'default' : 'destructive'} className={member.isActive ? 'bg-green-100 text-green-800' : ''}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <p className="text-gray-600">{member.email}</p>
                      <p className="text-sm text-gray-500">Added: {new Date(member.addedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Sampling Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(member.samplingPermissions).map(([permission, value]) => (
                        <div key={permission} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <Label className="text-sm">
                            {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => updatePermission(member.id, permission, checked)}
                            disabled={updatePermissionsMutation.isPending}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SamplingTeamManagement;