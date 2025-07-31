import React, { useState } from 'react';
import { useLocation } from 'wouter';

const ProductionQualityPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('inspections');
  const [inspectionsSubTab, setInspectionsSubTab] = useState('general');
  const [complianceSubTab, setComplianceSubTab] = useState('internal');

  const tabs = [
    { id: 'inspections', label: 'Inspections', icon: '🔍' },
    { id: 'compliance', label: 'Compliance', icon: '✅' }
  ];

  const inspectionsTabs = [
    { id: 'general', label: 'General', icon: '📋' },
    { id: 'lab', label: 'Lab', icon: '🧪' }
  ];

  const complianceTabs = [
    { id: 'internal', label: 'Internal', icon: '🏢' },
    { id: 'external', label: 'External', icon: '🌐' }
  ];

  const renderInspectionsContent = () => {
    if (inspectionsSubTab === 'general') {
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Raw Material Inspection</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🧵</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Inspect incoming raw materials for quality standards</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Start Inspection
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">On Loom Inspection</h3>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🪡</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Quality checks during the weaving process</p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Start Inspection
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pre-Packing Inspection</h3>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📦</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Final quality check before packaging</p>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Start Inspection
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Bazaar Inspection</h3>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏪</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Market-ready product quality verification</p>
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                Start Inspection
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Binding Inspection</h3>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎀</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Edge and binding quality assessment</p>
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                Start Inspection
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Clipping & Finishing</h3>
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✂️</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Final trimming and finishing inspection</p>
              <button className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">
                Start Inspection
              </button>
            </div>
          </div>

          {/* Recent Inspections */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Inspections</h3>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                <p>No recent inspections found</p>
                <p className="text-sm mt-2">Start your first inspection above</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (inspectionsSubTab === 'lab') {
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Dyed Material Testing</h3>
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎨</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Color fastness and dye quality testing</p>
              <button className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors">
                Start Lab Test
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Undyed Material Testing</h3>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🧪</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Raw material fiber analysis and quality</p>
              <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                Start Lab Test
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cotton Testing</h3>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🌱</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Cotton fiber strength and quality analysis</p>
              <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors">
                Start Lab Test
              </button>
            </div>
          </div>

          {/* Lab Test Results */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Lab Results</h3>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                <p>No lab test results available</p>
                <p className="text-sm mt-2">Conduct lab tests to see results here</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderComplianceContent = () => {
    if (complianceSubTab === 'internal') {
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Internal Audit</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Conduct internal compliance audits</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Start Internal Audit
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Process Review</h3>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🔄</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Review and audit internal processes</p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Start Process Review
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Internal Compliance Status</h3>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                <p>No internal audits completed</p>
                <p className="text-sm mt-2">Start an internal audit to track compliance</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (complianceSubTab === 'external') {
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">External Audit</h3>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏛️</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Manage external compliance audits</p>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Manage External Audit
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Certification Management</h3>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Track and manage certifications</p>
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                View Certifications
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">External Compliance Status</h3>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                <p>No external audits scheduled</p>
                <p className="text-sm mt-2">Schedule external audits to maintain compliance</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setLocation('/home')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
            <div className="flex items-center">
              <img 
                src="/eastern-logo-main.png" 
                alt="Eastern Mills" 
                className="h-8 w-auto"
              />
              <span className="ml-2 text-lg font-semibold text-gray-900">Eastern ERP</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Quality</h1>
          <p className="text-gray-600">Manage inspections and compliance for production quality</p>
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'inspections' && (
              <div>
                {/* Inspections Sub Tabs */}
                <div className="mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      {inspectionsTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setInspectionsSubTab(tab.id)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            inspectionsSubTab === tab.id
                              ? 'border-green-500 text-green-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span className="mr-2">{tab.icon}</span>
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
                {renderInspectionsContent()}
              </div>
            )}

            {activeTab === 'compliance' && (
              <div>
                {/* Compliance Sub Tabs */}
                <div className="mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      {complianceTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setComplianceSubTab(tab.id)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            complianceSubTab === tab.id
                              ? 'border-purple-500 text-purple-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span className="mr-2">{tab.icon}</span>
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
                {renderComplianceContent()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionQualityPage;