import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ComplianceDashboard } from "../components/ComplianceDashboard";
import { AuditFormsDashboard } from "../components/AuditFormsDashboard";
import LabInspectionDashboard from "../components/LabInspectionDashboard";
import { BazarInspectionForm } from "../components/BazarInspectionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle, FlaskConical, Package, ShieldCheck, Eye, BarChart3, ClipboardCheck, Plus } from "lucide-react";
import { Button } from "../components/ui/button";

interface SimpleQualityProps {
  defaultTab?: string;
  defaultSubTab?: string;
}

const SimpleQuality: React.FC<SimpleQualityProps> = ({ defaultTab = "inspections", defaultSubTab }) => {
  const [showBazarInspectionForm, setShowBazarInspectionForm] = useState(false);
  const [currentMainTab, setCurrentMainTab] = useState(defaultTab);
  const [currentSubTab, setCurrentSubTab] = useState(defaultSubTab || "lab");

  console.log('🔍 SimpleQuality Debug:', {
    defaultTab,
    defaultSubTab,
    currentMainTab,
    currentSubTab,
    showBazarInspectionForm
  });

  // Enhanced Bazaar Inspection component with functional form
  const BazaarInspection = () => {
    console.log('🔍 BazaarInspection component rendering, showForm:', showBazarInspectionForm);
    if (showBazarInspectionForm) {
      return <BazarInspectionForm onBack={() => setShowBazarInspectionForm(false)} />;
    }

    return (
      <div className="p-8">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-orange-100 rounded-xl mr-4">
            <Package className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Bazaar Inspection</h3>
            <p className="text-gray-600">Quality control for market-ready products</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inspection Overview</CardTitle>
              <CardDescription>Recent bazaar inspection activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Inspections</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pass Rate</span>
                  <span className="font-semibold text-green-600">-</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Inspection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">New Inspection</CardTitle>
              <CardDescription>Start a new bazaar quality inspection</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowBazarInspectionForm(true)}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Inspection
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Previous Inspections */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Previous Inspections</CardTitle>
            <CardDescription>View and manage completed inspections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No inspections found</p>
              <p className="text-sm">Create your first bazaar inspection to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const QCInspection = () => (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-green-100 rounded-xl mr-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">100% QC Inspection</h3>
          <p className="text-gray-600">Comprehensive quality assurance protocol</p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon</h4>
          <p className="text-gray-600 max-w-md mx-auto">
            Complete quality control inspection system with defect tracking and statistical analysis.
          </p>
        </div>
      </div>
    </div>
  );

  const FinalInspection = () => (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-purple-100 rounded-xl mr-4">
          <Eye className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Final Inspection</h3>
          <p className="text-gray-600">Pre-shipment quality verification</p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100">
        <div className="text-center">
          <Eye className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon</h4>
          <p className="text-gray-600 max-w-md mx-auto">
            Final quality verification system ensuring products meet all specifications before shipment.
          </p>
        </div>
      </div>
    </div>
  );

  const AQLInspection = () => (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-indigo-100 rounded-xl mr-4">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">AQL Inspection</h3>
          <p className="text-gray-600">Acceptable Quality Level standards</p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon</h4>
          <p className="text-gray-600 max-w-md mx-auto">
            Statistical sampling inspection based on AQL standards with automated acceptance criteria.
          </p>
        </div>
      </div>
    </div>
  );

  const LabInspection = () => (
    <div className="p-6">
      <LabInspectionDashboard selectedCompany="EHI" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Clean Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quality Control Dashboard</h1>
          <p className="text-gray-600">Manage compliance audits and quality inspections</p>
        </div>
      </div>

      {/* Main Tabs: Inspections, Compliance, and Audit */}
      <Tabs value={currentMainTab} onValueChange={setCurrentMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white border">
          <TabsTrigger 
            value="inspections" 
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
          >
            <Eye className="h-4 w-4 mr-2" />
            Inspections
          </TabsTrigger>
          <TabsTrigger 
            value="compliance" 
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger 
            value="audit" 
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Audit
          </TabsTrigger>
        </TabsList>

        {/* Inspections Tab Content */}
        <TabsContent value="inspections" className="mt-0">
          <Tabs value={currentSubTab} onValueChange={setCurrentSubTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4 bg-blue-50">
              <TabsTrigger value="lab" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                <FlaskConical className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Lab</span>
              </TabsTrigger>
              <TabsTrigger value="bazaar" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                <Package className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Bazaar</span>
              </TabsTrigger>
              <TabsTrigger value="qc" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">100% QC</span>
              </TabsTrigger>
              <TabsTrigger value="final" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                <Eye className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Final</span>
              </TabsTrigger>
              <TabsTrigger value="aql" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                <BarChart3 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">AQL</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lab" className="mt-0">
              <Card className="border-0 shadow-sm">
                <LabInspection />
              </Card>
            </TabsContent>

            <TabsContent value="bazaar" className="mt-0">
              <Card className="border-0 shadow-sm">
                {/* Debug: Ensure correct component is being rendered */}
                <BazaarInspection />
              </Card>
            </TabsContent>

            <TabsContent value="qc" className="mt-0">
              <Card className="border-0 shadow-sm">
                <QCInspection />
              </Card>
            </TabsContent>

            <TabsContent value="final" className="mt-0">
              <Card className="border-0 shadow-sm">
                <FinalInspection />
              </Card>
            </TabsContent>

            <TabsContent value="aql" className="mt-0">
              <Card className="border-0 shadow-sm">
                <AQLInspection />
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Compliance Tab Content */}
        <TabsContent value="compliance" className="mt-0">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <ComplianceDashboard selectedCompany="EHI" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab Content */}
        <TabsContent value="audit" className="mt-0">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <AuditFormsDashboard selectedCompany="EHI" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleQuality;
