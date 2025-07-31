import { Router, Route, Switch } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import ModernLanding from "./pages/ModernLanding";
import EnhancedHome from "./pages/EnhancedHome";
import SimpleQuality from "./pages/SimpleQuality";
import SamplingDashboard from "./components/SamplingDashboard";
import NavbarTest from "./pages/NavbarTest";
import AuditTestPage from "./pages/AuditTestPage";
import AuditSaveTest from "./components/AuditSaveTest";

// Components
import ModernLayout from "./components/ModernLayout";
import UserAccessControl from "./components/UserAccessControl";
import LoadingScreen from "./components/LoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary";

// Hooks
import { useAuth } from "./hooks/useAuth";
import { useAccessControl } from "./hooks/useAccessControl";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();
  const { canAccessDepartment } = useAccessControl();

  // For testing purposes, allow bypassing authentication
  const isTestMode = window.location.search.includes('test=true');
  const isDevMode = process.env.NODE_ENV === 'development';
  
  // Temporary: Always allow access in development mode
  const allowFullAccess = isDevMode || isTestMode;

  if (loading) {
    return <LoadingScreen />;
  }

  // Show landing page for unauthenticated users
  if (!user && !isTestMode) {
    return (
      <Router>
        <Switch>
          <Route path="*" component={ModernLanding} />
        </Switch>
      </Router>
    );
  }

  return (
    <Router>
      <ModernLayout>
        <ErrorBoundary>
          <Switch>
            {/* Home Route - Always accessible */}
            <Route path="/" component={EnhancedHome} />
            
            {/* Admin Routes */}
            <Route path="/admin/users">
              {(user?.email?.includes('admin') || canAccessDepartment('admin') || allowFullAccess) ? 
                <UserAccessControl /> : 
                <AccessDeniedPage department="Admin Panel" />
              }
            </Route>
            
            {/* Test Routes for Development */}
            {isDevMode && (
              <>
                <Route path="/navbar-test" component={NavbarTest} />
                <Route path="/audit-test" component={AuditTestPage} />
                <Route path="/save-test" component={AuditSaveTest} />
              </>
            )}
            
            {/* Protected Department Routes */}
            <Route path="/sampling">
              {canAccessDepartment('sampling') || allowFullAccess ? 
                <SamplingDashboard /> : 
                <AccessDeniedPage department="Sampling" />
              }
            </Route>
            
            <Route path="/quality">
              {canAccessDepartment('quality') || allowFullAccess ? 
                <SimpleQuality /> : 
                <AccessDeniedPage department="Quality Control" />
              }
            </Route>

            {/* Direct route for Bazaar Inspection */}
            <Route path="/bazaar">
              {canAccessDepartment('quality') || allowFullAccess ? 
                <SimpleQuality defaultTab="inspections" defaultSubTab="bazaar" /> : 
                <AccessDeniedPage department="Bazaar Inspection" />
              }
            </Route>
            
            <Route path="/merchandising">
              {canAccessDepartment('merchandising') || allowFullAccess ? 
                <MerchandisingDashboard /> : 
                <AccessDeniedPage department="Merchandising" />
              }
            </Route>

            {/* Production Routes */}
            <Route path="/production">
              {canAccessDepartment('production') || allowFullAccess ? 
                <ProductionDashboard /> : 
                <AccessDeniedPage department="Production" />
              }
            </Route>

            {/* Reports Routes */}
            <Route path="/reports">
              <ReportsDashboard />
            </Route>

            {/* Settings Routes */}
            <Route path="/settings">
              <SettingsPage />
            </Route>

            {/* 404 Route */}
            <Route path="*">
              <NotFoundPage />
            </Route>
          </Switch>
        </ErrorBoundary>
      </ModernLayout>
    </Router>
  );
}

// Access Denied Component
const AccessDeniedPage: React.FC<{ department: string }> = ({ department }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L12.732 4.5c-.77-.833-1.732-.833-2.5 0L3.294 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
      <p className="text-gray-600 max-w-md">
        You don't have permission to access {department}. Please contact your administrator for access.
      </p>
      <button 
        onClick={() => window.history.back()} 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Go Back
      </button>
    </div>
  </div>
);

// Placeholder components - these would be implemented based on your requirements
const MerchandisingDashboard = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Merchandising Dashboard</h1>
      <p className="text-gray-600">Advanced merchandising features with buyer management, order tracking, and analytics.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900">Buyer Management</h3>
          <p className="text-sm text-blue-700 mt-2">Manage buyer relationships and contracts</p>
        </div>
        <div className="p-6 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900">Order Tracking</h3>
          <p className="text-sm text-green-700 mt-2">Track production orders and delivery schedules</p>
        </div>
        <div className="p-6 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-900">Analytics</h3>
          <p className="text-sm text-purple-700 mt-2">Sales analytics and performance metrics</p>
        </div>
      </div>
    </div>
  </div>
);

const ProductionDashboard = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Production Dashboard</h1>
      <p className="text-gray-600">Monitor production workflows, resource allocation, and efficiency metrics.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-orange-50 rounded-lg">
          <h3 className="font-semibold text-orange-900">Production Planning</h3>
          <p className="text-sm text-orange-700 mt-2">Plan and schedule production activities</p>
        </div>
        <div className="p-6 bg-red-50 rounded-lg">
          <h3 className="font-semibold text-red-900">Resource Management</h3>
          <p className="text-sm text-red-700 mt-2">Manage materials, machines, and workforce</p>
        </div>
        <div className="p-6 bg-indigo-50 rounded-lg">
          <h3 className="font-semibold text-indigo-900">Quality Control</h3>
          <p className="text-sm text-indigo-700 mt-2">Monitor quality at each production stage</p>
        </div>
      </div>
    </div>
  </div>
);

const ReportsDashboard = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports & Analytics</h1>
      <p className="text-gray-600">Generate comprehensive reports and gain insights from your data.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900">Quality Reports</h3>
          <p className="text-sm text-blue-700 mt-2">Lab test results and compliance reports</p>
        </div>
        <div className="p-6 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900">Production Reports</h3>
          <p className="text-sm text-green-700 mt-2">Production efficiency and output reports</p>
        </div>
        <div className="p-6 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-900">Financial Reports</h3>
          <p className="text-sm text-purple-700 mt-2">Cost analysis and profitability reports</p>
        </div>
        <div className="p-6 bg-orange-50 rounded-lg">
          <h3 className="font-semibold text-orange-900">Custom Reports</h3>
          <p className="text-sm text-orange-700 mt-2">Create custom reports and dashboards</p>
        </div>
      </div>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h1>
      <p className="text-gray-600 mb-8">Configure system preferences and manage integrations.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">Company Information</h4>
              <p className="text-sm text-gray-600 mt-1">Update company details and branding</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">User Management</h4>
              <p className="text-sm text-gray-600 mt-1">Manage user accounts and permissions</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">Notification Settings</h4>
              <p className="text-sm text-gray-600 mt-1">Configure email and system notifications</p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">ERP Database</h4>
              <p className="text-sm text-gray-600 mt-1">Configure SQL Server connection</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">Email Service</h4>
              <p className="text-sm text-gray-600 mt-1">Setup email notifications and alerts</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">Backup & Recovery</h4>
              <p className="text-sm text-gray-600 mt-1">Configure data backup settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m-6-4h6" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
      <button 
        onClick={() => window.location.href = '/'} 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Go Home
      </button>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <AppContent />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;