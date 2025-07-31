import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, FileText, Calendar, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EnhancedPDOCForm from "./EnhancedPDOCForm";
const PDOCList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPDOC, setSelectedPDOC] = useState(null);
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
    const filteredPDOCs = pdocs.filter((pdoc) => pdoc.pdocNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdoc.buyerProductDesignCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdoc.productType.toLowerCase().includes(searchTerm.toLowerCase()));
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-red-600 mb-4", children: "Error loading PDOCs" }), _jsx(Button, { onClick: () => window.location.reload(), children: "Try Again" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search PDOCs by number, product code, or type...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Showing ", filteredPDOCs.length, " of ", pdocs.length, " PDOCs"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Badge, { variant: "outline", children: ["Draft: ", pdocs.filter((p) => p.pdocStatus === 'draft').length] }), _jsxs(Badge, { variant: "outline", children: ["Pending: ", pdocs.filter((p) => p.pdocStatus === 'pending').length] }), _jsxs(Badge, { variant: "outline", children: ["Approved: ", pdocs.filter((p) => p.pdocStatus === 'approved').length] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredPDOCs.map((pdoc) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx(CardTitle, { className: "text-lg font-medium line-clamp-1", children: pdoc.pdocNumber }), _jsx(Badge, { className: getStatusColor(pdoc.pdocStatus), children: pdoc.pdocStatus })] }), _jsx("div", { className: "text-sm text-gray-600", children: pdoc.buyerProductDesignCode })] }), _jsxs(CardContent, { className: "pt-0", children: [_jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "font-medium", children: "Type:" }), _jsx("span", { className: "capitalize", children: pdoc.productType })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "font-medium", children: "Created:" }), _jsx("span", { children: formatDate(pdoc.createdAt) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "font-medium", children: "Buyer ID:" }), _jsx("span", { children: pdoc.buyerId })] })] }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "View"] }) }), _jsxs(DialogContent, { className: "max-w-7xl max-h-[95vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { children: ["PDOC: ", pdoc.pdocNumber] }) }), _jsx(EnhancedPDOCForm, { pdoc: pdoc })] })] }), _jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit"] })] })] })] }, pdoc.id))) }), filteredPDOCs.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: searchTerm ? 'No PDOCs found matching your search.' : 'No PDOCs created yet.' })] }))] }));
};
export default PDOCList;
