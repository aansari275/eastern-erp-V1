import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Eye, Edit, FileText, Calendar, User, Plus, Package, Factory, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "../hooks/use-toast";
import PDOCDetailsForm from "./PDOCDetailsForm";

interface PDOC {
  id: number;
  pdocNumber: string;
  buyerId: number;
  buyerProductDesignCode: string;
  ted: string;
  productType: string;
  pdocStatus: string;
  createdAt: string;
  updatedAt: string;
  // Extended fields
  articleNumber?: string;
  skuNumber?: string;
  buyerArticleName?: string;
  sizeTolerance?: string;
  weightTolerance?: string;
  ctq?: string;
  [key: string]: any;
}

const PDOCPriceTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPDOC, setSelectedPDOC] = useState<PDOC | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRug, setSelectedRug] = useState<string>("");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("");
  const [createdPDOC, setCreatedPDOC] = useState<PDOC | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  const queryClient = useQueryClient();

  // Demo user role - replace with actual user context later
  const [currentUser, setCurrentUser] = useState({
    role: "merchant_manager", // or "merchant"
    merchantId: "israr@easternmills.com",
    assignedBuyers: ["A-01", "A-02", "A-03"] // merchant's assigned buyers
  });

  const { data: pdocs = [], isLoading, error } = useQuery({
    queryKey: ['/api/pdocs'],
    queryFn: async () => {
      const response = await fetch('/api/pdocs');
      if (!response.ok) {
        throw new Error('Failed to fetch PDOCs');
      }
      return response.json();
    },
  });

  const { data: rugs = [] } = useQuery({
    queryKey: ['/api/rugs'],
    queryFn: async () => {
      const response = await fetch('/api/rugs');
      if (!response.ok) {
        throw new Error('Failed to fetch rugs');
      }
      return response.json();
    },
  });

  const { data: buyers = [] } = useQuery({
    queryKey: ['/api/buyers'],
    queryFn: async () => {
      const response = await fetch('/api/buyers');
      if (!response.ok) {
        throw new Error('Failed to fetch buyers');
      }
      return response.json();
    },
  });

  // Filter PDOCs based on user role and assigned buyers
  const accessiblePDOCs = useMemo(() => {
    if (!pdocs || pdocs.length === 0) return [];
    
    if (currentUser.role === "merchant_manager") {
      // Merchant manager can see all PDOCs
      return pdocs;
    } else if (currentUser.role === "merchant") {
      // Regular merchant only sees PDOCs for their assigned buyers
      return pdocs.filter((pdoc: PDOC) => {
        const buyer = buyers.find((b: any) => b.id === pdoc.buyerId);
        return buyer && currentUser.assignedBuyers.includes(buyer.code);
      });
    }
    return pdocs;
  }, [pdocs, buyers, currentUser]);

  // Group PDOCs by buyer product design code as main header
  const groupPDOCsByDesign = (pdocs: PDOC[]) => {
    const groups: { [key: string]: PDOC[] } = {};
    
    pdocs.forEach(pdoc => {
      // Use the full buyer product design code as the main header
      const designCode = pdoc.buyerProductDesignCode || 'Untitled Design';
      
      if (!groups[designCode]) {
        groups[designCode] = [];
      }
      groups[designCode].push(pdoc);
    });
    
    return groups;
  };

  const filteredPDOCs = accessiblePDOCs.filter((pdoc: PDOC) =>
    pdoc.buyerProductDesignCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdoc.productType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdoc.buyerArticleName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered PDOCs
  const groupedPDOCs = groupPDOCsByDesign(filteredPDOCs);

  // Helper function to get buyer info
  const getBuyerInfo = (buyerId: number) => {
    const buyer = buyers.find((b: any) => b.id === buyerId);
    return buyer ? { name: buyer.buyerName || buyer.name, code: buyer.buyerCode || buyer.code } : { name: "Unknown", code: "N/A" };
  };

  // Helper function to extract size and color from design code
  const extractSizeColor = (designCode: string) => {
    // Try to extract size and color patterns from design codes
    // Common patterns: size like "4X6", "8X10", "2X3", colors like "BLUE", "RED", "IVORY"
    const sizePattern = /(\d+['"]*\s*X\s*\d+['"]*|\d+X\d+|\d+'\s*X\s*\d+')/i;
    const colorPattern = /(IVORY|BEIGE|BLUE|RED|GREEN|GRAY|GREY|BLACK|WHITE|BROWN|TAN|GOLD|SILVER|NAVY|CREAM|SAND|RUST|PINK|PURPLE|YELLOW|ORANGE|CHARCOAL|NATURAL)/i;
    
    const sizeMatch = designCode.match(sizePattern);
    const colorMatch = designCode.match(colorPattern);
    
    return {
      size: sizeMatch ? sizeMatch[0] : null,
      color: colorMatch ? colorMatch[0] : null
    };
  };

  // Toggle function for expandable groups
  const toggleGroup = (designName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(designName)) {
        newSet.delete(designName);
      } else {
        newSet.add(designName);
      }
      return newSet;
    });
  };

  // Helper function to get construction info from related rug
  const getConstructionInfo = (pdoc: PDOC) => {
    // Try to extract construction from buyerProductDesignCode or other fields
    const designCode = pdoc.buyerProductDesignCode || "";
    
    // Look for construction patterns in the design code
    if (designCode.includes("HAND KNOTTED") || designCode.includes("HK")) return "Hand Knotted";
    if (designCode.includes("HAND WOVEN") || designCode.includes("HW")) return "Hand Woven";
    if (designCode.includes("HAND TUFTED") || designCode.includes("HT")) return "Hand Tufted";
    if (designCode.includes("HANDLOOM")) return "Handloom";
    if (designCode.includes("PITLOOM")) return "Pitloom";
    if (designCode.includes("NEPALI")) return "Nepali";
    if (designCode.includes("VDW")) return "VDW";
    
    return pdoc.productType || "N/A";
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const createPDOCMutation = useMutation({
    mutationFn: async (data: { rugId: number; buyerId: number }) => {
      const response = await fetch('/api/pdocs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create PDOC');
      }
      
      return response.json();
    },
    onSuccess: (newPDOC) => {
      toast({
        title: "PDOC Created",
        description: `PDOC has been created successfully. Opening PDOC form...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pdocs'] });
      setCreatedPDOC(newPDOC);
      setSelectedPDOC(newPDOC);
      setShowCreateDialog(false);
      setSelectedRug("");
      setSelectedBuyer("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create PDOC",
        variant: "destructive",
      });
    },
  });

  const handleCreatePDOC = () => {
    if (!selectedRug || !selectedBuyer) return;
    
    createPDOCMutation.mutate({
      rugId: parseInt(selectedRug),
      buyerId: parseInt(selectedBuyer),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error loading PDOCs</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">PDOC Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage Product Data and Order Confirmations
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Role Switcher for Demo */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Role:</span>
            <Select 
              value={currentUser.role} 
              onValueChange={(role) => setCurrentUser({...currentUser, role: role as any})}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merchant_manager">Merchant Manager</SelectItem>
                <SelectItem value="merchant">Merchant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create PDOC
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New PDOC</DialogTitle>
              <DialogDescription>
                Select a design and buyer to create a new Product Data and Order Confirmation document.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Design
                </label>
                <Select value={selectedRug} onValueChange={setSelectedRug}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a design..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rugs.map((rug: any) => (
                      <SelectItem key={rug.id} value={rug.id.toString()}>
                        {rug.designName} ({rug.carpetNo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Buyer
                </label>
                <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a buyer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {buyers.map((buyer: any) => (
                      <SelectItem key={buyer.id} value={buyer.id.toString()}>
                        {buyer.buyerName} ({buyer.buyerCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePDOC}
                  disabled={!selectedRug || !selectedBuyer || createPDOCMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createPDOCMutation.isPending ? "Creating..." : "Create PDOC"}
                </Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search PDOCs by product code, article name, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Count and Role Info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {Object.keys(groupedPDOCs).length} design groups ({filteredPDOCs.length} total PDOCs)
          </div>
          <Badge variant="outline" className="text-xs">
            Role: {currentUser.role === "merchant_manager" ? "Manager" : "Merchant"}
          </Badge>
          {currentUser.role === "merchant" && (
            <Badge variant="outline" className="text-xs">
              Assigned: {currentUser.assignedBuyers.join(", ")}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Draft: {accessiblePDOCs.filter((p: PDOC) => p.pdocStatus === 'draft').length}</Badge>
          <Badge variant="outline">Pending: {accessiblePDOCs.filter((p: PDOC) => p.pdocStatus === 'pending').length}</Badge>
          <Badge variant="outline">Approved: {accessiblePDOCs.filter((p: PDOC) => p.pdocStatus === 'approved').length}</Badge>
        </div>
      </div>

      {/* PDOC List View - Grouped by Design */}
      <div className="space-y-3">
        {Object.entries(groupedPDOCs).map(([designName, pdocsInGroup]) => {
          // Use the first PDOC for main info
          const mainPDOC = pdocsInGroup[0];
          const buyerInfo = getBuyerInfo(mainPDOC.buyerId);
          const construction = getConstructionInfo(mainPDOC);
          
          return (
            <Card key={`design-group-${designName}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* Main Content */}
                  <div className="flex-1">
                    {/* Header - Buyer Product Design Code with Count */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-blue-600">
                        {mainPDOC.buyerProductDesignCode || designName}
                      </h3>
                      {pdocsInGroup.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          {pdocsInGroup.length} variants
                        </Badge>
                      )}
                      <Badge className={getStatusColor(mainPDOC.pdocStatus)}>
                        {mainPDOC.pdocStatus || 'draft'}
                      </Badge>
                    </div>
                    
                    {/* Key Details Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {/* Buyer Info */}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{buyerInfo.name}</div>
                          <div className="text-gray-500">{buyerInfo.code}</div>
                        </div>
                      </div>
                      
                      {/* Construction */}
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">Construction</div>
                          <div className="text-gray-500">{construction}</div>
                        </div>
                      </div>
                      
                      {/* Article Number */}
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">Article</div>
                          <div className="text-gray-500">{mainPDOC.articleNumber || 'N/A'}</div>
                        </div>
                      </div>
                      
                      {/* Created Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">Created</div>
                          <div className="text-gray-500">{formatDate(mainPDOC.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Variants as Individual Rows - Expandable */}
                    {pdocsInGroup.length > 1 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-gray-900">
                            Variants ({pdocsInGroup.length}):
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleGroup(designName)}
                            className="h-8 px-2 text-gray-500 hover:text-gray-700"
                          >
                            {expandedGroups.has(designName) ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Collapse
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Expand
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {expandedGroups.has(designName) && (
                          <div className="space-y-2">
                            {pdocsInGroup.map((variantPDOC, index) => {
                              const sizeColorInfo = extractSizeColor(variantPDOC.buyerProductDesignCode || '');
                              return (
                                <div key={`variant-${variantPDOC.id}-${index}`} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-200">
                                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                                    {/* Size & Color */}
                                    <div>
                                      <div className="font-medium text-gray-900">Size & Color</div>
                                      <div className="text-purple-600 font-medium">
                                        {sizeColorInfo.size && (
                                          <span className="bg-purple-100 px-2 py-1 rounded text-xs mr-1">
                                            {sizeColorInfo.size}
                                          </span>
                                        )}
                                        {sizeColorInfo.color && (
                                          <span className="bg-green-100 px-2 py-1 rounded text-xs">
                                            {sizeColorInfo.color}
                                          </span>
                                        )}
                                        {!sizeColorInfo.size && !sizeColorInfo.color && (
                                          <span className="text-gray-400">N/A</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Product Code */}
                                    <div>
                                      <div className="font-medium text-gray-900">Product Code</div>
                                      <div className="text-blue-600 font-medium text-xs">
                                        {variantPDOC.buyerProductDesignCode || 'N/A'}
                                      </div>
                                    </div>
                                    
                                    {/* Article Number */}
                                    <div>
                                      <div className="font-medium text-gray-900">Article</div>
                                      <div className="text-gray-600">
                                        {variantPDOC.articleNumber || 'N/A'}
                                      </div>
                                    </div>
                                    
                                    {/* SKU */}
                                    <div>
                                      <div className="font-medium text-gray-900">SKU</div>
                                      <div className="text-gray-600">
                                        {variantPDOC.skuNumber || 'N/A'}
                                      </div>
                                    </div>
                                    
                                    {/* Status */}
                                    <div>
                                      <div className="font-medium text-gray-900">Status</div>
                                      <Badge className={`${getStatusColor(variantPDOC.pdocStatus)} text-xs`}>
                                        {variantPDOC.pdocStatus || 'draft'}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  {/* Additional variant details if available */}
                                  {(variantPDOC.buyerArticleName || variantPDOC.sizeTolerance || variantPDOC.weightTolerance) && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                        {variantPDOC.buyerArticleName && (
                                          <div>
                                            <span className="font-medium text-gray-800">Article Name: </span>
                                            <span className="text-gray-600">{variantPDOC.buyerArticleName}</span>
                                          </div>
                                        )}
                                        {variantPDOC.sizeTolerance && (
                                          <div>
                                            <span className="font-medium text-gray-800">Size Tolerance: </span>
                                            <span className="text-gray-600">{variantPDOC.sizeTolerance}</span>
                                          </div>
                                        )}
                                        {variantPDOC.weightTolerance && (
                                          <div>
                                            <span className="font-medium text-gray-800">Weight Tolerance: </span>
                                            <span className="text-gray-600">{variantPDOC.weightTolerance}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Preview of variants when collapsed */}
                        {!expandedGroups.has(designName) && (
                          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            Preview: {pdocsInGroup.slice(0, 3).map((variant, idx) => {
                              const sizeColorInfo = extractSizeColor(variant.buyerProductDesignCode || '');
                              return (
                                <span key={idx} className="mr-3">
                                  {sizeColorInfo.size && (
                                    <span className="bg-purple-100 px-1 py-0.5 rounded mr-1">
                                      {sizeColorInfo.size}
                                    </span>
                                  )}
                                  {sizeColorInfo.color && (
                                    <span className="bg-green-100 px-1 py-0.5 rounded">
                                      {sizeColorInfo.color}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                            {pdocsInGroup.length > 3 && <span>... +{pdocsInGroup.length - 3} more</span>}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Additional Info Row for single variant */}
                    {pdocsInGroup.length === 1 && (mainPDOC.buyerArticleName || mainPDOC.skuNumber) && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {mainPDOC.buyerArticleName && (
                            <div>
                              <span className="font-medium text-gray-900">Article Name: </span>
                              <span className="text-blue-600">{mainPDOC.buyerArticleName}</span>
                            </div>
                          )}
                          {mainPDOC.skuNumber && (
                            <div>
                              <span className="font-medium text-gray-900">SKU: </span>
                              <span className="text-gray-500">{mainPDOC.skuNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>PDOC Details - {designName}</DialogTitle>
                          <DialogDescription>
                            Complete details for {buyerInfo.name} ({buyerInfo.code}) - {pdocsInGroup.length} variant{pdocsInGroup.length > 1 ? 's' : ''}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Basic Information</h4>
                              <div className="space-y-2 text-sm">
                                <div><strong>Design Name:</strong> {designName}</div>
                                <div><strong>Buyer:</strong> {buyerInfo.name} ({buyerInfo.code})</div>
                                <div><strong>Construction:</strong> {construction}</div>
                                <div><strong>Variants:</strong> {pdocsInGroup.length}</div>
                                <div><strong>Status:</strong> 
                                  <Badge className={`ml-2 ${getStatusColor(mainPDOC.pdocStatus)}`}>
                                    {mainPDOC.pdocStatus || 'draft'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Primary Specifications</h4>
                              <div className="space-y-2 text-sm">
                                <div><strong>Buyer Article Number:</strong> {mainPDOC.buyerArticleNumber || mainPDOC.articleNumber || 'N/A'}</div>
                                <div><strong>SKU:</strong> {mainPDOC.skuNumber || 'N/A'}</div>
                                <div><strong>Size Tolerance:</strong> {mainPDOC.sizeTolerance || 'N/A'}</div>
                                <div><strong>Weight Tolerance:</strong> {mainPDOC.weightTolerance || 'N/A'}</div>
                                <div><strong>Article Status:</strong> {mainPDOC.articleStatus || mainPDOC.pdocStatus || 'Running'}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* All Variants Table */}
                          {pdocsInGroup.length > 1 && (
                            <div>
                              <h4 className="font-medium mb-2">All Variants</h4>
                              <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                                <div className="grid grid-cols-1 gap-2">
                                  {pdocsInGroup.map((variant, index) => (
                                    <div key={variant.id} className="bg-white p-2 rounded border text-sm">
                                      <div className="font-medium">{variant.buyerProductDesignCode || 'N/A'}</div>
                                      <div className="text-gray-600">
                                        {variant.articleNumber && `Article: ${variant.articleNumber}`}
                                        {variant.skuNumber && ` | SKU: ${variant.skuNumber}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {mainPDOC.ted && (
                            <div>
                              <h4 className="font-medium mb-2">Technical Description (TED)</h4>
                              <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap">{mainPDOC.ted}</pre>
                              </div>
                            </div>
                          )}

                          {mainPDOC.ctq && (
                            <div>
                              <h4 className="font-medium mb-2">Critical to Quality (CTQ)</h4>
                              <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap">{mainPDOC.ctq}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPDOC(mainPDOC)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit PDOC - {mainPDOC.buyerProductDesignCode || 'Untitled Design'}</DialogTitle>
                          <DialogDescription>
                            Edit details for {buyerInfo.name} ({buyerInfo.code})
                          </DialogDescription>
                        </DialogHeader>
                        <PDOCDetailsForm pdoc={mainPDOC} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPDOCs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No PDOCs found matching your search.' : 
             currentUser.role === "merchant" ? 
             'No PDOCs created yet for your assigned buyers.' : 
             'No PDOCs created yet.'}
          </p>
          {currentUser.role === "merchant" && (
            <p className="text-xs text-gray-400 mt-2">
              You can only see PDOCs for buyers: {currentUser.assignedBuyers.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PDOCPriceTab;