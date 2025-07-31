import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Lock, Eye, Edit } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/queryClient';

interface DepartmentTab {
  id: string;
  departmentId: string;
  tabId: string;
  tabName: string;
  description?: string;
  route?: string;
}

interface UserPermission {
  id: string;
  userId: string;
  departmentId: string;
  tabId: string;
  permission: 'read' | 'edit';
  isActive: boolean;
}

interface Department {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export function DepartmentRouter() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('');

  // Get current department from URL
  const departmentRoute = useRoute('/:department');
  const departmentId = departmentRoute[1]?.department;

  // Fetch user's department and permissions
  const { data: userInfo } = useQuery({
    queryKey: ['/api/admin/users/email/' + user?.email],
    enabled: !!user?.email,
    retry: false,
  });

  // Redirect to user's department if not on correct page
  useEffect(() => {
    if (userInfo && (!departmentId || departmentId !== userInfo.departmentId)) {
      setLocation(`/${userInfo.departmentId}`);
    }
  }, [userInfo, departmentId, setLocation]);

  // Fetch department info
  const { data: department } = useQuery<Department>({
    queryKey: ['/api/admin/departments/' + departmentId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/departments/${departmentId}`);
      if (!response.ok) throw new Error('Failed to fetch department');
      return response.json();
    },
    enabled: !!departmentId,
  });

  // Fetch tabs for department
  const { data: tabs = [] } = useQuery<DepartmentTab[]>({
    queryKey: ['/api/admin/departments/' + departmentId + '/tabs'],
    enabled: !!departmentId,
  });

  // Fetch user permissions
  const { data: permissions = [] } = useQuery<UserPermission[]>({
    queryKey: ['/api/admin/users/' + userInfo?.id + '/permissions'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userInfo?.id}/permissions`);
      if (!response.ok) throw new Error('Failed to fetch permissions');
      return response.json();
    },
    enabled: !!userInfo?.id,
  });

  // Check if user has permission for a tab
  const hasPermission = (tabId: string): UserPermission | null => {
    const perm = permissions.find(p => 
      p.tabId === tabId && 
      p.departmentId === departmentId && 
      p.isActive
    );
    return perm || null;
  };

  // Filter tabs to only show ones user has permission for
  const authorizedTabs = tabs.filter(tab => hasPermission(tab.tabId));

  // Set initial active tab
  useEffect(() => {
    if (authorizedTabs.length > 0 && !activeTab) {
      setActiveTab(authorizedTabs[0].tabId);
    }
  }, [authorizedTabs, activeTab]);

  if (!userInfo || !department) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (departmentId !== userInfo.departmentId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have access to the {department?.name || 'this'} department.
              </p>
              <p className="mt-4">
                Redirecting to your department...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authorizedTabs.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Access</h2>
              <p className="text-muted-foreground">
                You don't have access to any tabs in the {department.name} department.
                Please contact your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{department.name} Department</h1>
            <p className="text-muted-foreground mt-1">
              Welcome {userInfo.firstName} {userInfo.lastName}
            </p>
          </div>
          <Badge className={department.color + ' text-white'}>
            {department.name}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {authorizedTabs.map((tab) => {
            const permission = hasPermission(tab.tabId);
            return (
              <TabsTrigger key={tab.tabId} value={tab.tabId} className="flex items-center gap-2">
                {tab.tabName}
                {permission && (
                  <Badge variant="outline" className="ml-2 h-5">
                    {permission.permission === 'edit' ? (
                      <Edit className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {authorizedTabs.map((tab) => {
          const permission = hasPermission(tab.tabId);
          return (
            <TabsContent key={tab.tabId} value={tab.tabId}>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">{tab.tabName}</h2>
                    <Badge variant={permission?.permission === 'edit' ? 'default' : 'secondary'}>
                      {permission?.permission === 'edit' ? 'Edit Access' : 'Read Only'}
                    </Badge>
                  </div>
                  {tab.description && (
                    <p className="text-muted-foreground mb-6">{tab.description}</p>
                  )}
                  
                  {/* Tab content will be loaded based on the route */}
                  <DepartmentTabContent 
                    departmentId={departmentId} 
                    tabId={tab.tabId} 
                    permission={permission?.permission || 'read'}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function DepartmentTabContent({ 
  departmentId, 
  tabId, 
  permission 
}: { 
  departmentId: string; 
  tabId: string; 
  permission: 'read' | 'edit';
}) {
  // This is where you would load the actual component for each tab
  // For now, we'll show a placeholder
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/10">
        <p className="text-sm text-muted-foreground mb-2">Department: {departmentId}</p>
        <p className="text-sm text-muted-foreground mb-2">Tab: {tabId}</p>
        <p className="text-sm text-muted-foreground">Permission: {permission}</p>
      </div>
      
      {permission === 'read' && (
        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <p className="text-sm text-yellow-800">
            You have read-only access to this tab. You can view information but cannot make changes.
          </p>
        </div>
      )}
      
      {permission === 'edit' && (
        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
          <p className="text-sm text-green-800">
            You have full edit access to this tab. You can view and modify information.
          </p>
        </div>
      )}
    </div>
  );
}