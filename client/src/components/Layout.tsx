import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from './ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'Quality', path: '/quality' },
    { name: 'Sampling', path: '/sampling' },
    { name: 'Merchandising', path: '/merchandising' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo and Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Eastern Mills Logo */}
              <div className="flex-shrink-0">
                <button onClick={() => setLocation('/')} className="flex items-center">
                  <img 
                    src="/attached_assets/NEW EASTERN LOGO (transparent background))v copy (3)_1753322709558.png" 
                    alt="Eastern Mills Logo" 
                    className="h-10 w-auto"
                  />
                </button>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setLocation(item.path)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location === item.path
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm text-gray-500 truncate">
                    {user.email}
                  </div>
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="flex space-x-1 overflow-x-auto pb-1">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setLocation(item.path)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    location === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;