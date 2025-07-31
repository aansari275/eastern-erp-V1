import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { 
  Package, 
  Calculator, 
  History, 
  FileText, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home
} from 'lucide-react';
import easternMillsLogo from '@assets/NEW EASTERN LOGO (transparent background))v copy_1752515571325.png';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  accessLevels: string[]; // Which access levels can see this item
}

export default function SimplifiedNavigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Dashboard',
      icon: Home,
      accessLevels: ['admin', 'account_manager', 'viewer']
    },
    {
      path: '/products',
      label: 'Product Management',
      icon: Package,
      accessLevels: ['admin', 'account_manager']
    },
    {
      path: '/costing',
      label: 'Costing Review',
      icon: Calculator,
      accessLevels: ['admin', 'account_manager']
    },
    {
      path: '/quotes',
      label: 'Quote History',
      icon: History,
      accessLevels: ['admin', 'account_manager', 'viewer']
    },
    {
      path: '/pdocs',
      label: 'PDOC Management',
      icon: FileText,
      accessLevels: ['admin', 'account_manager']
    },
    {
      path: '/buyers',
      label: 'Buyer Management',
      icon: Users,
      accessLevels: ['admin']
    },
    {
      path: '/admin',
      label: 'System Settings',
      icon: Settings,
      accessLevels: ['admin']
    }
  ];

  // Filter navigation items based on user's access level
  const visibleNavItems = navItems.filter(item => {
    if (!user?.accessLevel) return false;
    return item.accessLevels.includes(user.accessLevel);
  });

  const getUserBadgeColor = (accessLevel: string) => {
    switch (accessLevel) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'account_manager': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessLevelLabel = (accessLevel: string) => {
    switch (accessLevel) {
      case 'admin': return 'Administrator';
      case 'account_manager': return 'Account Manager';
      case 'viewer': return 'Viewer';
      default: return 'User';
    }
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/">
              <img 
                src={easternMillsLogo} 
                alt="Eastern Mills" 
                className="h-16 w-auto"
              />
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                getUserBadgeColor(user?.accessLevel || 'viewer')
              }`}>
                {getAccessLevelLabel(user?.accessLevel || 'viewer')}
              </span>
              
              <button
                onClick={logout}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {user?.accessLevel === 'account_manager' && user?.assignedBuyers?.length > 0 && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Assigned Buyers:</span>
                <div className="mt-1">
                  {user.assignedBuyers.slice(0, 2).map((buyerId: string) => (
                    <span key={buyerId} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                      {buyerId}
                    </span>
                  ))}
                  {user.assignedBuyers.length > 2 && (
                    <span className="text-gray-500">+{user.assignedBuyers.length - 2} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button
              onClick={logout}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}