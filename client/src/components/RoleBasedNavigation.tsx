import { Link, useLocation } from 'wouter';
import { Button } from './ui/button';
import { AuthButton } from './AuthButton';
import { 
  Home,
  Factory,
  ShoppingCart,
  Settings,
  Users
} from 'lucide-react';
import easternMillsLogo from '@assets/NEW EASTERN LOGO (transparent background))v copy_1752515571325.png';
import { usePermissions } from '../hooks/usePermissions';

export function RoleBasedNavigation() {
  const [location] = useLocation();
  const { user, canManageUsers } = usePermissions();

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
    },
    {
      path: '/sampling',
      label: 'Sampling Department',
      icon: Factory,
    },
    {
      path: '/merchandising',
      label: 'Merchandising Department',
      icon: ShoppingCart,
    },
  ];

  // Add Admin tab only for users with admin access
  if (canManageUsers() || user?.role === 'admin') {
    navItems.push({
      path: '/admin',
      label: 'Admin Dashboard',
      icon: Settings,
    });
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <img 
                src={easternMillsLogo} 
                alt="Eastern Mills" 
                className="h-[130px] w-auto mr-6"
              />
            </Link>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}