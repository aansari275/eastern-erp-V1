import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Search, DollarSign, Users, Package, Plus } from "lucide-react";
import { Rug } from "@shared/schema";
import MerchandisingThumbnails from "./MerchandisingThumbnails";
import PDOCPriceTab from "./PDOCPriceTab";
import BuyerManagement from "./BuyerManagement";
import CreateOPSManual from "./CreateOPSManual";

interface MerchandisingDashboardProps {
  rugs: Rug[];
  onCreatePDOC: (rug: Rug, buyerId: number) => void;
}

const MerchandisingDashboard: React.FC<MerchandisingDashboardProps> = ({ 
  rugs, 
  onCreatePDOC
}) => {
  const [activeTab, setActiveTab] = useState("create-ops");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Merchandising Department</h1>
          <p className="text-gray-600">Manage products, PDOCs, and buyer relationships</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-white shadow-lg rounded-lg h-auto">
            <TabsTrigger 
              value="create-ops" 
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm hover:bg-gray-50 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Create OPS
            </TabsTrigger>
            <TabsTrigger 
              value="buyers" 
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm hover:bg-gray-50 transition-all duration-200"
            >
              <Users className="h-4 w-4" />
              Buyer Management
            </TabsTrigger>
            <TabsTrigger 
              value="pdoc" 
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm hover:bg-gray-50 transition-all duration-200"
            >
              PDOC Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create-ops" className="mt-6">
            <CreateOPSManual />
          </TabsContent>

          <TabsContent value="pdoc" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  PDOC Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PDOCPriceTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buyers" className="mt-6">
            <BuyerManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MerchandisingDashboard;