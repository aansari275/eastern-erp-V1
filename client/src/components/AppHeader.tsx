import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Menu, User } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Eastern Mills logo
const easternMillsLogo = '/eastern-logo-main.png';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showUserMenu?: boolean;
  className?: string;
}

export default function AppHeader({ 
  title, 
  subtitle, 
  showUserMenu = true, 
  className = '' 
}: AppHeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title Section */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <img 
              src={easternMillsLogo} 
              alt="Eastern Mills" 
              className="h-8 w-auto sm:h-10 flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* User Menu */}
          {showUserMenu && user && (
            <div className="flex items-center gap-2 ml-4">
              {/* User info - hidden on mobile */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                  {user.displayName || user.email}
                </p>
                <p className="text-xs text-gray-500">Eastern Mills</p>
              </div>

              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="sm:hidden px-2 py-1.5">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.displayName || user.email}
                    </p>
                    <p className="text-xs text-gray-500">Eastern Mills</p>
                  </div>
                  <DropdownMenuSeparator className="sm:hidden" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}