import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, FileText, AlertCircle, Package, Truck, Shield, Plus, Trash2, Upload } from "lucide-react";
import { useBuyers } from "@/hooks/useBuyers";
import { useToast } from "@/hooks/use-toast";
const PDOCDetailsForm = ({ pdoc }) => {
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
    const [selectedBuyer, setSelectedBuyer] = useState(null);
    const { buyers, isLoading: buyersLoading } = useBuyers();
    const { toast } = useToast();
    // Handle buyer selection
    const handleBuyerSelect = (buyerId) => {
        const buyer = buyers.find((b) => b.id.toString() === buyerId);
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
    const handleInputChange = (field, value) => {
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
    const removeProductVariant = (id) => {
        if (productVariants.length > 1) {
            setProductVariants(prev => prev.filter(v => v.id !== id));
        }
    };
    const updateProductVariant = (id, field, value) => {
        setProductVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
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
    const removeTestRequirement = (id) => {
        if (testRequirements.length > 1) {
            setTestRequirements(prev => prev.filter(t => t.id !== id));
        }
    };
    const updateTestRequirement = (id, field, value) => {
        setTestRequirements(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };
    const handleSubmit = async (e) => {
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
        }
        catch (error) {
            toast({
                title: "Error",
                description: `Failed to ${pdoc ? 'update' : 'create'} PDOC. Please try again.`,
                variant: "destructive",
            });
        }
    };
    // File upload handlers
    const handleFileUpload = (field, file) => {
        setFormData(prev => ({ ...prev, [field]: file }));
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: pdoc ? 'Edit PDOC Details' : 'Create New PDOC' }), _jsx("p", { className: "text-sm text-gray-600", children: "Complete product documentation and specifications" })] }), _jsx(Badge, { variant: formData.articleStatus === 'Running' ? 'default' : 'secondary', children: formData.articleStatus })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), "Basic Information"] }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerId", children: "Buyer *" }), _jsxs(Select, { value: formData.buyerId, onValueChange: handleBuyerSelect, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select buyer..." }) }), _jsx(SelectContent, { children: buyers.map((buyer) => (_jsxs(SelectItem, { value: buyer.id.toString(), children: [buyer.name, " - ", buyer.code] }, buyer.id))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerCode", children: "Buyer Code" }), _jsx(Input, { id: "buyerCode", value: formData.buyerCode, readOnly: true, placeholder: "Auto-populated when buyer is selected", className: "bg-gray-50" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerProductDesignCode", children: "Buyer Product Design Code *" }), _jsx(Input, { id: "buyerProductDesignCode", value: formData.buyerProductDesignCode, onChange: (e) => handleInputChange('buyerProductDesignCode', e.target.value), placeholder: "e.g., A02/EM-25-MA-2502", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "articleStatus", children: "Article Status" }), _jsxs(Select, { value: formData.articleStatus, onValueChange: (value) => handleInputChange('articleStatus', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select status..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Running", children: "Running" }), _jsx(SelectItem, { value: "Discontinued", children: "Discontinued" })] })] })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx(Label, { htmlFor: "ted", children: "TED (Technical Specification Document)" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { id: "ted", value: formData.ted, onChange: (e) => handleInputChange('ted', e.target.value), placeholder: "Auto-populated when design is selected", readOnly: true, className: "bg-gray-50" }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", className: "flex items-center gap-2", disabled: !formData.ted, children: [_jsx(Upload, { className: "h-3 w-3" }), "View TED"] })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "TED file is automatically attached when a design is selected for PDOC creation" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4" }), "Product Variants"] }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addProductVariant, className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-3 w-3" }), "Add Variant"] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerArticleNumber", children: "Buyer Article Number" }), _jsx(Input, { id: "buyerArticleNumber", value: formData.buyerArticleNumber, onChange: (e) => handleInputChange('buyerArticleNumber', e.target.value), placeholder: "e.g., ART-2025-001" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerArticleName", children: "Buyer Article Name" }), _jsx(Input, { id: "buyerArticleName", value: formData.buyerArticleName, onChange: (e) => handleInputChange('buyerArticleName', e.target.value), placeholder: "e.g., Persian Garden Paradise" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-sm font-medium", children: "Variants" }), productVariants.map((variant, index) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 p-3 border rounded-lg", children: [_jsxs("div", { className: "col-span-2", children: [_jsx(Label, { className: "text-xs", children: "Buyer SKU" }), _jsx(Input, { value: variant.buyerSku, onChange: (e) => updateProductVariant(variant.id, 'buyerSku', e.target.value), placeholder: "SKU", className: "h-8" })] }), _jsxs("div", { className: "col-span-2", children: [_jsx(Label, { className: "text-xs", children: "Size" }), _jsx(Input, { value: variant.size, onChange: (e) => updateProductVariant(variant.id, 'size', e.target.value), placeholder: "e.g., 8x10", className: "h-8" })] }), _jsxs("div", { className: "col-span-2", children: [_jsx(Label, { className: "text-xs", children: "Color" }), _jsx(Input, { value: variant.color, onChange: (e) => updateProductVariant(variant.id, 'color', e.target.value), placeholder: "e.g., Blue", className: "h-8" })] }), _jsxs("div", { className: "col-span-2", children: [_jsx(Label, { className: "text-xs", children: "Remarks" }), _jsx(Input, { value: variant.remarks, onChange: (e) => updateProductVariant(variant.id, 'remarks', e.target.value), placeholder: "Notes", className: "h-8" })] }), _jsxs("div", { className: "col-span-1", children: [_jsx(Label, { className: "text-xs", children: "Size Tol." }), _jsx(Input, { value: variant.sizeTolerance, onChange: (e) => updateProductVariant(variant.id, 'sizeTolerance', e.target.value), placeholder: "\u00B13%", className: "h-8" })] }), _jsxs("div", { className: "col-span-1", children: [_jsx(Label, { className: "text-xs", children: "Weight Tol." }), _jsx(Input, { value: variant.weightTolerance, onChange: (e) => updateProductVariant(variant.id, 'weightTolerance', e.target.value), placeholder: "\u00B15%", className: "h-8" })] }), _jsx("div", { className: "col-span-1 flex items-end", children: _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removeProductVariant(variant.id), disabled: productVariants.length === 1, className: "h-8 w-8 p-0 text-red-500 hover:text-red-700", children: _jsx(Trash2, { className: "h-3 w-3" }) }) })] }, variant.id)))] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-4 w-4" }), "CTQ (Critical to Quality)"] }) }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { children: [_jsx(Label, { htmlFor: "ctq", children: "Critical Quality Parameters" }), _jsx(Textarea, { id: "ctq", value: formData.ctq, onChange: (e) => handleInputChange('ctq', e.target.value), placeholder: "List critical quality parameters and specifications...", rows: 4 })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), "Product Test Requirements"] }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addTestRequirement, className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-3 w-3" }), "Add Test"] })] }) }), _jsx(CardContent, { className: "space-y-3", children: testRequirements.map((test, index) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 p-3 border rounded-lg", children: [_jsxs("div", { className: "col-span-3", children: [_jsx(Label, { className: "text-xs", children: "Test Type" }), _jsxs(Select, { value: test.testType, onValueChange: (value) => updateTestRequirement(test.id, 'testType', value), children: [_jsx(SelectTrigger, { className: "h-8", children: _jsx(SelectValue, { placeholder: "Select test type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "colorfastness", children: "Color Fastness" }), _jsx(SelectItem, { value: "durability", children: "Durability" }), _jsx(SelectItem, { value: "flammability", children: "Flammability" }), _jsx(SelectItem, { value: "chemical", children: "Chemical Testing" }), _jsx(SelectItem, { value: "physical", children: "Physical Properties" }), _jsx(SelectItem, { value: "safety", children: "Safety Standards" }), _jsx(SelectItem, { value: "environmental", children: "Environmental" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] })] }), _jsxs("div", { className: "col-span-2", children: [_jsx(Label, { className: "text-xs", children: "Test Date" }), _jsx(Input, { type: "date", value: test.testDate, onChange: (e) => updateTestRequirement(test.id, 'testDate', e.target.value), className: "h-8" })] }), _jsxs("div", { className: "col-span-2", children: [_jsx(Label, { className: "text-xs", children: "Test Expiry" }), _jsx(Input, { type: "date", value: test.testExpiry, onChange: (e) => updateTestRequirement(test.id, 'testExpiry', e.target.value), className: "h-8" })] }), _jsxs("div", { className: "col-span-4", children: [_jsx(Label, { className: "text-xs", children: "Test Report" }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Input, { type: "file", accept: ".pdf,.doc,.docx", onChange: (e) => updateTestRequirement(test.id, 'testReportFile', e.target.files?.[0] || null), className: "h-8 text-xs" }), test.testReportFile && (_jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "h-8 px-2", title: "Download report", children: _jsx(Upload, { className: "h-3 w-3" }) }))] })] }), _jsx("div", { className: "col-span-1 flex items-end", children: _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removeTestRequirement(test.id), disabled: testRequirements.length === 1, className: "h-8 w-8 p-0 text-red-500 hover:text-red-700", children: _jsx(Trash2, { className: "h-3 w-3" }) }) })] }, test.id))) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), "Callouts (FMEA)"] }) }), _jsx(CardContent, { children: _jsxs("div", { children: [_jsx(Label, { htmlFor: "callouts", children: "Failure Mode and Effects Analysis" }), _jsx(Textarea, { id: "callouts", value: formData.callouts, onChange: (e) => handleInputChange('callouts', e.target.value), placeholder: "Document potential failure modes, effects, and preventive actions...", rows: 4 })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Truck, { className: "h-4 w-4" }), "Nominated Suppliers"] }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "nominatedLabelSupplierName", children: "Label Supplier Name" }), _jsx(Input, { id: "nominatedLabelSupplierName", value: formData.nominatedLabelSupplierName, onChange: (e) => handleInputChange('nominatedLabelSupplierName', e.target.value), placeholder: "Label supplier name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "nominatedLabelSupplierType", children: "Label Supplier Type" }), _jsx(Input, { id: "nominatedLabelSupplierType", value: formData.nominatedLabelSupplierType, onChange: (e) => handleInputChange('nominatedLabelSupplierType', e.target.value), placeholder: "e.g., Woven, Printed" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "nominatedPackagingSupplierName", children: "Packaging Supplier Name" }), _jsx(Input, { id: "nominatedPackagingSupplierName", value: formData.nominatedPackagingSupplierName, onChange: (e) => handleInputChange('nominatedPackagingSupplierName', e.target.value), placeholder: "Packaging supplier name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "nominatedTrimsSupplierName", children: "Trims Supplier Name" }), _jsx(Input, { id: "nominatedTrimsSupplierName", value: formData.nominatedTrimsSupplierName, onChange: (e) => handleInputChange('nominatedTrimsSupplierName', e.target.value), placeholder: "Trims supplier name" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Communication & Notes" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerEmailFile", children: "Buyer Email (File Upload)" }), _jsx(Input, { id: "buyerEmailFile", type: "file", accept: ".pdf,.doc,.docx,.eml,.msg", onChange: (e) => handleFileUpload('buyerEmailFile', e.target.files?.[0] || null), className: "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Upload buyer email files (PDF, DOC, EML, MSG)" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "ppmNotes", children: "PPM Notes" }), _jsx(Textarea, { id: "ppmNotes", value: formData.ppmNotes, onChange: (e) => handleInputChange('ppmNotes', e.target.value), placeholder: "Production Planning Meeting notes...", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "easternDesignBmpFile", children: "Eastern Design BMP File" }), _jsx(Input, { id: "easternDesignBmpFile", type: "file", accept: ".bmp,.png,.jpg,.jpeg", onChange: (e) => handleFileUpload('easternDesignBmpFile', e.target.files?.[0] || null), className: "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Upload Eastern design BMP files" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "sizeWiseApprovedCads", children: "Size wise Approved CADs" }), _jsx(Textarea, { id: "sizeWiseApprovedCads", value: formData.sizeWiseApprovedCads, onChange: (e) => handleInputChange('sizeWiseApprovedCads', e.target.value), placeholder: "List of size-wise approved CAD files...", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "ppmParticipants", children: "PPM Participants" }), _jsx(Input, { id: "ppmParticipants", value: formData.ppmParticipants, onChange: (e) => handleInputChange('ppmParticipants', e.target.value), placeholder: "List of meeting participants" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), "TED (Technical Description)"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "tedOption", children: "TED Source" }), _jsxs(Select, { value: formData.tedOption || 'manual', onValueChange: (value) => handleInputChange('tedOption', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select TED source..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "manual", children: "Manual Entry" }), _jsx(SelectItem, { value: "products", children: "Select from Products Table" }), _jsx(SelectItem, { value: "upload", children: "PDF Upload" })] })] })] }), formData.tedOption === 'products' && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "productSearch", children: "Search Products" }), _jsx(Input, { id: "productSearch", placeholder: "Search design names...", className: "mb-2" }), _jsxs(Select, { onValueChange: (value) => handleInputChange('ted', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select design..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Design 1 - Complete TED", children: "Design 1 - Complete TED" }), _jsx(SelectItem, { value: "Design 2 - Complete TED", children: "Design 2 - Complete TED" })] })] })] })), formData.tedOption === 'upload' && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "tedPdfFile", children: "TED PDF Upload" }), _jsx(Input, { id: "tedPdfFile", type: "file", accept: ".pdf", onChange: (e) => handleFileUpload('tedPdfFile', e.target.files?.[0] || null), className: "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Upload TED as PDF file" })] })), _jsxs("div", { children: [_jsx(Label, { htmlFor: "ted", children: "Technical Description" }), _jsx(Textarea, { id: "ted", value: formData.ted, onChange: (e) => handleInputChange('ted', e.target.value), placeholder: "Comprehensive technical description including construction, materials, processes...", rows: 8 })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Images & Samples" }), _jsx("p", { className: "text-sm text-gray-600", children: "Upload photos clicked by phone or camera" })] }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "redSealSampleFront", children: "Red Seal Sample (Front)" }), _jsx(Input, { id: "redSealSampleFront", type: "file", accept: "image/*", capture: "environment", onChange: (e) => handleFileUpload('redSealSampleFront', e.target.files?.[0] || null), className: "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "redSealSampleBack", children: "Red Seal Sample (Back)" }), _jsx(Input, { id: "redSealSampleBack", type: "file", accept: "image/*", capture: "environment", onChange: (e) => handleFileUpload('redSealSampleBack', e.target.files?.[0] || null), className: "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Take photo or upload image" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "shadeCardPhoto", children: "Shade Card Photo" }), _jsx(Input, { id: "shadeCardPhoto", type: "file", accept: "image/*", capture: "environment", onChange: (e) => handleFileUpload('shadeCardPhoto', e.target.files?.[0] || null), className: "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Take photo or upload image" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "masterHankPhoto", children: "Master Hank Photo" }), _jsx(Input, { id: "masterHankPhoto", type: "file", accept: "image/*", capture: "environment", onChange: (e) => handleFileUpload('masterHankPhoto', e.target.files?.[0] || null), className: "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Take photo or upload image" })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { type: "submit", size: "lg", className: "min-w-32", children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), pdoc ? 'Update PDOC' : 'Create PDOC'] }) })] }));
};
export default PDOCDetailsForm;
