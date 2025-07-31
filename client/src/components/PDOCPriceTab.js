import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Edit, FileText, Calendar, User, Plus, Package, Factory, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import PDOCDetailsForm from "./PDOCDetailsForm";
const PDOCPriceTab = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPDOC, setSelectedPDOC] = useState(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedRug, setSelectedRug] = useState("");
    const [selectedBuyer, setSelectedBuyer] = useState("");
    const [createdPDOC, setCreatedPDOC] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState(new Set());
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
        if (!pdocs || pdocs.length === 0)
            return [];
        if (currentUser.role === "merchant_manager") {
            // Merchant manager can see all PDOCs
            return pdocs;
        }
        else if (currentUser.role === "merchant") {
            // Regular merchant only sees PDOCs for their assigned buyers
            return pdocs.filter((pdoc) => {
                const buyer = buyers.find((b) => b.id === pdoc.buyerId);
                return buyer && currentUser.assignedBuyers.includes(buyer.code);
            });
        }
        return pdocs;
    }, [pdocs, buyers, currentUser]);
    // Group PDOCs by buyer product design code as main header
    const groupPDOCsByDesign = (pdocs) => {
        const groups = {};
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
    const filteredPDOCs = accessiblePDOCs.filter((pdoc) => pdoc.buyerProductDesignCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdoc.productType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdoc.buyerArticleName?.toLowerCase().includes(searchTerm.toLowerCase()));
    // Group filtered PDOCs
    const groupedPDOCs = groupPDOCsByDesign(filteredPDOCs);
    // Helper function to get buyer info
    const getBuyerInfo = (buyerId) => {
        const buyer = buyers.find((b) => b.id === buyerId);
        return buyer ? { name: buyer.buyerName || buyer.name, code: buyer.buyerCode || buyer.code } : { name: "Unknown", code: "N/A" };
    };
    // Helper function to extract size and color from design code
    const extractSizeColor = (designCode) => {
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
    const toggleGroup = (designName) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(designName)) {
                newSet.delete(designName);
            }
            else {
                newSet.add(designName);
            }
            return newSet;
        });
    };
    // Helper function to get construction info from related rug
    const getConstructionInfo = (pdoc) => {
        // Try to extract construction from buyerProductDesignCode or other fields
        const designCode = pdoc.buyerProductDesignCode || "";
        // Look for construction patterns in the design code
        if (designCode.includes("HAND KNOTTED") || designCode.includes("HK"))
            return "Hand Knotted";
        if (designCode.includes("HAND WOVEN") || designCode.includes("HW"))
            return "Hand Woven";
        if (designCode.includes("HAND TUFTED") || designCode.includes("HT"))
            return "Hand Tufted";
        if (designCode.includes("HANDLOOM"))
            return "Handloom";
        if (designCode.includes("PITLOOM"))
            return "Pitloom";
        if (designCode.includes("NEPALI"))
            return "Nepali";
        if (designCode.includes("VDW"))
            return "VDW";
        return pdoc.productType || "N/A";
    };
    const getStatusColor = (status) => {
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
    const formatDate = (dateString) => {
        if (!dateString)
            return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    const createPDOCMutation = useMutation({
        mutationFn: async (data) => {
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
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create PDOC",
                variant: "destructive",
            });
        },
    });
    const handleCreatePDOC = () => {
        if (!selectedRug || !selectedBuyer)
            return;
        createPDOCMutation.mutate({
            rugId: parseInt(selectedRug),
            buyerId: parseInt(selectedBuyer),
        });
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-red-600 mb-4", children: "Error loading PDOCs" }), _jsx(Button, { onClick: () => window.location.reload(), children: "Try Again" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "PDOC Management" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Manage Product Data and Order Confirmations" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Role:" }), _jsxs(Select, { value: currentUser.role, onValueChange: (role) => setCurrentUser({ ...currentUser, role: role }), children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "merchant_manager", children: "Merchant Manager" }), _jsx(SelectItem, { value: "merchant", children: "Merchant" })] })] })] }), _jsxs(Dialog, { open: showCreateDialog, onOpenChange: setShowCreateDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-blue-600 hover:bg-blue-700 text-white", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create PDOC"] }) }), _jsxs(DialogContent, { className: "max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create New PDOC" }), _jsx(DialogDescription, { children: "Select a design and buyer to create a new Product Data and Order Confirmation document." })] }), _jsxs("div", { className: "space-y-4 pt-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mb-2 block", children: "Select Design" }), _jsxs(Select, { value: selectedRug, onValueChange: setSelectedRug, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose a design..." }) }), _jsx(SelectContent, { children: rugs.map((rug) => (_jsxs(SelectItem, { value: rug.id.toString(), children: [rug.designName, " (", rug.carpetNo, ")"] }, rug.id))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mb-2 block", children: "Select Buyer" }), _jsxs(Select, { value: selectedBuyer, onValueChange: setSelectedBuyer, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose a buyer..." }) }), _jsx(SelectContent, { children: buyers.map((buyer) => (_jsxs(SelectItem, { value: buyer.id.toString(), children: [buyer.buyerName, " (", buyer.buyerCode, ")"] }, buyer.id))) })] })] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setShowCreateDialog(false), className: "flex-1", children: "Cancel" }), _jsx(Button, { onClick: handleCreatePDOC, disabled: !selectedRug || !selectedBuyer || createPDOCMutation.isPending, className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white", children: createPDOCMutation.isPending ? "Creating..." : "Create PDOC" })] })] })] })] })] })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search PDOCs by product code, article name, or type...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Showing ", Object.keys(groupedPDOCs).length, " design groups (", filteredPDOCs.length, " total PDOCs)"] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Role: ", currentUser.role === "merchant_manager" ? "Manager" : "Merchant"] }), currentUser.role === "merchant" && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Assigned: ", currentUser.assignedBuyers.join(", ")] }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Badge, { variant: "outline", children: ["Draft: ", accessiblePDOCs.filter((p) => p.pdocStatus === 'draft').length] }), _jsxs(Badge, { variant: "outline", children: ["Pending: ", accessiblePDOCs.filter((p) => p.pdocStatus === 'pending').length] }), _jsxs(Badge, { variant: "outline", children: ["Approved: ", accessiblePDOCs.filter((p) => p.pdocStatus === 'approved').length] })] })] }), _jsx("div", { className: "space-y-3", children: Object.entries(groupedPDOCs).map(([designName, pdocsInGroup]) => {
                    // Use the first PDOC for main info
                    const mainPDOC = pdocsInGroup[0];
                    const buyerInfo = getBuyerInfo(mainPDOC.buyerId);
                    const construction = getConstructionInfo(mainPDOC);
                    return (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-lg font-semibold text-blue-600", children: mainPDOC.buyerProductDesignCode || designName }), pdocsInGroup.length > 1 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [pdocsInGroup.length, " variants"] })), _jsx(Badge, { className: getStatusColor(mainPDOC.pdocStatus), children: mainPDOC.pdocStatus || 'draft' })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4 text-gray-400" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: buyerInfo.name }), _jsx("div", { className: "text-gray-500", children: buyerInfo.code })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Factory, { className: "h-4 w-4 text-gray-400" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Construction" }), _jsx("div", { className: "text-gray-500", children: construction })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4 text-gray-400" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Article" }), _jsx("div", { className: "text-gray-500", children: mainPDOC.articleNumber || 'N/A' })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Created" }), _jsx("div", { className: "text-gray-500", children: formatDate(mainPDOC.createdAt) })] })] })] }), pdocsInGroup.length > 1 && (_jsxs("div", { className: "mt-3 pt-3 border-t border-gray-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "text-sm font-medium text-gray-900", children: ["Variants (", pdocsInGroup.length, "):"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleGroup(designName), className: "h-8 px-2 text-gray-500 hover:text-gray-700", children: expandedGroups.has(designName) ? (_jsxs(_Fragment, { children: [_jsx(ChevronUp, { className: "h-4 w-4 mr-1" }), "Collapse"] })) : (_jsxs(_Fragment, { children: [_jsx(ChevronDown, { className: "h-4 w-4 mr-1" }), "Expand"] })) })] }), expandedGroups.has(designName) && (_jsx("div", { className: "space-y-2", children: pdocsInGroup.map((variantPDOC, index) => {
                                                            const sizeColorInfo = extractSizeColor(variantPDOC.buyerProductDesignCode || '');
                                                            return (_jsxs("div", { className: "bg-gray-50 p-3 rounded-lg border-l-4 border-blue-200", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Size & Color" }), _jsxs("div", { className: "text-purple-600 font-medium", children: [sizeColorInfo.size && (_jsx("span", { className: "bg-purple-100 px-2 py-1 rounded text-xs mr-1", children: sizeColorInfo.size })), sizeColorInfo.color && (_jsx("span", { className: "bg-green-100 px-2 py-1 rounded text-xs", children: sizeColorInfo.color })), !sizeColorInfo.size && !sizeColorInfo.color && (_jsx("span", { className: "text-gray-400", children: "N/A" }))] })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Product Code" }), _jsx("div", { className: "text-blue-600 font-medium text-xs", children: variantPDOC.buyerProductDesignCode || 'N/A' })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Article" }), _jsx("div", { className: "text-gray-600", children: variantPDOC.articleNumber || 'N/A' })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "SKU" }), _jsx("div", { className: "text-gray-600", children: variantPDOC.skuNumber || 'N/A' })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Status" }), _jsx(Badge, { className: `${getStatusColor(variantPDOC.pdocStatus)} text-xs`, children: variantPDOC.pdocStatus || 'draft' })] })] }), (variantPDOC.buyerArticleName || variantPDOC.sizeTolerance || variantPDOC.weightTolerance) && (_jsx("div", { className: "mt-2 pt-2 border-t border-gray-200", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2 text-xs", children: [variantPDOC.buyerArticleName && (_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-800", children: "Article Name: " }), _jsx("span", { className: "text-gray-600", children: variantPDOC.buyerArticleName })] })), variantPDOC.sizeTolerance && (_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-800", children: "Size Tolerance: " }), _jsx("span", { className: "text-gray-600", children: variantPDOC.sizeTolerance })] })), variantPDOC.weightTolerance && (_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-800", children: "Weight Tolerance: " }), _jsx("span", { className: "text-gray-600", children: variantPDOC.weightTolerance })] }))] }) }))] }, `variant-${variantPDOC.id}-${index}`));
                                                        }) })), !expandedGroups.has(designName) && (_jsxs("div", { className: "text-xs text-gray-500 bg-gray-50 p-2 rounded", children: ["Preview: ", pdocsInGroup.slice(0, 3).map((variant, idx) => {
                                                                const sizeColorInfo = extractSizeColor(variant.buyerProductDesignCode || '');
                                                                return (_jsxs("span", { className: "mr-3", children: [sizeColorInfo.size && (_jsx("span", { className: "bg-purple-100 px-1 py-0.5 rounded mr-1", children: sizeColorInfo.size })), sizeColorInfo.color && (_jsx("span", { className: "bg-green-100 px-1 py-0.5 rounded", children: sizeColorInfo.color }))] }, idx));
                                                            }), pdocsInGroup.length > 3 && _jsxs("span", { children: ["... +", pdocsInGroup.length - 3, " more"] })] }))] })), pdocsInGroup.length === 1 && (mainPDOC.buyerArticleName || mainPDOC.skuNumber) && (_jsx("div", { className: "mt-3 pt-3 border-t border-gray-100", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [mainPDOC.buyerArticleName && (_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-900", children: "Article Name: " }), _jsx("span", { className: "text-blue-600", children: mainPDOC.buyerArticleName })] })), mainPDOC.skuNumber && (_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-900", children: "SKU: " }), _jsx("span", { className: "text-gray-500", children: mainPDOC.skuNumber })] }))] }) }))] }), _jsxs("div", { className: "flex gap-2 ml-4", children: [_jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "View"] }) }), _jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["PDOC Details - ", designName] }), _jsxs(DialogDescription, { children: ["Complete details for ", buyerInfo.name, " (", buyerInfo.code, ") - ", pdocsInGroup.length, " variant", pdocsInGroup.length > 1 ? 's' : ''] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Basic Information" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { children: [_jsx("strong", { children: "Design Name:" }), " ", designName] }), _jsxs("div", { children: [_jsx("strong", { children: "Buyer:" }), " ", buyerInfo.name, " (", buyerInfo.code, ")"] }), _jsxs("div", { children: [_jsx("strong", { children: "Construction:" }), " ", construction] }), _jsxs("div", { children: [_jsx("strong", { children: "Variants:" }), " ", pdocsInGroup.length] }), _jsxs("div", { children: [_jsx("strong", { children: "Status:" }), _jsx(Badge, { className: `ml-2 ${getStatusColor(mainPDOC.pdocStatus)}`, children: mainPDOC.pdocStatus || 'draft' })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Primary Specifications" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { children: [_jsx("strong", { children: "Buyer Article Number:" }), " ", mainPDOC.buyerArticleNumber || mainPDOC.articleNumber || 'N/A'] }), _jsxs("div", { children: [_jsx("strong", { children: "SKU:" }), " ", mainPDOC.skuNumber || 'N/A'] }), _jsxs("div", { children: [_jsx("strong", { children: "Size Tolerance:" }), " ", mainPDOC.sizeTolerance || 'N/A'] }), _jsxs("div", { children: [_jsx("strong", { children: "Weight Tolerance:" }), " ", mainPDOC.weightTolerance || 'N/A'] }), _jsxs("div", { children: [_jsx("strong", { children: "Article Status:" }), " ", mainPDOC.articleStatus || mainPDOC.pdocStatus || 'Running'] })] })] })] }), pdocsInGroup.length > 1 && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "All Variants" }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto", children: _jsx("div", { className: "grid grid-cols-1 gap-2", children: pdocsInGroup.map((variant, index) => (_jsxs("div", { className: "bg-white p-2 rounded border text-sm", children: [_jsx("div", { className: "font-medium", children: variant.buyerProductDesignCode || 'N/A' }), _jsxs("div", { className: "text-gray-600", children: [variant.articleNumber && `Article: ${variant.articleNumber}`, variant.skuNumber && ` | SKU: ${variant.skuNumber}`] })] }, variant.id))) }) })] })), mainPDOC.ted && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Technical Description (TED)" }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto", children: _jsx("pre", { className: "text-sm whitespace-pre-wrap", children: mainPDOC.ted }) })] })), mainPDOC.ctq && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Critical to Quality (CTQ)" }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto", children: _jsx("pre", { className: "text-sm whitespace-pre-wrap", children: mainPDOC.ctq }) })] }))] })] })] }), _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setSelectedPDOC(mainPDOC), children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit"] }) }), _jsxs(DialogContent, { className: "max-w-6xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Edit PDOC - ", mainPDOC.buyerProductDesignCode || 'Untitled Design'] }), _jsxs(DialogDescription, { children: ["Edit details for ", buyerInfo.name, " (", buyerInfo.code, ")"] })] }), _jsx(PDOCDetailsForm, { pdoc: mainPDOC })] })] })] })] }) }) }, `design-group-${designName}`));
                }) }), filteredPDOCs.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: searchTerm ? 'No PDOCs found matching your search.' :
                            currentUser.role === "merchant" ?
                                'No PDOCs created yet for your assigned buyers.' :
                                'No PDOCs created yet.' }), currentUser.role === "merchant" && (_jsxs("p", { className: "text-xs text-gray-400 mt-2", children: ["You can only see PDOCs for buyers: ", currentUser.assignedBuyers.join(", ")] }))] }))] }));
};
export default PDOCPriceTab;
