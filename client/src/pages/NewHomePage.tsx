import { useNewAuth } from '../hooks/useNewAuth';
import { canAccessModule, MODULES } from '../lib/newPermissions';
import { Link } from 'wouter';
import { 
  Building2, 
  Package, 
  ShoppingCart, 
  Factory, 
  Settings, 
  Users, 
  Heart, 
  ClipboardCheck,
  BarChart3 
} from 'lucide-react';

const NewHomePage = () => {
  const { user, loading } = useNewAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Eastern ERP...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h1>
        </div>
      </div>
    );
  }

  const moduleCards = [
    {
      id: MODULES.SAMPLING,
      title: 'Sampling',
      description: 'Rug creation, samples, and design management',
      icon: Package,
      color: 'bg-blue-500',
      path: '/sampling'
    },
    {
      id: MODULES.MERCHANDISING,
      title: 'Merchandising',
      description: 'Product catalog, pricing, and buyer management',
      icon: ShoppingCart,
      color: 'bg-green-500',
      path: '/merchandising'
    },
    {
      id: MODULES.PRODUCTION,
      title: 'Production',
      description: 'Manufacturing tracking and inventory management',
      icon: Factory,
      color: 'bg-orange-500',
      path: '/production'
    },
    {
      id: MODULES.QUALITY,
      title: 'Quality Control',
      description: 'Quality management and compliance audits',
      icon: ClipboardCheck,
      color: 'bg-purple-500',
      path: '/quality'
    },
    {
      id: MODULES.ORDERS,
      title: 'Orders',
      description: 'Order management and tracking',
      icon: BarChart3,
      color: 'bg-indigo-500',
      path: '/orders'
    },
    {
      id: MODULES.CRM,
      title: 'CRM',
      description: 'Customer relationship management',
      icon: Heart,
      color: 'bg-pink-500',
      path: '/crm'
    },
    {
      id: MODULES.ADMIN,
      title: 'Administration',
      description: 'User management and system settings',
      icon: Settings,
      color: 'bg-gray-600',
      path: '/admin'
    }
  ];

  const accessibleModules = moduleCards.filter(module => 
    canAccessModule(user, module.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Eastern ERP</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user.name} ({user.role.replace('_', ' ').toUpperCase()})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Welcome to Eastern ERP</h2>
            <p className="text-blue-100">
              Your unified platform for managing sampling, merchandising, production, quality control, orders, and customer relationships.
            </p>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {accessibleModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Link key={module.id} href={module.path}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                  <div className="p-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${module.color} text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Samples</h3>
            <p className="text-2xl font-bold text-gray-900">24</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Open Orders</h3>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Quality Checks</h3>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Production Units</h3>
            <p className="text-2xl font-bold text-gray-900">156</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHomePage;