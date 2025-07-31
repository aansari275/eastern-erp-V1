import { Link, useLocation } from 'wouter';
import { usePermissions } from '../hooks/usePermissions';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  Home,
  Factory,
  ShoppingCart
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';

export function RoleBasedNavigation() {
  const [location] = useLocation();
  const { user, canAccessSampling, canAccessMerchandising, canAccessAdmin, canManageUsers } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({ title: "Logged out successfully" });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
      show: true,
    },
    {
      path: '/sampling',
      label: 'Sampling',
      icon: Factory,
      show: true, // Always show sampling
    },
    {
      path: '/merchandising', 
      label: 'Merchandising',
      icon: ShoppingCart,
      show: true, // Always show merchandising
    },
    {
      path: '/admin',
      label: 'Admin',
      icon: Settings,
      show: true, // Always show admin
    },
    {
      path: '/users',
      label: 'User Management',
      icon: Users,
      show: true, // Always show user management
    },
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer">
              Eastern Mills
            </Link>
            
            <nav className="flex space-x-4">
              {navItems.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <div className="text-gray-900 font-medium">{user?.email}</div>
              <div className="flex items-center gap-1 text-gray-500">
                <Badge variant="outline" className="text-xs">
                  {user?.role}
                </Badge>
                {user?.department && (
                  <Badge variant="secondary" className="text-xs">
                    {user.department}
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}