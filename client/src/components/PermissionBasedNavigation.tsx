import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  FlaskConical, 
  Users, 
  Shield,
  LogOut,
  Lock,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions, useHasPermission, useCanAccessDepartment } from '../hooks/usePermissions';
import { PERMISSIONS } from '../lib/permissions';
import SimpleQuality from '@/pages/SimpleQuality';
import RoleBasedUserManagement from './RoleBasedUserManagement';
import ProtectedRoute from './ProtectedRoute';

// Updated Eastern logo
import easternMillsLogo from '@assets/NEW EASTERN LOGO (transparent background))v copy_1753276310100.png';

const PermissionBasedNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { role, permissions, isLoading, error } = usePermissions();
  const [currentView, setCurrentView] = useState<'home' | 'quality' | 'admin'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Permission checks
  const canViewQuality = useHasPermission(PERMISSIONS.VIEW_QUALITY) || useHasPermission(PERMISSIONS.VIEW_LAB);
  const canViewAdmin = useHasPermission(PERMISSIONS.MANAGE_USERS);
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

  const availableViews = [];
  
  // Check what user can access
  if (canViewQuality && canAccessQualityDept) {
    availableViews.push({
      id: 'quality',
      name: 'Quality Control',
      description: 'Lab inspections and compliance audits',
      icon: <FlaskConical className="h-6 w-6" />,
      component: SimpleQuality,
    });
  }
  
  if (canViewAdmin && canAccessAdminDept) {
    availableViews.push({
      id: 'admin',
      name: 'Administration',
      description: 'User management and permissions',
      icon: <Shield className="h-6 w-6" />,
      component: RoleBasedUserManagement,
    });
  }

  // If user has no access to any features, show restricted access
  if (availableViews.length === 0) {
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
              You don't have permission to access any features in the system.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Your Role:</span>
                <Badge variant="outline">{role.name}</Badge>
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

  // Show main navigation for users with access
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={easternMillsLogo} 
              alt="Eastern Mills" 
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">Eastern Mills</h1>
              <p className="text-xs text-gray-600">Quality Management System</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {availableViews.map((view) => (
                <Button
                  key={view.id}
                  onClick={() => setCurrentView(view.id as any)}
                  variant={currentView === view.id ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {view.icon}
                  {view.name}
                </Button>
              ))}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.displayName || user?.email}</p>
                <p className="text-xs text-gray-600">{role.name}</p>
              </div>
              
              {/* Mobile Menu Button */}
              <Button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                variant="ghost"
                size="sm"
                className="md:hidden"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>

              {/* Logout Button */}
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
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 border-t border-gray-200 pt-4">
            <div className="space-y-2">
              {availableViews.map((view) => (
                <Button
                  key={view.id}
                  onClick={() => {
                    setCurrentView(view.id as any);
                    setIsMenuOpen(false);
                  }}
                  variant={currentView === view.id ? "default" : "ghost"}
                  className="w-full justify-start flex items-center gap-2"
                >
                  {view.icon}
                  <div className="text-left">
                    <div className="font-medium">{view.name}</div>
                    <div className="text-xs text-gray-500">{view.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        {currentView === 'home' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Eastern Mills</h2>
              <p className="text-gray-600">Select a department from the navigation above to get started.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableViews.map((view) => (
                <Card key={view.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView(view.id as any)}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {view.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{view.name}</CardTitle>
                        <p className="text-sm text-gray-600">{view.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Render current view with proper protection */}
        {currentView === 'quality' && canViewQuality && (
          <ProtectedRoute requiredDepartment="quality" requiredPermission={PERMISSIONS.VIEW_QUALITY}>
            <SimpleQuality />
          </ProtectedRoute>
        )}

        {currentView === 'admin' && canViewAdmin && (
          <ProtectedRoute requiredDepartment="admin" requiredPermission={PERMISSIONS.MANAGE_USERS}>
            <RoleBasedUserManagement />
          </ProtectedRoute>
        )}
      </main>
    </div>
  );
};

export default PermissionBasedNavigation;