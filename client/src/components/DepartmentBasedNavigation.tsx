import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Building2,
  Scissors,
  Factory,
  Zap,
  FlaskConical,
  Users,
  Shield,
  Grid3x3,
  ShoppingBag,
  LogOut,
  Lock,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDepartmentPermissions } from '../hooks/useDepartmentPermissions';
import { 
  DEPARTMENTS, 
  DEPARTMENT_TABS,
  getDepartmentName,
  getTabName,
  canAccessDepartment,
  canAccessTab,
  type DepartmentRole 
} from '../lib/departmentPermissions';
import SimpleQuality from '@/pages/SimpleQuality';
import RoleBasedUserManagement from './RoleBasedUserManagement';

// Updated Eastern logo
import easternMillsLogo from '@assets/NEW EASTERN LOGO (transparent background))v copy (3)_1753322709558.png';

const DEPARTMENT_ICONS: Record<string, React.ReactNode> = {
  [DEPARTMENTS.SAMPLING]: <Scissors className="h-6 w-6" />,
  [DEPARTMENTS.DESIGNING]: <Grid3x3 className="h-6 w-6" />,
  [DEPARTMENTS.PRODUCTION]: <Factory className="h-6 w-6" />,
  [DEPARTMENTS.SPINNING]: <Zap className="h-6 w-6" />,
  [DEPARTMENTS.QUALITY]: <FlaskConical className="h-6 w-6" />,
  [DEPARTMENTS.HR]: <Users className="h-6 w-6" />,
  [DEPARTMENTS.COMPLIANCE]: <Shield className="h-6 w-6" />,
  [DEPARTMENTS.BROADLOOM]: <Building2 className="h-6 w-6" />,
  [DEPARTMENTS.MERCHANDISING]: <ShoppingBag className="h-6 w-6" />,
};

const DepartmentBasedNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { role, isLoading, error } = useDepartmentPermissions();
  const [currentDepartment, setCurrentDepartment] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your permissions...</p>
        </div>
      </div>
    );
  }

  // Get accessible departments for the user
  const accessibleDepartments = Object.values(DEPARTMENTS).filter(dept => 
    canAccessDepartment(role, dept)
  );
  
  console.log('🔍 DepartmentBasedNavigation Debug:', {
    currentDepartment,
    currentTab,
    accessibleDepartments,
    roleInfo: { id: role.id, name: role.name, department: role.department }
  });

  // If user has no access to any departments, show restricted access
  if (accessibleDepartments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You don't have permission to access any departments in the system.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Your Role:</span>
                <Badge variant="outline">{role.name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Department:</span>
                <Badge variant="outline">{getDepartmentName(role.department)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tier:</span>
                <Badge variant="outline">{role.tier}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Email:</span>
                <span className="text-sm text-gray-600">{user?.email}</span>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Contact your administrator if you believe this is an error.
              </p>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no department is selected, show department selection
  if (!currentDepartment) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={easternMillsLogo} 
                alt="Eastern Mills" 
                className="h-14 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Eastern Mills</h1>
                <p className="text-xs text-gray-600">Department Access Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.displayName || user?.email}</p>
                <p className="text-xs text-gray-600">{role.name} - {getDepartmentName(role.department)}</p>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Department Selection */}
        <main className="max-w-7xl mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Department</h2>
            <p className="text-gray-600">Choose a department to access its features and tools</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibleDepartments.map((dept) => (
              <Card 
                key={dept} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setCurrentDepartment(dept)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      {DEPARTMENT_ICONS[dept]}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{getDepartmentName(dept)}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {dept === role.department ? 'Your Department' : 'Cross-Department Access'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Your Access:</span>
                      <Badge variant={dept === role.department ? "default" : "secondary"}>
                        {dept === role.department ? role.tier : 'View Only'}
                      </Badge>
                    </div>
                    
                    {/* Show available tabs */}
                    <div className="text-xs text-gray-500">
                      Available sections: {Object.keys(DEPARTMENT_TABS[dept] || {}).length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Show department-specific interface with tabs
  const departmentTabs = DEPARTMENT_TABS[currentDepartment] || {};
  const accessibleTabs = Object.entries(departmentTabs).filter(([tabId]) => {
    const access = canAccessTab(role, currentDepartment, tabId);
    return access.canView;
  });
  
  console.log('🔍 Tab filtering for department:', currentDepartment, {
    departmentTabs,
    accessibleTabs,
    allTabsInDepartment: Object.keys(departmentTabs),
    filteredTabIds: accessibleTabs.map(([tabId]) => tabId)
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentDepartment(null)}
              variant="ghost"
              size="sm"
              className="mr-2"
            >
              ← Back to Departments
            </Button>
            
            <div className="flex items-center gap-3">
              {DEPARTMENT_ICONS[currentDepartment]}
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {getDepartmentName(currentDepartment)}
                </h1>
                <p className="text-xs text-gray-600">
                  {role.name} Access
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.displayName || user?.email}</p>
              <p className="text-xs text-gray-600">{role.tier}</p>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      {accessibleTabs.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto">
              {accessibleTabs.map(([tabId, tabKey]) => {
                const access = canAccessTab(role, currentDepartment, tabId);
                return (
                  <Button
                    key={tabId}
                    onClick={() => setCurrentTab(tabId)}
                    variant={currentTab === tabId ? "default" : "ghost"}
                    size="sm"
                    className="flex-shrink-0 mr-1"
                  >
                    <div className="flex items-center gap-2">
                      <span>{getTabName(currentDepartment, tabId)}</span>
                      {access.canEdit && (
                        <Badge variant="secondary" className="text-xs">Edit</Badge>
                      )}
                      {access.canAdmin && (
                        <Badge variant="default" className="text-xs">Admin</Badge>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        {!currentTab && accessibleTabs.length > 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Select a section from the tabs above
            </h3>
            <p className="text-gray-600">
              You have access to {accessibleTabs.length} section{accessibleTabs.length !== 1 ? 's' : ''} in this department
            </p>
          </div>
        )}

        {currentTab && (
          <div>
            {/* Render appropriate component based on department and tab */}
            {currentDepartment === DEPARTMENTS.QUALITY && (
              <SimpleQuality />
            )}
            
            {role.id === 'admin' && currentTab === 'admin' && (
              <RoleBasedUserManagement />
            )}
            
            {/* Add more department-specific components as needed */}
            
            {/* Fallback content */}
            {currentDepartment !== DEPARTMENTS.QUALITY && role.id !== 'admin' && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mb-4">
                    {DEPARTMENT_ICONS[currentDepartment]}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {getTabName(currentDepartment, currentTab)}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This section is under development. Content will be added based on your department's specific needs.
                  </p>
                  <div className="text-sm text-gray-500">
                    Department: {getDepartmentName(currentDepartment)} | 
                    Your Role: {role.name} | 
                    Access Level: {canAccessTab(role, currentDepartment, currentTab).canEdit ? 'Edit' : 'View Only'}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DepartmentBasedNavigation;