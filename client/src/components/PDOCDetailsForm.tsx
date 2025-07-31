import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Save, FileText, AlertCircle, Package, Truck, Shield, Plus, Trash2, Upload } from "lucide-react";
import { useBuyers } from "../hooks/useBuyers";
import { useToast } from "../hooks/use-toast";

interface PDOCDetailsFormProps {
  pdoc?: any;
}

const PDOCDetailsForm: React.FC<PDOCDetailsFormProps> = ({ pdoc }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    buyerId: "",
    buyerCode: "",
    buyerProductDesignCode: "",
    ted: "",
    articleStatus: "Running",
    tedOption: "manual",
    
    // Product Variants
    buyerArticleNumber: "",
    buyerArticleName: "",
    skuNumber: "",
    sizeTolerance: "",
    weightTolerance: "",
    
    // Quality Control (CTQ)
    ctq: "",
    callouts: "",
    productTestRequirements: "",
    
    // Supplier Information
    nominatedLabelSupplierName: "",
    nominatedLabelSupplierType: "",
    nominatedPackagingSupplierName: "",
    nominatedTrimsSupplierName: "",
    
    // Communication and Notes
    buyerEmailFile: null,
    ppmNotes: "",
    easternDesignBmpFile: null,
    sizeWiseApprovedCads: "",
    ppmParticipants: "",
    
    // Images/Samples
    redSealSampleFront: "",
    redSealSampleBack: "",
    shadeCardPhoto: "",
    masterHankPhoto: "",
  });

  // Product Variants state
  const [productVariants, setProductVariants] = useState([
    {
      id: 1,
      buyerSku: "",
      size: "",
      color: "",
      remarks: "",
      sizeTolerance: "",
      weightTolerance: ""
    }
  ]);

  // Product Test Requirements state
  const [testRequirements, setTestRequirements] = useState([
    {
      id: 1,
      testType: "",
      testDate: "",
      testExpiry: "",
      testReportFile: null
    }
  ]);

  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);

  const { buyers, isLoading: buyersLoading } = useBuyers();
  const { toast } = useToast();

  // Handle buyer selection
  const handleBuyerSelect = (buyerId: string) => {
    const buyer = buyers.find((b: any) => b.id.toString() === buyerId);
    if (buyer) {
      setSelectedBuyer(buyer);
      setFormData(prev => ({
        ...prev,
        buyerId,
        buyerCode: buyer.code || ""
      }));
    }
  };

  // Initialize form with PDOC data if editing
  useEffect(() => {
    if (pdoc) {
      setFormData({
        buyerId: pdoc.buyerId?.toString() || "",
        buyerCode: pdoc.buyerCode || "",
        buyerProductDesignCode: pdoc.buyerProductDesignCode || "",
        ted: pdoc.ted || "",
        articleStatus: pdoc.articleStatus || pdoc.pdocStatus || "Running",
        tedOption: pdoc.tedOption || "manual",
        buyerArticleNumber: pdoc.buyerArticleNumber || pdoc.articleNumber || "",
        buyerArticleName: pdoc.buyerArticleName || "",
        skuNumber: pdoc.skuNumber || "",
        sizeTolerance: pdoc.sizeTolerance || "",
        weightTolerance: pdoc.weightTolerance || "",
        ctq: pdoc.ctq || "",
        productTestRequirements: pdoc.productTestRequirements || "",
        callouts: pdoc.callouts || "",
        nominatedLabelSupplierName: pdoc.nominatedLabelSupplierName || "",
        nominatedLabelSupplierType: pdoc.nominatedLabelSupplierType || "",
        nominatedPackagingSupplierName: pdoc.nominatedPackagingSupplierName || "",
        nominatedTrimsSupplierName: pdoc.nominatedTrimsSupplierName || "",
        buyerEmailFile: null,
        ppmNotes: pdoc.ppmNotes || "",
        easternDesignBmpFile: null,
        sizeWiseApprovedCads: pdoc.sizeWiseApprovedCads || pdoc.approvedCads || "",
        ppmParticipants: pdoc.ppmParticipants || "",
        redSealSampleFront: pdoc.redSealSampleFront || "",
        redSealSampleBack: pdoc.redSealSampleBack || "",
        shadeCardPhoto: pdoc.shadeCardPhoto || "",
        masterHankPhoto: pdoc.masterHankPhoto || "",
      });
    }
  }, [pdoc]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Product Variants handlers
  const addProductVariant = () => {
    const newId = Math.max(...productVariants.map(v => v.id)) + 1;
    setProductVariants(prev => [...prev, {
      id: newId,
      buyerSku: "",
      size: "",
      color: "",
      remarks: "",
      sizeTolerance: "",
      weightTolerance: ""
    }]);
  };

  const removeProductVariant = (id: number) => {
    if (productVariants.length > 1) {
      setProductVariants(prev => prev.filter(v => v.id !== id));
    }
  };

  const updateProductVariant = (id: number, field: string, value: string) => {
    setProductVariants(prev =>
      prev.map(v => v.id === id ? { ...v, [field]: value } : v)
    );
  };

  // Test Requirements handlers
  const addTestRequirement = () => {
    const newId = Math.max(...testRequirements.map(t => t.id)) + 1;
    setTestRequirements(prev => [...prev, {
      id: newId,
      testType: "",
      testDate: "",
      testExpiry: "",
      testReportFile: null
    }]);
  };

  const removeTestRequirement = (id: number) => {
    if (testRequirements.length > 1) {
      setTestRequirements(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateTestRequirement = (id: number, field: string, value: string | File | null) => {
    setTestRequirements(prev =>
      prev.map(t => t.id === id ? { ...t, [field]: value } : t)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = pdoc ? `/api/pdocs/${pdoc.id}` : '/api/pdocs';
      const method = pdoc ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          productVariants,
          testRequirements
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${pdoc ? 'update' : 'create'} PDOC`);
      }

      const result = await response.json();
      
      toast({
        title: `PDOC ${pdoc ? 'Updated' : 'Created'} Successfully`,
        description: `PDOC ${result.pdocNumber} has been ${pdoc ? 'updated' : 'created'}.`,
      });

      // Reset form if creating new
      if (!pdoc) {
        setFormData({
          buyerId: "",
          buyerCode: "",
          buyerProductDesignCode: "",
          ted: "",
          articleStatus: "Running",
          tedOption: "manual",
          buyerArticleNumber: "",
          buyerArticleName: "",
          skuNumber: "",
          sizeTolerance: "",
          weightTolerance: "",
          ctq: "",
          callouts: "",
          productTestRequirements: "",
          nominatedLabelSupplierName: "",
          nominatedLabelSupplierType: "",
          nominatedPackagingSupplierName: "",
          nominatedTrimsSupplierName: "",
          buyerEmailFile: null,
          ppmNotes: "",
          easternDesignBmpFile: null,
          sizeWiseApprovedCads: "",
          ppmParticipants: "",
          redSealSampleFront: "",
          redSealSampleBack: "",
          shadeCardPhoto: "",
          masterHankPhoto: "",
        });
        setProductVariants([{
          id: 1,
          buyerSku: "",
          size: "",
          color: "",
          remarks: "",
          sizeTolerance: "",
          weightTolerance: ""
        }]);
        setTestRequirements([{
          id: 1,
          testType: "",
          testDate: "",
          testExpiry: "",
          testReportFile: null
        }]);
        setSelectedBuyer(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${pdoc ? 'update' : 'create'} PDOC. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // File upload handlers
  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {pdoc ? 'Edit PDOC Details' : 'Create New PDOC'}
          </h3>
          <p className="text-sm text-gray-600">Complete product documentation and specifications</p>
        </div>
        <Badge variant={formData.articleStatus === 'Running' ? 'default' : 'secondary'}>
          {formData.articleStatus}
        </Badge>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buyerId">Buyer *</Label>
            <Select value={formData.buyerId} onValueChange={handleBuyerSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select buyer..." />
              </SelectTrigger>
              <SelectContent>
                {buyers.map((buyer) => (
                  <SelectItem key={buyer.id} value={buyer.id.toString()}>
                    {buyer.name} - {buyer.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="buyerCode">Buyer Code</Label>
            <Input
              id="buyerCode"
              value={formData.buyerCode}
              readOnly
              placeholder="Auto-populated when buyer is selected"
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="buyerProductDesignCode">Buyer Product Design Code *</Label>
            <Input
              id="buyerProductDesignCode"
              value={formData.buyerProductDesignCode}
              onChange={(e) => handleInputChange('buyerProductDesignCode', e.target.value)}
              placeholder="e.g., A02/EM-25-MA-2502"
              required
            />
          </div>

          <div>
            <Label htmlFor="articleStatus">Article Status</Label>
            <Select value={formData.articleStatus} onValueChange={(value) => handleInputChange('articleStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Running">Running</SelectItem>
                <SelectItem value="Discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="ted">TED (Technical Specification Document)</Label>
            <div className="flex gap-2">
              <Input
                id="ted"
                value={formData.ted}
                onChange={(e) => handleInputChange('ted', e.target.value)}
                placeholder="Auto-populated when design is selected"
                readOnly
                className="bg-gray-50"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={!formData.ted}
              >
                <Upload className="h-3 w-3" />
                View TED
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              TED file is automatically attached when a design is selected for PDOC creation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Product Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product Variants
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addProductVariant}
              className="flex items-center gap-2"
            >
              <Plus className="h-3 w-3" />
              Add Variant
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic article information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <Label htmlFor="buyerArticleNumber">Buyer Article Number</Label>
              <Input
                id="buyerArticleNumber"
                value={formData.buyerArticleNumber}
                onChange={(e) => handleInputChange('buyerArticleNumber', e.target.value)}
                placeholder="e.g., ART-2025-001"
              />
            </div>

            <div>
              <Label htmlFor="buyerArticleName">Buyer Article Name</Label>
              <Input
                id="buyerArticleName"
                value={formData.buyerArticleName}
                onChange={(e) => handleInputChange('buyerArticleName', e.target.value)}
                placeholder="e.g., Persian Garden Paradise"
              />
            </div>
          </div>

          {/* Product Variants Table */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Variants</Label>
            {productVariants.map((variant, index) => (
              <div key={variant.id} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
                <div className="col-span-2">
                  <Label className="text-xs">Buyer SKU</Label>
                  <Input
                    value={variant.buyerSku}
                    onChange={(e) => updateProductVariant(variant.id, 'buyerSku', e.target.value)}
                    placeholder="SKU"
                    className="h-8"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Size</Label>
                  <Input
                    value={variant.size}
                    onChange={(e) => updateProductVariant(variant.id, 'size', e.target.value)}
                    placeholder="e.g., 8x10"
                    className="h-8"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Color</Label>
                  <Input
                    value={variant.color}
                    onChange={(e) => updateProductVariant(variant.id, 'color', e.target.value)}
                    placeholder="e.g., Blue"
                    className="h-8"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Remarks</Label>
                  <Input
                    value={variant.remarks}
                    onChange={(e) => updateProductVariant(variant.id, 'remarks', e.target.value)}
                    placeholder="Notes"
                    className="h-8"
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs">Size Tol.</Label>
                  <Input
                    value={variant.sizeTolerance}
                    onChange={(e) => updateProductVariant(variant.id, 'sizeTolerance', e.target.value)}
                    placeholder="±3%"
                    className="h-8"
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs">Weight Tol.</Label>
                  <Input
                    value={variant.weightTolerance}
                    onChange={(e) => updateProductVariant(variant.id, 'weightTolerance', e.target.value)}
                    placeholder="±5%"
                    className="h-8"
                  />
                </div>
                <div className="col-span-1 flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProductVariant(variant.id)}
                    disabled={productVariants.length === 1}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTQ (Critical to Quality) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            CTQ (Critical to Quality)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ctq">Critical Quality Parameters</Label>
            <Textarea
              id="ctq"
              value={formData.ctq}
              onChange={(e) => handleInputChange('ctq', e.target.value)}
              placeholder="List critical quality parameters and specifications..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Test Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Product Test Requirements
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTestRequirement}
              className="flex items-center gap-2"
            >
              <Plus className="h-3 w-3" />
              Add Test
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {testRequirements.map((test, index) => (
            <div key={test.id} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
              <div className="col-span-3">
                <Label className="text-xs">Test Type</Label>
                <Select
                  value={test.testType}
                  onValueChange={(value) => updateTestRequirement(test.id, 'testType', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colorfastness">Color Fastness</SelectItem>
                    <SelectItem value="durability">Durability</SelectItem>
                    <SelectItem value="flammability">Flammability</SelectItem>
                    <SelectItem value="chemical">Chemical Testing</SelectItem>
                    <SelectItem value="physical">Physical Properties</SelectItem>
                    <SelectItem value="safety">Safety Standards</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Test Date</Label>
                <Input
                  type="date"
                  value={test.testDate}
                  onChange={(e) => updateTestRequirement(test.id, 'testDate', e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Test Expiry</Label>
                <Input
                  type="date"
                  value={test.testExpiry}
                  onChange={(e) => updateTestRequirement(test.id, 'testExpiry', e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="col-span-4">
                <Label className="text-xs">Test Report</Label>
                <div className="flex gap-1">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => updateTestRequirement(test.id, 'testReportFile', e.target.files?.[0] || null)}
                    className="h-8 text-xs"
                  />
                  {test.testReportFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      title="Download report"
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="col-span-1 flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTestRequirement(test.id)}
                  disabled={testRequirements.length === 1}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Callouts (FMEA) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Callouts (FMEA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="callouts">Failure Mode and Effects Analysis</Label>
            <Textarea
              id="callouts"
              value={formData.callouts}
              onChange={(e) => handleInputChange('callouts', e.target.value)}
              placeholder="Document potential failure modes, effects, and preventive actions..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Supplier Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Nominated Suppliers
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nominatedLabelSupplierName">Label Supplier Name</Label>
            <Input
              id="nominatedLabelSupplierName"
              value={formData.nominatedLabelSupplierName}
              onChange={(e) => handleInputChange('nominatedLabelSupplierName', e.target.value)}
              placeholder="Label supplier name"
            />
          </div>

          <div>
            <Label htmlFor="nominatedLabelSupplierType">Label Supplier Type</Label>
            <Input
              id="nominatedLabelSupplierType"
              value={formData.nominatedLabelSupplierType}
              onChange={(e) => handleInputChange('nominatedLabelSupplierType', e.target.value)}
              placeholder="e.g., Woven, Printed"
            />
          </div>

          <div>
            <Label htmlFor="nominatedPackagingSupplierName">Packaging Supplier Name</Label>
            <Input
              id="nominatedPackagingSupplierName"
              value={formData.nominatedPackagingSupplierName}
              onChange={(e) => handleInputChange('nominatedPackagingSupplierName', e.target.value)}
              placeholder="Packaging supplier name"
            />
          </div>

          <div>
            <Label htmlFor="nominatedTrimsSupplierName">Trims Supplier Name</Label>
            <Input
              id="nominatedTrimsSupplierName"
              value={formData.nominatedTrimsSupplierName}
              onChange={(e) => handleInputChange('nominatedTrimsSupplierName', e.target.value)}
              placeholder="Trims supplier name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication & Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Communication & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="buyerEmailFile">Buyer Email (File Upload)</Label>
            <Input
              id="buyerEmailFile"
              type="file"
              accept=".pdf,.doc,.docx,.eml,.msg"
              onChange={(e) => handleFileUpload('buyerEmailFile', e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">Upload buyer email files (PDF, DOC, EML, MSG)</p>
          </div>

          <div>
            <Label htmlFor="ppmNotes">PPM Notes</Label>
            <Textarea
              id="ppmNotes"
              value={formData.ppmNotes}
              onChange={(e) => handleInputChange('ppmNotes', e.target.value)}
              placeholder="Production Planning Meeting notes..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="easternDesignBmpFile">Eastern Design BMP File</Label>
            <Input
              id="easternDesignBmpFile"
              type="file"
              accept=".bmp,.png,.jpg,.jpeg"
              onChange={(e) => handleFileUpload('easternDesignBmpFile', e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <p className="text-xs text-gray-500 mt-1">Upload Eastern design BMP files</p>
          </div>

          <div>
            <Label htmlFor="sizeWiseApprovedCads">Size wise Approved CADs</Label>
            <Textarea
              id="sizeWiseApprovedCads"
              value={formData.sizeWiseApprovedCads}
              onChange={(e) => handleInputChange('sizeWiseApprovedCads', e.target.value)}
              placeholder="List of size-wise approved CAD files..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="ppmParticipants">PPM Participants</Label>
            <Input
              id="ppmParticipants"
              value={formData.ppmParticipants}
              onChange={(e) => handleInputChange('ppmParticipants', e.target.value)}
              placeholder="List of meeting participants"
            />
          </div>
        </CardContent>
      </Card>

      {/* TED Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            TED (Technical Description)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tedOption">TED Source</Label>
            <Select value={formData.tedOption || 'manual'} onValueChange={(value) => handleInputChange('tedOption', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select TED source..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Entry</SelectItem>
                <SelectItem value="products">Select from Products Table</SelectItem>
                <SelectItem value="upload">PDF Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tedOption === 'products' && (
            <div>
              <Label htmlFor="productSearch">Search Products</Label>
              <Input
                id="productSearch"
                placeholder="Search design names..."
                className="mb-2"
              />
              <Select onValueChange={(value) => handleInputChange('ted', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select design..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Design 1 - Complete TED">Design 1 - Complete TED</SelectItem>
                  <SelectItem value="Design 2 - Complete TED">Design 2 - Complete TED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.tedOption === 'upload' && (
            <div>
              <Label htmlFor="tedPdfFile">TED PDF Upload</Label>
              <Input
                id="tedPdfFile"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload('tedPdfFile', e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              <p className="text-xs text-gray-500 mt-1">Upload TED as PDF file</p>
            </div>
          )}

          <div>
            <Label htmlFor="ted">Technical Description</Label>
            <Textarea
              id="ted"
              value={formData.ted}
              onChange={(e) => handleInputChange('ted', e.target.value)}
              placeholder="Comprehensive technical description including construction, materials, processes..."
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      {/* Images & Samples */}
      <Card>
        <CardHeader>
          <CardTitle>Images & Samples</CardTitle>
          <p className="text-sm text-gray-600">Upload photos clicked by phone or camera</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="redSealSampleFront">Red Seal Sample (Front)</Label>
            <Input
              id="redSealSampleFront"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileUpload('redSealSampleFront', e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>

          <div>
            <Label htmlFor="redSealSampleBack">Red Seal Sample (Back)</Label>
            <Input
              id="redSealSampleBack"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileUpload('redSealSampleBack', e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            <p className="text-xs text-gray-500 mt-1">Take photo or upload image</p>
          </div>

          <div>
            <Label htmlFor="shadeCardPhoto">Shade Card Photo</Label>
            <Input
              id="shadeCardPhoto"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileUpload('shadeCardPhoto', e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            <p className="text-xs text-gray-500 mt-1">Take photo or upload image</p>
          </div>

          <div>
            <Label htmlFor="masterHankPhoto">Master Hank Photo</Label>
            <Input
              id="masterHankPhoto"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileUpload('masterHankPhoto', e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            <p className="text-xs text-gray-500 mt-1">Take photo or upload image</p>
          </div>
        </CardContent>
      </Card>



      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="min-w-32">
          <Save className="h-4 w-4 mr-2" />
          {pdoc ? 'Update PDOC' : 'Create PDOC'}
        </Button>
      </div>
    </form>
  );
};

export default PDOCDetailsForm;