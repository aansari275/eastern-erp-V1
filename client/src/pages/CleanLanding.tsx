import React from 'react';
import { Button } from '../components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';

const CleanLanding: React.FC = () => {
  const handleLogin = () => {
    // Navigate directly to the home page
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Eastern Mills
          </h1>
          <p className="text-lg text-gray-600">
            Enterprise Resource Planning System
          </p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Streamline your manufacturing operations with our comprehensive ERP solution
          </p>
        </div>

        {/* Login Button */}
        <div className="pt-8">
          <Button
            onClick={handleLogin}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <span>Access ERP System</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features */}
        <div className="pt-8 space-y-3">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Quality Control</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Sampling</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Analytics</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-12 text-xs text-gray-400">
          © 2024 Eastern Mills. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default CleanLanding;