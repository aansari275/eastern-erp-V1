import React from 'react';
import { Navbar1Demo } from '../components/ui/Navbar1Demo';

const NavbarTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar1Demo />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            New Navigation Prototype
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            This is a prototype of the new shadcn-based navigation component with 
            dropdown menus, mobile-friendly design, and Eastern Mills branding.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Desktop Navigation
              </h3>
              <p className="text-gray-600">
                Full navigation menu with dropdown submenus for Quality and Sampling departments.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Mobile Sheet Menu
              </h3>
              <p className="text-gray-600">
                Collapsible accordion-style navigation for mobile devices with all features intact.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Eastern Mills Branding
              </h3>
              <p className="text-gray-600">
                Consistent Eastern Mills logo and department-specific navigation items.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarTest;