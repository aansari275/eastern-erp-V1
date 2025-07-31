import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Home, 
  FlaskConical, 
  Users, 
  ClipboardCheck, 
  Settings,
  Menu,
  X,
  LogOut,
  Lock,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions, useHasPermission, useCanAccessDepartment } from '../hooks/usePermissions';
import { PERMISSIONS } from '../../shared/permissions';
import SimpleQuality from '@/pages/SimpleQuality';
import SimpleUserManagement from './SimpleUserManagement';
import ProtectedRoute from './ProtectedRoute';

const TeamBasedNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { role, permissions, isLoading } = usePermissions();
  const [currentView, setCurrentView] = useState<'home' | 'quality' | 'admin'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Permission checks
  const canViewQuality = useHasPermission(PERMISSIONS.VIEW_QUALITY) || useHasPermission(PERMISSIONS.VIEW_LAB) || useHasPermission(PERMISSIONS.VIEW_COMPLIANCE);
  const canViewAdmin = useHasPermission(PERMISSIONS.MANAGE_USERS) || useHasPermission(PERMISSIONS.MANAGE_PERMISSIONS);
  const canAccessQualityDept = useCanAccessDepartment('quality');
  const canAccessAdminDept = useCanAccessDepartment('admin');

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

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user data found, show error message
  if (!userData) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 max-w-2xl mx-auto mt-8">
        <CardContent className="p-8 text-center">
          <User className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Account Setup Required</h2>
          <p className="text-yellow-600 mb-4">
            Your account is not yet set up in the system. Please contact your administrator to complete your account setup.
          </p>
          <p className="text-sm text-yellow-600">
            Signed in as: {user?.email}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Check if user has admin role
  const isAdmin = userData.Role === 'admin' || userData.role === 'admin';

  // Determine team memberships
  const teamMembership: TeamMembership = {
    isSamplingTeam: userData.departments?.includes('Sampling') || isAdmin,
    isQualityTeam: userData.departments?.includes('Quality') || isAdmin,
    qualityCompany: userData.qualityCompany || 'EHI',
    samplingRole: userData.role === 'Editor' || isAdmin ? 'Manager' : 'Member',
    qualityRole: userData.qualityRole || 'Inspector',
    qualityPermissions: userData.qualityPermissions || {},
    samplingPermissions: userData.samplingPermissions || {},
  };

  // If user is not admin and not in any team, show access denied with logout option
  if (!isAdmin && !teamMembership.isSamplingTeam && !teamMembership.isQualityTeam) {
    return (
      <Card className="border-red-200 bg-red-50 max-w-2xl mx-auto mt-8">
        <CardContent className="p-8 text-center">
          <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Access Restricted</h2>
          <p className="text-red-600 mb-4">
            You are not assigned to any team. Please contact your administrator to get access to Sampling Team or Quality Team.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-red-700 mb-4">
            <User className="h-4 w-4" />
            {user?.email || 'Unknown user'}
          </div>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Available department options based on team membership
  const availableDepartments = [];

  if (teamMembership.isSamplingTeam) {
    availableDepartments.push({
      id: 'sampling',
      name: 'Sampling Department',
      description: 'Rug creation, materials, and costing',
      icon: <Factory className="h-8 w-8" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      route: '/sampling',
      tabs: getFilteredSamplingTabs(teamMembership.samplingPermissions),
    });
  }

  if (teamMembership.isQualityTeam) {
    availableDepartments.push({
      id: 'quality',
      name: 'Quality Control',
      description: `Quality inspections for ${teamMembership.qualityCompany} (${teamMembership.qualityCompany === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.'})`,
      icon: <CheckCircle className="h-8 w-8" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      route: '/quality',
      tabs: getFilteredQualityTabs(teamMembership.qualityPermissions),
      company: teamMembership.qualityCompany,
    });
  }

  // Add admin department if user is admin
  if (isAdmin) {
    availableDepartments.push({
      id: 'admin',
      name: 'System Administration',
      description: 'User management, permissions, and system settings',
      icon: <Shield className="h-8 w-8" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      route: '/admin',
      tabs: [
        { id: 'user-management', name: 'User Management', permissions: [] },
        { id: 'team-management', name: 'Team Management', permissions: [] },
        { id: 'system-settings', name: 'System Settings', permissions: [] }
      ],
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* User Info Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {userData.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-900">{userData.username || userData.email?.split('@')[0]}</h2>
                <p className="text-blue-700">{userData.email}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {teamMembership.isSamplingTeam && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Factory className="h-3 w-3 mr-1" />
                  Sampling Team ({teamMembership.samplingRole})
                </Badge>
              )}
              {teamMembership.isQualityTeam && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Quality Team ({teamMembership.qualityCompany})
                </Badge>
              )}
              <Button 
                onClick={() => {
                  window.location.href = '/logout';
                }}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 ml-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Selection */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">Select Your Department</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {availableDepartments.map((dept) => (
            <Link key={dept.id} href={dept.route}>
              <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${dept.color} hover:scale-105`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-current">
                      {dept.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-2">{dept.name}</h4>
                      <p className="text-sm opacity-80 mb-4">{dept.description}</p>
                      
                      {/* Available Tabs Preview */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold opacity-90">Available Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {dept.tabs.slice(0, 4).map((tab: any) => (
                            <Badge key={tab.name} variant="secondary" className="text-xs">
                              {tab.icon} {tab.name}
                            </Badge>
                          ))}
                          {dept.tabs.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{dept.tabs.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Company-specific info for Quality */}
                      {dept.company && (
                        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                          <div className="flex items-center gap-2 text-xs opacity-90">
                            <Building className="h-3 w-3" />
                            <span>{dept.company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Permissions Summary */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Permissions Summary
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            {teamMembership.isSamplingTeam && (
              <div className="space-y-2">
                <h5 className="font-semibold text-blue-900">Sampling Department</h5>
                <div className="space-y-1 text-sm">
                  {Object.entries(teamMembership.samplingPermissions || {}).map(([perm, value]) => (
                    <div key={perm} className="flex items-center gap-2">
                      {value ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Eye className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={value ? 'text-green-700' : 'text-gray-500'}>
                        {perm.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {teamMembership.isQualityTeam && (
              <div className="space-y-2">
                <h5 className="font-semibold text-green-900">Quality Control ({teamMembership.qualityCompany})</h5>
                <div className="space-y-1 text-sm">
                  {Object.entries(teamMembership.qualityPermissions || {}).map(([perm, value]) => (
                    <div key={perm} className="flex items-center gap-2">
                      {value ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Eye className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={value ? 'text-green-700' : 'text-gray-500'}>
                        {perm.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to filter sampling tabs based on permissions
function getFilteredSamplingTabs(permissions: any) {
  const allTabs = [
    { name: 'Create Rugs', icon: '➕', permission: 'canCreateRugs' },
    { name: 'Rug Gallery', icon: '🖼️', permission: 'canViewGallery' },
    { name: 'Edit Rugs', icon: '✏️', permission: 'canEditRugs' },
    { name: 'Costing', icon: '💰', permission: 'canManageCosting' },
    { name: 'Quotes', icon: '📋', permission: 'canGenerateQuotes' },
  ];
  
  return allTabs.filter(tab => permissions?.[tab.permission]);
}

// Helper function to filter quality tabs based on permissions
function getFilteredQualityTabs(permissions: any) {
  const allTabs = [
    { name: 'Lab Tests', icon: '🧪', permission: 'canAccessLab' },
    { name: 'Bazaar Inspection', icon: '🏪', permission: 'canAccessBazaar' },
    { name: 'Binding Process', icon: '🔗', permission: 'canAccessBinding' },
    { name: 'Clipping & Finishing', icon: '✂️', permission: 'canAccessClipping' },
    { name: 'Final Inspection', icon: '✅', permission: 'canAccessFinalInspection' },
    { name: 'Create Inspections', icon: '📝', permission: 'canCreateInspections' },
    { name: 'Reports', icon: '📊', permission: 'canGenerateReports' },
    { name: 'Escalations', icon: '⚠️', permission: 'canManageEscalations' },
  ];
  
  return allTabs.filter(tab => permissions?.[tab.permission]);
}

export default TeamBasedNavigation;