import React from 'react';
import { Building2, Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo Animation */}
        <div className="relative">
          <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl mx-auto animate-pulse">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-20 animate-ping"></div>
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Eastern Mills ERP
          </h1>
          <p className="text-gray-600">Loading your manufacturing platform...</p>
        </div>

        {/* Loading Indicator */}
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          <div className="text-gray-600">Please wait</div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Messages */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>Connecting to secure servers...</p>
          <p>Verifying authentication...</p>
          <p>Loading dashboard...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;