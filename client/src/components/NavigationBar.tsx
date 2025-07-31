import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useAccessControl } from '../hooks/useAccessControl';
import { Home, Beaker, Package, ShoppingCart, LogOut } from 'lucide-react';

// Eastern Mills logo
const easternMillsLogo = '/eastern-logo-main.png';

export default function NavigationBar() {
  const { user, logout } = useAuth();
  const { canAccessDepartment, getUserDepartmentInfo } = useAccessControl();
  const [location] = useLocation();
  
  const departmentInfo = getUserDepartmentInfo();
  
  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
      department: null,
    },
    {
      path: '/quality',
      label: 'Quality',
      icon: Beaker,
      department: 'quality',
    },
    {
      path: '/sampling',
      label: 'Sampling',
      icon: Package,
      department: 'sampling',
    },
    {
      path: '/merchandising',
      label: 'Merchandising',
      icon: ShoppingCart,
      department: 'merchandising',
    },
  ];
  
  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src={easternMillsLogo} 
              alt="Eastern Mills" 
              className="h-8 w-auto sm:h-10"
            />
            <h1 className="hidden sm:block text-lg font-semibold text-gray-900">
              Eastern Mills
            </h1>
          </div>
          
          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="flex space-x-6 justify-center">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location === item.path;
                
                // Check access for department pages
                if (item.department && !canAccessDepartment(item.department)) {
                  return null;
                }
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
          
          {/* User Info and Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                {user?.displayName || user?.email}
              </div>
              {departmentInfo && (
                <div className="text-xs text-gray-500">
                  {departmentInfo.department}
                </div>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}