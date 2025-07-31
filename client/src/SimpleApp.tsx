import { Router, Route, Switch } from "wouter";
import { Toaster } from "./components/ui/toaster";

// Pages
import ModernLanding from "./pages/ModernLanding";
import CleanLanding from "./pages/CleanLanding";
import CleanHome from "./pages/CleanHome";
import SimpleQuality from "./pages/SimpleQuality";
import SamplingDashboard from "./components/SamplingDashboard";

// Components
import ModernLayout from "./components/ModernLayout";
import UserAccessControl from "./components/UserAccessControl";
import LoadingScreen from "./components/LoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary";

// Simple auth hooks
import { useSimpleAuth, useSimpleAccessControl } from "./hooks/useSimpleAuth";

// Create context for simple auth
import React, { createContext, useContext } from 'react';

const SimpleAuthContext = createContext<any>(null);
const SimpleAccessContext = createContext<any>(null);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useSimpleAuth();
  const access = useSimpleAccessControl();
  
  return (
    <SimpleAuthContext.Provider value={auth}>
      <SimpleAccessContext.Provider value={access}>
        {children}
      </SimpleAccessContext.Provider>
    </SimpleAuthContext.Provider>
  );
};

// Hook to use simple auth context
export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within SimpleAuthProvider');
  }
  return context;
};

// Hook to use simple access control context
export const useAccessControl = () => {
  const context = useContext(SimpleAccessContext);
  if (!context) {
    throw new Error('useAccessControl must be used within SimpleAuthProvider');
  }
  return context;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Always show the main app - no authentication barriers
  return (
    <Router>
      <ErrorBoundary>
        <Switch>
          {/* Landing Page */}
          <Route path="/landing" component={CleanLanding} />
          
          {/* Home Route - Clean standalone design */}
          <Route path="/" component={CleanHome} />
          
          {/* All other routes use ModernLayout */}
          <Route path="/admin/users">
            <ModernLayout><UserAccessControl /></ModernLayout>
          </Route>
          <Route path="/sampling">
            <ModernLayout><SamplingDashboard /></ModernLayout>
          </Route>
          <Route path="/quality">
            <ModernLayout><SimpleQuality /></ModernLayout>
          </Route>
          <Route path="/bazaar">
            <ModernLayout><SimpleQuality defaultTab="inspections" defaultSubTab="bazaar" /></ModernLayout>
          </Route>
          <Route path="/merchandising">
            <ModernLayout><MerchandisingDashboard /></ModernLayout>
          </Route>
          <Route path="/production">
            <ModernLayout><ProductionDashboard /></ModernLayout>
          </Route>
          <Route path="/reports">
            <ModernLayout><ReportsDashboard /></ModernLayout>
          </Route>
          <Route path="/settings">
            <ModernLayout><SettingsPage /></ModernLayout>
          </Route>
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </ErrorBoundary>
    </Router>
  );
}

// Placeholder components
const MerchandisingDashboard = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Merchandising Dashboard</h1>
      <p className="text-gray-600">Advanced merchandising features with buyer management, order tracking, and analytics.</p>
    </div>
  </div>
);

const ProductionDashboard = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Production Dashboard</h1>
      <p className="text-gray-600">Monitor production workflows, resource allocation, and efficiency metrics.</p>
    </div>
  </div>
);

const ReportsDashboard = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports & Analytics</h1>
      <p className="text-gray-600">Generate comprehensive reports and gain insights from your data.</p>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h1>
      <p className="text-gray-600 mb-8">Configure system preferences and manage integrations.</p>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
      <button 
        onClick={() => window.location.href = '/'} 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Go Home
      </button>
    </div>
  </div>
);

function SimpleApp() {
  return (
    <SimpleAuthProvider>
      <div className="App">
        <AppContent />
        <Toaster />
      </div>
    </SimpleAuthProvider>
  );
}

export default SimpleApp;