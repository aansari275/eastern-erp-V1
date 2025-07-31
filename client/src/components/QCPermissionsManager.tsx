import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { Plus, Edit2, Trash2, Save, Users } from 'lucide-react';

interface QCPermission {
  userId: string;
  email: string;
  name: string;
  assignedStages: string[];
  isActive: boolean;
}

const ALL_INSPECTION_STAGES = [
  'Lab', 'On Loom', 'Bazaar', 'Washing', 
  'Stretching', 'Binding', '100% Finished QC', 'Final Inspection'
];

const QCPermissionsManager: React.FC = () => {
  const [qcPermissions, setQcPermissions] = useState<QCPermission[]>([]);
  const [editingUser, setEditingUser] = useState<QCPermission | null>(null);
  const [newUser, setNewUser] = useState({ email: '', name: '' });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch QC permissions on mount
  useEffect(() => {
    fetchQCPermissions();
  }, []);

  const fetchQCPermissions = async () => {
    try {
      const response = await fetch('/api/qc-permissions');
      if (response.ok) {
        const permissions = await response.json();
        setQcPermissions(permissions);
      }
    } catch (error) {
      console.error('Error fetching QC permissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch QC permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQCPermissions = async (updatedPermissions: QCPermission[]) => {
    try {
      const response = await fetch('/api/qc-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPermissions)
      });

      if (response.ok) {
        setQcPermissions(updatedPermissions);
        toast({
          title: "Success",
          description: "QC permissions updated successfully",
        });
      } else {
        throw new Error('Failed to save permissions');
      }
    } catch (error) {
      console.error('Error saving QC permissions:', error);
      toast({
        title: "Error",
        description: "Failed to save QC permissions",
        variant: "destructive",
      });
    }
  };

  const toggleStageAssignment = (userId: string, stage: string) => {
    setQcPermissions(prev => prev.map(user => {
      if (user.userId === userId) {
        const assignedStages = user.assignedStages.includes(stage)
          ? user.assignedStages.filter(s => s !== stage)
          : [...user.assignedStages, stage];
        return { ...user, assignedStages };
      }
      return user;
    }));
  };

  const toggleUserStatus = (userId: string) => {
    setQcPermissions(prev => prev.map(user => {
      if (user.userId === userId) {
        return { ...user, isActive: !user.isActive };
      }
      return user;
    }));
  };

  const addNewQCUser = () => {
    if (!newUser.email || !newUser.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in both email and name",
        variant: "destructive",
      });
      return;
    }

    const newQCUser: QCPermission = {
      userId: `qc_${Date.now()}`,
      email: newUser.email,
      name: newUser.name,
      assignedStages: [],
      isActive: true
    };

    setQcPermissions(prev => [...prev, newQCUser]);
    setNewUser({ email: '', name: '' });
    setIsAddingUser(false);
    
    toast({
      title: "Success",
      description: `QC Inspector ${newUser.name} added successfully`,
    });
  };

  const removeQCUser = (userId: string) => {
    setQcPermissions(prev => prev.filter(user => user.userId !== userId));
    toast({
      title: "Success",
      description: "QC Inspector removed successfully",
    });
  };

  const saveAllChanges = () => {
    saveQCPermissions(qcPermissions);
  };

  if (loading) {
    return <div className="p-6">Loading QC permissions...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">QC Inspector Permissions</h2>
        <p className="text-gray-600">Manage QC inspector stage assignments and access control</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total QC Inspectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qcPermissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Inspectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {qcPermissions.filter(user => user.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inactive Inspectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {qcPermissions.filter(user => !user.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button 
          onClick={() => setIsAddingUser(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add QC Inspector
        </Button>
        <Button 
          onClick={saveAllChanges}
          variant="outline"
          className="border-green-600 text-green-600 hover:bg-green-50"
        >
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      {/* Add New User Form */}
      {isAddingUser && (
        <Card className="mb-6 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Add New QC Inspector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="inspector@easternmills.com"
              />
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Inspector Name"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addNewQCUser} className="bg-green-600 hover:bg-green-700">
                Add Inspector
              </Button>
              <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QC Permissions List */}
      <div className="space-y-4">
        {qcPermissions.map((user) => (
          <Card key={user.userId} className={`${!user.isActive ? 'opacity-60 border-gray-300' : 'border-gray-200'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleUserStatus(user.userId)}
                    className={user.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeQCUser(user.userId)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-sm font-medium mb-3 block">Assigned Inspection Stages</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALL_INSPECTION_STAGES.map((stage) => (
                    <label key={stage} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.assignedStages.includes(stage)}
                        onChange={() => toggleStageAssignment(user.userId, stage)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={!user.isActive}
                      />
                      <span className={`text-sm ${!user.isActive ? 'text-gray-400' : 'text-gray-700'}`}>
                        {stage}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs">
                    {user.assignedStages.length} stages assigned
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {qcPermissions.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No QC Inspectors</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first QC inspector</p>
            <Button onClick={() => setIsAddingUser(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add QC Inspector
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QCPermissionsManager;