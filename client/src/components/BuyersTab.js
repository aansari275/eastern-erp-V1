import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Users, Mail, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
const BuyersTab = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingBuyer, setEditingBuyer] = useState(null);
    const [formData, setFormData] = useState({
        buyerName: "",
        buyerCode: "",
        merchantName: "",
        merchantEmail: "",
        contractFiles: "",
        isActive: true
    });
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: buyers = [], isLoading, error } = useQuery({
        queryKey: ['/api/buyers'],
        queryFn: async () => {
            const response = await fetch('/api/buyers');
            if (!response.ok) {
                throw new Error('Failed to fetch buyers');
            }
            return response.json();
        },
    });
    const createBuyerMutation = useMutation({
        mutationFn: async (buyerData) => {
            const response = await fetch('/api/buyers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buyerData),
            });
            if (!response.ok) {
                throw new Error('Failed to create buyer');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/buyers'] });
            toast({
                title: "Buyer Created",
                description: "New buyer has been created successfully.",
            });
            resetForm();
            setIsCreateModalOpen(false);
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to create buyer. Please try again.",
                variant: "destructive",
            });
        },
    });
    const updateBuyerMutation = useMutation({
        mutationFn: async ({ id, buyerData }) => {
            const response = await fetch(`/api/buyers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buyerData),
            });
            if (!response.ok) {
                throw new Error('Failed to update buyer');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/buyers'] });
            toast({
                title: "Buyer Updated",
                description: "Buyer information has been updated successfully.",
            });
            resetForm();
            setEditingBuyer(null);
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update buyer. Please try again.",
                variant: "destructive",
            });
        },
    });
    const deleteBuyerMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`/api/buyers/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete buyer');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/buyers'] });
            toast({
                title: "Buyer Deleted",
                description: "Buyer has been deleted successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete buyer. Please try again.",
                variant: "destructive",
            });
        },
    });
    const filteredBuyers = buyers.filter((buyer) => buyer.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.buyerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.merchantEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    const resetForm = () => {
        setFormData({
            buyerName: "",
            buyerCode: "",
            merchantName: "",
            merchantEmail: "",
            contractFiles: "",
            isActive: true
        });
    };
    const handleEdit = (buyer) => {
        setEditingBuyer(buyer);
        setFormData({
            buyerName: buyer.buyerName,
            buyerCode: buyer.buyerCode,
            merchantName: buyer.merchantName,
            merchantEmail: buyer.merchantEmail,
            contractFiles: buyer.contractFiles || "",
            isActive: buyer.isActive
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBuyer) {
            updateBuyerMutation.mutate({ id: editingBuyer.id, buyerData: formData });
        }
        else {
            createBuyerMutation.mutate(formData);
        }
    };
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this buyer?')) {
            deleteBuyerMutation.mutate(id);
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
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-red-600 mb-4", children: "Error loading buyers" }), _jsx(Button, { onClick: () => window.location.reload(), children: "Try Again" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-between", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search buyers by name, code, merchant...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }), _jsxs(Dialog, { open: isCreateModalOpen, onOpenChange: setIsCreateModalOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { onClick: () => {
                                        resetForm();
                                        setEditingBuyer(null);
                                    }, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add New Buyer"] }) }), _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create New Buyer" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerName", children: "Buyer Name *" }), _jsx(Input, { id: "buyerName", value: formData.buyerName, onChange: (e) => setFormData(prev => ({ ...prev, buyerName: e.target.value })), placeholder: "e.g., European Luxury Imports", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerCode", children: "Buyer Code *" }), _jsx(Input, { id: "buyerCode", value: formData.buyerCode, onChange: (e) => setFormData(prev => ({ ...prev, buyerCode: e.target.value })), placeholder: "e.g., ELI-001", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "merchantName", children: "Merchant Name *" }), _jsx(Input, { id: "merchantName", value: formData.merchantName, onChange: (e) => setFormData(prev => ({ ...prev, merchantName: e.target.value })), placeholder: "e.g., Sarah Johnson", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "merchantEmail", children: "Merchant Email *" }), _jsx(Input, { id: "merchantEmail", type: "email", value: formData.merchantEmail, onChange: (e) => setFormData(prev => ({ ...prev, merchantEmail: e.target.value })), placeholder: "e.g., sarah.johnson@company.com", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "contractFiles", children: "Buyer Contracts/Agreements" }), _jsx(Input, { id: "contractFiles", type: "file", accept: ".pdf,.doc,.docx,.txt", onChange: (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setFormData(prev => ({ ...prev, contractFiles: file.name }));
                                                            }
                                                        }, className: "file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" }), formData.contractFiles && (_jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Selected: ", formData.contractFiles] }))] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsCreateModalOpen(false), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: createBuyerMutation.isPending, children: createBuyerMutation.isPending ? 'Creating...' : 'Create Buyer' })] })] })] })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Showing ", filteredBuyers.length, " of ", buyers.length, " buyers"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Badge, { variant: "outline", children: ["Active: ", buyers.filter((b) => b.isActive).length] }), _jsxs(Badge, { variant: "outline", children: ["Inactive: ", buyers.filter((b) => !b.isActive).length] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredBuyers.map((buyer) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx(CardTitle, { className: "text-lg font-medium line-clamp-1", children: buyer.buyerName }), _jsx(Badge, { variant: buyer.isActive ? "default" : "secondary", children: buyer.isActive ? "Active" : "Inactive" })] }), _jsx("div", { className: "text-sm font-mono text-blue-600", children: buyer.buyerCode })] }), _jsxs(CardContent, { className: "pt-0", children: [_jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Building, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "font-medium", children: "Merchant:" }), _jsx("span", { children: buyer.merchantName })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "font-medium", children: "Email:" }), _jsx("span", { className: "truncate", children: buyer.merchantEmail })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "font-medium", children: "Created:" }), _jsx("span", { children: formatDate(buyer.createdAt) })] })] }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => handleEdit(buyer), children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit"] }) }), _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { children: ["Edit Buyer - ", buyer.buyerName] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "editBuyerName", children: "Buyer Name *" }), _jsx(Input, { id: "editBuyerName", value: formData.buyerName, onChange: (e) => setFormData(prev => ({ ...prev, buyerName: e.target.value })), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "editBuyerCode", children: "Buyer Code *" }), _jsx(Input, { id: "editBuyerCode", value: formData.buyerCode, onChange: (e) => setFormData(prev => ({ ...prev, buyerCode: e.target.value })), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "editMerchantName", children: "Merchant Name *" }), _jsx(Input, { id: "editMerchantName", value: formData.merchantName, onChange: (e) => setFormData(prev => ({ ...prev, merchantName: e.target.value })), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "editMerchantEmail", children: "Merchant Email *" }), _jsx(Input, { id: "editMerchantEmail", type: "email", value: formData.merchantEmail, onChange: (e) => setFormData(prev => ({ ...prev, merchantEmail: e.target.value })), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "editContractFiles", children: "Buyer Contracts/Agreements" }), _jsx(Input, { id: "editContractFiles", type: "file", accept: ".pdf,.doc,.docx,.txt", onChange: (e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    setFormData(prev => ({ ...prev, contractFiles: file.name }));
                                                                                }
                                                                            }, className: "file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" }), formData.contractFiles && (_jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Current: ", formData.contractFiles] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "editIsActive", checked: formData.isActive, onChange: (e) => setFormData(prev => ({ ...prev, isActive: e.target.checked })) }), _jsx(Label, { htmlFor: "editIsActive", children: "Active" })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setEditingBuyer(null), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: updateBuyerMutation.isPending, children: updateBuyerMutation.isPending ? 'Updating...' : 'Update Buyer' })] })] })] })] }), _jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => handleDelete(buyer.id), disabled: deleteBuyerMutation.isPending, children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), "Delete"] })] })] })] }, buyer.id))) }), filteredBuyers.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(Users, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: searchTerm ? 'No buyers found matching your search.' : 'No buyers created yet.' })] }))] }));
};
export default BuyersTab;
