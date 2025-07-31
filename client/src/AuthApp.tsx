import React from 'react';
import { useState } from 'react';
import { Router, Route, Switch } from "wouter";
import { Link } from "wouter";
import { AuthProvider, useAuth } from './components/AuthProvider';
import GoogleSignIn from './components/GoogleSignIn';
import UserMenu from './components/UserMenu';
import CreateRugForm from './components/CreateRugForm';
import RugGallery from './components/RugGallery';
import { 
  Package, 
  ShoppingCart, 
  Settings, 
  ClipboardCheck,
  FileText,
  TestTube,
  Shield,
  Building2
} from 'lucide-react';

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium">Loading Eastern ERP...</p>
    </div>
  </div>
);

// Landing Page with Authentication
const LandingPage: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    // Redirect to home if already authenticated
    window.location.href = '/home';
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Eastern ERP</h1>
            <p className="text-gray-600">Enterprise Resource Planning Solution</p>
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600 text-sm">Sign in to access your dashboard</p>
            </div>
            
            <GoogleSignIn />
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LandingPage />;
  }

  return <>{children}</>;
};

// Home Dashboard
const HomePage: React.FC = () => {
  const modules = [
    { name: 'Sampling', icon: Package, path: '/sampling', color: 'bg-blue-500' },
    { name: 'Quality', icon: ClipboardCheck, path: '/quality', color: 'bg-green-500' },
    { name: 'Merchandising', icon: ShoppingCart, path: '/merchandising', color: 'bg-purple-500' },
    { name: 'Admin', icon: Settings, path: '/admin', color: 'bg-gray-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/attached_assets/NEW EASTERN LOGO (transparent background))v copy (3)_1753322709558.png" 
                alt="Eastern Mills Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  // Fallback to icon if logo fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.innerHTML = '<svg class="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V7L12 2z"/></svg>';
                  target.parentNode?.insertBefore(fallback, target);
                }}
              />
              <h1 className="text-2xl font-bold text-gray-900">Eastern ERP Dashboard</h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to your workspace</h2>
          <p className="text-gray-600">Select a module to get started</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Link key={module.name} href={module.path}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer group">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${module.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.name}</h3>
                  <p className="text-sm text-gray-500">Click to access module</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Sampling Page
const SamplingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/attached_assets/NEW EASTERN LOGO (transparent background))v copy (3)_1753322709558.png" 
                alt="Eastern Mills Logo" 
                className="h-6 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.innerHTML = '<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>';
                  target.parentNode?.insertBefore(fallback, target);
                }}
              />
              <h1 className="text-2xl font-bold text-gray-900">Sampling</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/home" className="text-blue-600 hover:text-blue-800">← Home</Link>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-3 font-medium ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              >
                Create Rug
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-6 py-3 font-medium ${activeTab === 'gallery' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              >
                Rug Gallery
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'create' && (
              <CreateRugForm 
                onSuccess={(rugId) => {
                  // Switch to gallery tab to show the newly created rug
                  setActiveTab('gallery');
                }}
                className="max-w-none"
              />
            )}
            {activeTab === 'gallery' && (
              <RugGallery className="max-w-none" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Production Quality Page
const QualityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inspections');
  const [inspectionSubTab, setInspectionSubTab] = useState('general');
  const [complianceSubTab, setComplianceSubTab] = useState('internal');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/attached_assets/NEW EASTERN LOGO (transparent background))v copy (3)_1753322709558.png" 
                alt="Eastern Mills Logo" 
                className="h-6 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.innerHTML = '<svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
                  target.parentNode?.insertBefore(fallback, target);
                }}
              />
              <h1 className="text-2xl font-bold text-gray-900">Quality</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/home" className="text-blue-600 hover:text-blue-800">← Home</Link>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('inspections')}
                className={`px-6 py-3 font-medium ${activeTab === 'inspections' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
              >
                Inspections
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                className={`px-6 py-3 font-medium ${activeTab === 'compliance' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
              >
                Compliance
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'inspections' && (
              <div>
                <div className="border-b mb-4">
                  <nav className="flex">
                    <button
                      onClick={() => setInspectionSubTab('general')}
                      className={`px-4 py-2 text-sm font-medium ${inspectionSubTab === 'general' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    >
                      General
                    </button>
                    <button
                      onClick={() => setInspectionSubTab('lab')}
                      className={`px-4 py-2 text-sm font-medium ${inspectionSubTab === 'lab' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    >
                      Lab
                    </button>
                  </nav>
                </div>
                
                {inspectionSubTab === 'general' && (
                  <div className="text-center py-12">
                    <ClipboardCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">General Inspections</h3>
                    <p className="text-gray-500">Raw Material, On Loom, Pre-Packing inspections</p>
                  </div>
                )}
                
                {inspectionSubTab === 'lab' && (
                  <div className="text-center py-12">
                    <TestTube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Lab Testing</h3>
                    <p className="text-gray-500">Dyed Testing, Undyed Testing, Cotton Testing</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'compliance' && (
              <div>
                <div className="border-b mb-4">
                  <nav className="flex">
                    <button
                      onClick={() => setComplianceSubTab('internal')}
                      className={`px-4 py-2 text-sm font-medium ${complianceSubTab === 'internal' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
                    >
                      Internal
                    </button>
                    <button
                      onClick={() => setComplianceSubTab('external')}
                      className={`px-4 py-2 text-sm font-medium ${complianceSubTab === 'external' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
                    >
                      External
                    </button>
                  </nav>
                </div>
                
                {complianceSubTab === 'internal' && (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Internal Compliance</h3>
                    <p className="text-gray-500">Internal audits and process reviews</p>
                  </div>
                )}
                
                {complianceSubTab === 'external' && (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">External Compliance</h3>
                    <p className="text-gray-500">External audits and certifications</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Merchandising Page
const MerchandisingPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Merchandising</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/home" className="text-blue-600 hover:text-blue-800">← Home</Link>
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Merchandising Management</h3>
          <p className="text-gray-500">Buyer management, products, and orders</p>
        </div>
      </div>
    </div>
  </div>
);

// Admin Page
const AdminPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/home" className="text-blue-600 hover:text-blue-800">← Home</Link>
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Administration</h3>
          <p className="text-gray-500">User management and system settings</p>
        </div>
      </div>
    </div>
  </div>
);

// Main App Component
const AppContent: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/home">
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        </Route>
        <Route path="/sampling">
          <ProtectedRoute>
            <SamplingPage />
          </ProtectedRoute>
        </Route>
        <Route path="/quality">
          <ProtectedRoute>
            <QualityPage />
          </ProtectedRoute>
        </Route>
        <Route path="/merchandising">
          <ProtectedRoute>
            <MerchandisingPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin">
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        </Route>
        <Route path="*">
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
              <Link href="/home" className="text-blue-600 hover:text-blue-800">← Go Home</Link>
            </div>
          </div>
        </Route>
      </Switch>
    </Router>
  );
};

// Main AuthApp with Provider
function AuthApp() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default AuthApp;