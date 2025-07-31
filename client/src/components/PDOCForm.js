import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, FileText, AlertCircle } from "lucide-react";
import { useBuyers } from "@/hooks/useBuyers";
import { useToast } from "@/hooks/use-toast";
const PDOCForm = () => {
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
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleSubmit = async (e) => {
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
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to save PDOC. Please try again.",
                variant: "destructive",
            });
        }
    };
    const selectedBuyer = buyers.find(b => b.id.toString() === formData.buyerId);
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "PDOC Details Form" }), _jsx("p", { className: "text-sm text-gray-600", children: "Complete product documentation and specifications" })] }), _jsx(Badge, { variant: formData.pdocStatus === 'draft' ? 'secondary' : 'default', children: formData.pdocStatus.charAt(0).toUpperCase() + formData.pdocStatus.slice(1) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), "Basic Information"] }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "pdocNumber", children: "PDOC Number *" }), _jsx(Input, { id: "pdocNumber", value: formData.pdocNumber, onChange: (e) => handleInputChange('pdocNumber', e.target.value), placeholder: "e.g., PDOC-2025-001", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerId", children: "Buyer *" }), _jsxs(Select, { value: formData.buyerId, onValueChange: (value) => handleInputChange('buyerId', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select buyer..." }) }), _jsx(SelectContent, { children: buyers.map((buyer) => (_jsxs(SelectItem, { value: buyer.id.toString(), children: [buyer.buyerName, " - ", buyer.buyerCode] }, buyer.id))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerProductDesignCode", children: "Buyer Product Design Code *" }), _jsx(Input, { id: "buyerProductDesignCode", value: formData.buyerProductDesignCode, onChange: (e) => handleInputChange('buyerProductDesignCode', e.target.value), placeholder: "e.g., A02/EM-25-MA-2502", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "productType", children: "Product Type *" }), _jsxs(Select, { value: formData.productType, onValueChange: (value) => handleInputChange('productType', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select product type..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "export", children: "Export" }), _jsx(SelectItem, { value: "domestic", children: "Domestic" }), _jsx(SelectItem, { value: "sample", children: "Sample" }), _jsx(SelectItem, { value: "custom", children: "Custom" })] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Product Specifications" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "articleNumber", children: "Article Number" }), _jsx(Input, { id: "articleNumber", value: formData.articleNumber, onChange: (e) => handleInputChange('articleNumber', e.target.value), placeholder: "e.g., ART-2025-001" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "sku", children: "SKU" }), _jsx(Input, { id: "sku", value: formData.sku, onChange: (e) => handleInputChange('sku', e.target.value), placeholder: "e.g., RUG-PER-001" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "productName", children: "Product Name" }), _jsx(Input, { id: "productName", value: formData.productName, onChange: (e) => handleInputChange('productName', e.target.value), placeholder: "e.g., Persian Garden Paradise" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "qualityStandard", children: "Quality Standard" }), _jsxs(Select, { value: formData.qualityStandard, onValueChange: (value) => handleInputChange('qualityStandard', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select quality standard..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "premium", children: "Premium" }), _jsx(SelectItem, { value: "standard", children: "Standard" }), _jsx(SelectItem, { value: "economy", children: "Economy" }), _jsx(SelectItem, { value: "luxury", children: "Luxury" })] })] })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx(Label, { htmlFor: "productDescription", children: "Product Description" }), _jsx(Textarea, { id: "productDescription", value: formData.productDescription, onChange: (e) => handleInputChange('productDescription', e.target.value), placeholder: "Detailed product description...", rows: 3 })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Size & Weight Specifications" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "sizeLength", children: "Length (ft)" }), _jsx(Input, { id: "sizeLength", value: formData.sizeLength, onChange: (e) => handleInputChange('sizeLength', e.target.value), placeholder: "e.g., 10", type: "number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "sizeWidth", children: "Width (ft)" }), _jsx(Input, { id: "sizeWidth", value: formData.sizeWidth, onChange: (e) => handleInputChange('sizeWidth', e.target.value), placeholder: "e.g., 14", type: "number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "sizeHeight", children: "Height/Thickness (mm)" }), _jsx(Input, { id: "sizeHeight", value: formData.sizeHeight, onChange: (e) => handleInputChange('sizeHeight', e.target.value), placeholder: "e.g., 12", type: "number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "weightTolerance", children: "Weight Tolerance (%)" }), _jsx(Input, { id: "weightTolerance", value: formData.weightTolerance, onChange: (e) => handleInputChange('weightTolerance', e.target.value), placeholder: "e.g., \u00B15" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "sizeTolerance", children: "Size Tolerance (%)" }), _jsx(Input, { id: "sizeTolerance", value: formData.sizeTolerance, onChange: (e) => handleInputChange('sizeTolerance', e.target.value), placeholder: "e.g., \u00B13" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quality Control & Testing" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "ctq", children: "CTQ (Critical to Quality)" }), _jsx(Textarea, { id: "ctq", value: formData.ctq, onChange: (e) => handleInputChange('ctq', e.target.value), placeholder: "List critical quality parameters...", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "testingRequired", children: "Testing Required" }), _jsx(Textarea, { id: "testingRequired", value: formData.testingRequired, onChange: (e) => handleInputChange('testingRequired', e.target.value), placeholder: "Specify required tests...", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "inspectionLevel", children: "Inspection Level" }), _jsxs(Select, { value: formData.inspectionLevel, onValueChange: (value) => handleInputChange('inspectionLevel', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select inspection level..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "basic", children: "Basic" }), _jsx(SelectItem, { value: "standard", children: "Standard" }), _jsx(SelectItem, { value: "enhanced", children: "Enhanced" }), _jsx(SelectItem, { value: "comprehensive", children: "Comprehensive" })] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Production Details" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "productionLocation", children: "Production Location" }), _jsx(Input, { id: "productionLocation", value: formData.productionLocation, onChange: (e) => handleInputChange('productionLocation', e.target.value), placeholder: "e.g., Bhadohi, India" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "leadTime", children: "Lead Time (days)" }), _jsx(Input, { id: "leadTime", value: formData.leadTime, onChange: (e) => handleInputChange('leadTime', e.target.value), placeholder: "e.g., 45", type: "number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "minimumOrderQuantity", children: "Minimum Order Quantity" }), _jsx(Input, { id: "minimumOrderQuantity", value: formData.minimumOrderQuantity, onChange: (e) => handleInputChange('minimumOrderQuantity', e.target.value), placeholder: "e.g., 100", type: "number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "maximumOrderQuantity", children: "Maximum Order Quantity" }), _jsx(Input, { id: "maximumOrderQuantity", value: formData.maximumOrderQuantity, onChange: (e) => handleInputChange('maximumOrderQuantity', e.target.value), placeholder: "e.g., 1000", type: "number" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), "TED (Technical Description)"] }) }), _jsx(CardContent, { children: _jsxs("div", { children: [_jsx(Label, { htmlFor: "ted", children: "Technical Description *" }), _jsx(Textarea, { id: "ted", value: formData.ted, onChange: (e) => handleInputChange('ted', e.target.value), placeholder: "Comprehensive technical description including construction, materials, processes...", rows: 8, required: true })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Additional Information" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "specialInstructions", children: "Special Instructions" }), _jsx(Textarea, { id: "specialInstructions", value: formData.specialInstructions, onChange: (e) => handleInputChange('specialInstructions', e.target.value), placeholder: "Any special handling or production instructions...", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "remarks", children: "Remarks" }), _jsx(Textarea, { id: "remarks", value: formData.remarks, onChange: (e) => handleInputChange('remarks', e.target.value), placeholder: "Additional remarks or notes...", rows: 2 })] })] })] }), selectedBuyer && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Merchant Information" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Merchant Name" }), _jsx(Input, { value: selectedBuyer.merchantName, disabled: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Merchant Email" }), _jsx(Input, { value: selectedBuyer.merchantEmail, disabled: true })] })] })] })), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { type: "submit", size: "lg", className: "min-w-32", children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save PDOC"] }) })] }));
};
export default PDOCForm;
