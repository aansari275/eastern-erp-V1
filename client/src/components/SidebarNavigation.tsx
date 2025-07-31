import { Link, useLocation } from 'wouter';
import { Button } from './ui/button';
import { 
  Factory,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import easternMillsLogo from '@assets/NEW EASTERN LOGO (transparent background))v copy_1752515571325.png';
import { useAuth } from '../hooks/useAuth';

export function SidebarNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      path: '/sampling',
      label: 'Sampling Department',
      icon: Factory,
    },
  ];

  // Admin functionality removed for simplification

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
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isCollapsed ? 'px-2' : 'px-3'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.username || user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/api/auth/logout'}
            className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-left"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Collapsed User Info */}
      {isCollapsed && user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/api/auth/logout'}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="Sign Out"
            >
              <span className="text-xs font-medium text-gray-600">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}