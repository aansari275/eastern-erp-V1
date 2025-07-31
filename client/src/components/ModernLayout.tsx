import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';
import { useAccessControl } from '../hooks/useAccessControl';
import { Button } from './ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  User, LogOut, Search, Bell, Settings, HelpCircle, 
  Building2, Package, Shield, BarChart3, Users,
  Home, ChevronDown, Menu, X, Sun, Moon,
  Zap, Globe, Award, Activity
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const ModernLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { canAccessDepartment } = useAccessControl();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [darkMode, setDarkMode] = useState(false);

  const navigationItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: Home, 
      description: 'Overview and analytics',
      available: true 
    },
    { 
      name: 'Quality Control', 
      path: '/quality', 
      icon: Shield, 
      description: 'Lab testing and compliance',
      available: canAccessDepartment('quality'),
      badge: 'QC'
    },
    { 
      name: 'Sampling', 
      path: '/sampling', 
      icon: Package, 
      description: 'Rug samples and specifications',
      available: canAccessDepartment('sampling'),
      badge: 'New'
    },
    { 
      name: 'Merchandising', 
      path: '/merchandising', 
      icon: BarChart3, 
      description: 'Orders and buyer management',
      available: canAccessDepartment('merchandising')
    },
  ];

  const quickActions = [
    { name: 'New Inspection', path: '/quality', icon: Shield, color: 'bg-green-500' },
    { name: 'Create Sample', path: '/sampling', icon: Package, color: 'bg-blue-500' },
    { name: 'View Reports', path: '/reports', icon: BarChart3, color: 'bg-purple-500' },
    { name: 'Manage Users', path: '/admin', icon: Users, color: 'bg-orange-500' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        // Focus search input
        const searchInput = document.getElementById('global-search');
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigation = (path: string) => {
    setLocation(path);
    setSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Eastern Mills</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">ERP System</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              {navigationItems
                .filter(item => item.available)
                .map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-100 dark:bg-blue-800' 
                            : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500'
                        }`}>
                          <IconComponent className={`h-5 w-5 ${
                            isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.description}
                          </div>
                        </div>
                        {item.badge && (
                          <Badge variant={item.badge === 'New' ? 'default' : 'secondary'} className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    </div>
                  );
                })}
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={action.name}
                      onClick={() => handleNavigation(action.path)}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
                    >
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                        {action.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User info */}
            {user && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {user.displayName || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-72">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="global-search"
                    placeholder="Search... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {notifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                          {notifications}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="space-y-2 p-2">
                      <div className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New quality inspection result</p>
                          <p className="text-xs text-gray-500">Sample XYZ-123 has passed all tests</p>
                          <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                        <div className="p-1 bg-green-100 dark:bg-green-900 rounded-full">
                          <Package className="h-4 w-4 text-green-600 dark:text-green-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New rug sample created</p>
                          <p className="text-xs text-gray-500">Persian Garden design is ready for review</p>
                          <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                        <div className="p-1 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                          <Bell className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Quality alert</p>
                          <p className="text-xs text-gray-500">Batch ABC-456 requires attention</p>
                          <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Button variant="ghost" className="w-full text-sm">
                        View all notifications
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* User menu */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 h-10">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div className="hidden md:block text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.displayName || 'User'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help & Support
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 transition-all duration-300">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>© 2024 Eastern Mills ERP</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Version 2.1.0</span>
                <span>|</span>
                <button className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </button>
                <span>|</span>
                <button className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ModernLayout;