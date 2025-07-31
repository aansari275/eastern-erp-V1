import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Search, FileText, Eye, Package, Palette, Ruler, Users, Tag } from "lucide-react";
import { Rug } from "../types/rug";
import { useBuyers } from "../hooks/useBuyers";
import { useDbRugs } from "../hooks/useDbRugs";

interface MerchandisingThumbnailsProps {
  rugs: Rug[];
  onCreatePDOC: (rug: Rug, buyerId: number) => void;
}

const MerchandisingThumbnails: React.FC<MerchandisingThumbnailsProps> = ({ rugs, onCreatePDOC }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRug, setSelectedRug] = useState<Rug | null>(null);
  const [selectedBuyerId, setSelectedBuyerId] = useState<number | null>(null);
  const { buyers, isLoading: buyersLoading } = useBuyers();
  
  // Get all rugs from database (all users) for product search
  const { data: allDbRugs = [], isLoading: rugsLoading } = useDbRugs(''); // Empty userId to get all rugs

  // Combine rugs from props and database rugs
  const allRugs = [...rugs, ...allDbRugs];

  const filteredRugs = allRugs.filter(rug => 
    rug.designName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rug.construction?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rug.quality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rug.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rug.buyerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePDOC = () => {
    if (selectedRug && selectedBuyerId) {
      onCreatePDOC(selectedRug, selectedBuyerId);
      setSelectedRug(null);
      setSelectedBuyerId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Search</h2>
          <p className="text-gray-600">Browse all products from sampling department</p>
        </div>
        <Badge variant="outline" className="w-fit">
          {filteredRugs.length} of {allRugs.length} products {rugsLoading ? '(Loading...)' : ''}
        </Badge>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by design name, construction, quality, color, or buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRugs.map((rug) => (
          <Card key={rug.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <CardTitle className="text-sm font-medium line-clamp-2">
                {rug.designName}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0 pb-3">
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Construction:</span>
                  <span className="font-medium">{rug.construction}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality:</span>
                  <span className="font-medium">{rug.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="font-medium">{rug.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Color:</span>
                  <span className="font-medium truncate">{rug.color}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Type:</span>
                  <span className="font-medium">{rug.orderType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Buyer:</span>
                  <span className="font-medium truncate">{rug.buyerName}</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-0 flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{rug.designName}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                      <h4 className="font-medium mb-2">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Construction:</strong> {rug.construction}</div>
                        <div><strong>Quality:</strong> {rug.quality}</div>
                        <div><strong>Size:</strong> {rug.size}</div>
                        <div><strong>Color:</strong> {rug.color}</div>
                        <div><strong>Order Type:</strong> {rug.orderType}</div>
                        <div><strong>Buyer:</strong> {rug.buyerName}</div>
                        <div><strong>OPS No:</strong> {rug.opsNo}</div>
                        <div><strong>Carpet No:</strong> {rug.carpetNo}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Technical Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Finished GSM:</strong> {rug.finishedGSM}</div>
                        <div><strong>Unfinished GSM:</strong> {rug.unfinishedGSM}</div>
                        <div><strong>Dyeing Type:</strong> {rug.typeOfDyeing}</div>
                        <div><strong>Reed No/Quality:</strong> {rug.reedNoQuality}</div>
                        <div><strong>Washing:</strong> {rug.hasWashing}</div>
                        <div><strong>Submitted By:</strong> {rug.submittedBy}</div>
                        <div><strong>Area:</strong> {rug.area} sq ft</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Materials Section */}
                  <div>
                    <h4 className="font-medium mb-2">Materials</h4>
                    <div className="space-y-2">
                      {rug.materials.map((material, index) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>{material.name} ({material.type})</span>
                          <span className="text-gray-600">Consumption: {material.consumption}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Process Flow */}
                  <div>
                    <h4 className="font-medium mb-2">Process Flow</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {rug.processFlow.map((step, index) => (
                        <div key={index} className="text-sm bg-blue-50 p-2 rounded">
                          Step {step.step}: {step.process}
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => setSelectedRug(rug)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Create PDOC
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create PDOC for {rug.designName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Select Buyer
                      </label>
                      <Select 
                        value={selectedBuyerId?.toString()} 
                        onValueChange={(value) => setSelectedBuyerId(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a buyer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {buyers.map((buyer) => (
                            <SelectItem key={buyer.id} value={buyer.id.toString()}>
                              {buyer.buyerName} - {buyer.buyerCode}
                              <div className="text-xs text-gray-500 mt-1">
                                Merchant: {buyer.merchantName}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => setSelectedRug(null)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreatePDOC}
                        disabled={!selectedBuyerId}
                      >
                        Create PDOC
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredRugs.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default MerchandisingThumbnails;