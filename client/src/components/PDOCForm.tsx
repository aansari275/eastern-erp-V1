import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Save, FileText, AlertCircle } from "lucide-react";
import { useBuyers } from "../hooks/useBuyers";
import { useToast } from "../hooks/use-toast";

const PDOCForm: React.FC = () => {
  const [formData, setFormData] = useState({
    // Basic Information
    pdocNumber: "",
    buyerId: "",
    buyerProductDesignCode: "",
    ted: "",
    productType: "",
    
    // Product Specifications
    articleNumber: "",
    sku: "",
    productName: "",
    productDescription: "",
    
    // Size & Weight
    sizeLength: "",
    sizeWidth: "",
    sizeHeight: "",
    weightTolerance: "",
    sizeTolerance: "",
    
    // Quality Control
    ctq: "",
    qualityStandard: "",
    testingRequired: "",
    inspectionLevel: "",
    
    // Production Details
    productionLocation: "",
    leadTime: "",
    minimumOrderQuantity: "",
    maximumOrderQuantity: "",
    
    // Packaging
    packagingType: "",
    packagingRequirements: "",
    labelingRequirements: "",
    
    // Shipping
    shippingMethod: "",
    shippingRequirements: "",
    deliveryTerms: "",
    
    // Compliance
    certificationRequired: "",
    complianceStandards: "",
    materialSafety: "",
    
    // Additional Details
    specialInstructions: "",
    remarks: "",
    attachments: "",
    
    // Status
    pdocStatus: "draft",
    priority: "medium",
    
    // Dates
    createdDate: new Date().toISOString().split('T')[0],
    requiredDate: "",
    approvedDate: "",
    
    // Merchant Information
    merchantName: "",
    merchantEmail: "",
    merchantPhone: "",
    
    // Original Product Details
    originalProductTimestamp: "",
    originalProductReference: ""
  });

  const { buyers, isLoading: buyersLoading } = useBuyers();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/pdocs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save PDOC');
      }

      const pdoc = await response.json();
      
      toast({
        title: "PDOC Saved Successfully",
        description: `PDOC ${pdoc.pdocNumber} has been saved.`,
      });

      // Reset form
      setFormData({
        ...formData,
        pdocNumber: "",
        buyerId: "",
        buyerProductDesignCode: "",
        ted: "",
        productType: "",
        articleNumber: "",
        sku: "",
        productName: "",
        productDescription: "",
        // Keep other fields as default
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save PDOC. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedBuyer = buyers.find(b => b.id.toString() === formData.buyerId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">PDOC Details Form</h3>
          <p className="text-sm text-gray-600">Complete product documentation and specifications</p>
        </div>
        <Badge variant={formData.pdocStatus === 'draft' ? 'secondary' : 'default'}>
          {formData.pdocStatus.charAt(0).toUpperCase() + formData.pdocStatus.slice(1)}
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
            <Label htmlFor="pdocNumber">PDOC Number *</Label>
            <Input
              id="pdocNumber"
              value={formData.pdocNumber}
              onChange={(e) => handleInputChange('pdocNumber', e.target.value)}
              placeholder="e.g., PDOC-2025-001"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="buyerId">Buyer *</Label>
            <Select value={formData.buyerId} onValueChange={(value) => handleInputChange('buyerId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select buyer..." />
              </SelectTrigger>
              <SelectContent>
                {buyers.map((buyer) => (
                  <SelectItem key={buyer.id} value={buyer.id.toString()}>
                    {buyer.buyerName} - {buyer.buyerCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="productType">Product Type *</Label>
            <Select value={formData.productType} onValueChange={(value) => handleInputChange('productType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select product type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="domestic">Domestic</SelectItem>
                <SelectItem value="sample">Sample</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Product Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="articleNumber">Article Number</Label>
            <Input
              id="articleNumber"
              value={formData.articleNumber}
              onChange={(e) => handleInputChange('articleNumber', e.target.value)}
              placeholder="e.g., ART-2025-001"
            />
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              placeholder="e.g., RUG-PER-001"
            />
          </div>

          <div>
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              placeholder="e.g., Persian Garden Paradise"
            />
          </div>

          <div>
            <Label htmlFor="qualityStandard">Quality Standard</Label>
            <Select value={formData.qualityStandard} onValueChange={(value) => handleInputChange('qualityStandard', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select quality standard..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="productDescription">Product Description</Label>
            <Textarea
              id="productDescription"
              value={formData.productDescription}
              onChange={(e) => handleInputChange('productDescription', e.target.value)}
              placeholder="Detailed product description..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Size & Weight Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Size & Weight Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sizeLength">Length (ft)</Label>
            <Input
              id="sizeLength"
              value={formData.sizeLength}
              onChange={(e) => handleInputChange('sizeLength', e.target.value)}
              placeholder="e.g., 10"
              type="number"
            />
          </div>

          <div>
            <Label htmlFor="sizeWidth">Width (ft)</Label>
            <Input
              id="sizeWidth"
              value={formData.sizeWidth}
              onChange={(e) => handleInputChange('sizeWidth', e.target.value)}
              placeholder="e.g., 14"
              type="number"
            />
          </div>

          <div>
            <Label htmlFor="sizeHeight">Height/Thickness (mm)</Label>
            <Input
              id="sizeHeight"
              value={formData.sizeHeight}
              onChange={(e) => handleInputChange('sizeHeight', e.target.value)}
              placeholder="e.g., 12"
              type="number"
            />
          </div>

          <div>
            <Label htmlFor="weightTolerance">Weight Tolerance (%)</Label>
            <Input
              id="weightTolerance"
              value={formData.weightTolerance}
              onChange={(e) => handleInputChange('weightTolerance', e.target.value)}
              placeholder="e.g., ±5"
            />
          </div>

          <div>
            <Label htmlFor="sizeTolerance">Size Tolerance (%)</Label>
            <Input
              id="sizeTolerance"
              value={formData.sizeTolerance}
              onChange={(e) => handleInputChange('sizeTolerance', e.target.value)}
              placeholder="e.g., ±3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quality Control */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Control & Testing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ctq">CTQ (Critical to Quality)</Label>
            <Textarea
              id="ctq"
              value={formData.ctq}
              onChange={(e) => handleInputChange('ctq', e.target.value)}
              placeholder="List critical quality parameters..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="testingRequired">Testing Required</Label>
            <Textarea
              id="testingRequired"
              value={formData.testingRequired}
              onChange={(e) => handleInputChange('testingRequired', e.target.value)}
              placeholder="Specify required tests..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="inspectionLevel">Inspection Level</Label>
            <Select value={formData.inspectionLevel} onValueChange={(value) => handleInputChange('inspectionLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select inspection level..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="enhanced">Enhanced</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Production Details */}
      <Card>
        <CardHeader>
          <CardTitle>Production Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="productionLocation">Production Location</Label>
            <Input
              id="productionLocation"
              value={formData.productionLocation}
              onChange={(e) => handleInputChange('productionLocation', e.target.value)}
              placeholder="e.g., Bhadohi, India"
            />
          </div>

          <div>
            <Label htmlFor="leadTime">Lead Time (days)</Label>
            <Input
              id="leadTime"
              value={formData.leadTime}
              onChange={(e) => handleInputChange('leadTime', e.target.value)}
              placeholder="e.g., 45"
              type="number"
            />
          </div>

          <div>
            <Label htmlFor="minimumOrderQuantity">Minimum Order Quantity</Label>
            <Input
              id="minimumOrderQuantity"
              value={formData.minimumOrderQuantity}
              onChange={(e) => handleInputChange('minimumOrderQuantity', e.target.value)}
              placeholder="e.g., 100"
              type="number"
            />
          </div>

          <div>
            <Label htmlFor="maximumOrderQuantity">Maximum Order Quantity</Label>
            <Input
              id="maximumOrderQuantity"
              value={formData.maximumOrderQuantity}
              onChange={(e) => handleInputChange('maximumOrderQuantity', e.target.value)}
              placeholder="e.g., 1000"
              type="number"
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
        <CardContent>
          <div>
            <Label htmlFor="ted">Technical Description *</Label>
            <Textarea
              id="ted"
              value={formData.ted}
              onChange={(e) => handleInputChange('ted', e.target.value)}
              placeholder="Comprehensive technical description including construction, materials, processes..."
              rows={8}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Any special handling or production instructions..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Additional remarks or notes..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Merchant Information */}
      {selectedBuyer && (
        <Card>
          <CardHeader>
            <CardTitle>Merchant Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Merchant Name</Label>
              <Input value={selectedBuyer.merchantName} disabled />
            </div>
            <div>
              <Label>Merchant Email</Label>
              <Input value={selectedBuyer.merchantEmail} disabled />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="min-w-32">
          <Save className="h-4 w-4 mr-2" />
          Save PDOC
        </Button>
      </div>
    </form>
  );
};

export default PDOCForm;