import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Building2, Database } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
{
    articleNumbers.map((article, index) => (_jsxs("div", { className: "grid grid-cols-4 gap-2 text-xs bg-gray-50 p-2 rounded", children: [_jsxs("div", { className: "truncate", children: [_jsx("span", { className: "font-medium text-gray-600", children: "Design:" }), _jsx("div", { className: "text-gray-800", children: article.designName || 'N/A' })] }), _jsxs("div", { className: "truncate", children: [_jsx("span", { className: "font-medium text-gray-600", children: "Size:" }), _jsx("div", { className: "text-gray-800", children: article.size || 'N/A' })] }), _jsxs("div", { className: "truncate", children: [_jsx("span", { className: "font-medium text-gray-600", children: "Color:" }), _jsx("div", { className: "text-gray-800", children: article.color || 'N/A' })] }), _jsxs("div", { className: "truncate", children: [_jsx("span", { className: "font-medium text-gray-600", children: "Article #:" }), _jsx("input", { type: "text", placeholder: "Enter code", className: "w-full text-xs border rounded px-1 py-0.5 bg-white", defaultValue: article.buyerArticleNumber || '' })] })] }, index)));
}
{
    articleNumbers.length >= 5 && (_jsx("div", { className: "text-xs text-gray-500 text-center py-1", children: "Showing first 5 entries. Click \"Articles\" button to view all." }));
}
div >
;
div >
;
;
;
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
const BuyerManagement = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // Mock current user - in real app this would come from auth context
    const [currentUser, setCurrentUser] = useState({
        email: 'manager@easternmills.com', // Change this to test different user types
        role: 'merchandising_manager' // or 'merchant'
    });
    // Fetch buyer article counts for each buyer
    const { data: articleCounts = {} } = useQuery({
        queryKey: ['/api/buyer-articles/counts'],
        queryFn: async () => {
            const response = await fetch('/api/buyer-articles');
            if (!response.ok)
                throw new Error('Failed to fetch buyer articles');
            const allItems = await response.json();
            // Count items per buyer
            const counts = {};
            allItems.forEach(item => {
                const buyerCode = item.buyerDesignCode;
                counts[buyerCode] = (counts[buyerCode] || 0) + 1;
            });
            return counts;
        },
    });
    // Fetch buyers from database
    const { data: buyers = [], isLoading, error } = useQuery({
        queryKey: ['/api/buyers'],
        queryFn: async () => {
            const response = await fetch('/api/buyers');
            if (!response.ok) {
                throw new Error('Failed to fetch buyers');
            }
            return response.json();
        }
    });
    // Available merchants
    const merchants = [
        'israr@easternmills.com',
        'anas.mahboob@easternmills.com',
        'ashfer@easternmills.com',
        'zahid@easternmills.com'
    ];
    // Create buyer mutation
    const createBuyerMutation = useMutation({
        mutationFn: async (buyerData) => {
            const response = await fetch('/api/buyers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buyerData)
            });
            if (!response.ok)
                throw new Error('Failed to create buyer');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/buyers'] });
            toast({ title: "Success", description: "Buyer created successfully" });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create buyer", variant: "destructive" });
        }
    });
    // Update buyer mutation
    const updateBuyerMutation = useMutation({
        mutationFn: async ({ id, ...buyerData }) => {
            const response = await fetch(`/api/buyers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buyerData)
            });
            if (!response.ok)
                throw new Error('Failed to update buyer');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/buyers'] });
            toast({ title: "Success", description: "Buyer updated successfully" });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update buyer", variant: "destructive" });
        }
    });
    // Delete buyer mutation
    const deleteBuyerMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`/api/buyers/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok)
                throw new Error('Failed to delete buyer');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/buyers'] });
            toast({ title: "Success", description: "Buyer deleted successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete buyer", variant: "destructive" });
        }
    });
    // Filter buyers based on user role
    const getVisibleBuyers = () => {
        if (!buyers || !Array.isArray(buyers))
            return [];
        if (currentUser.role === 'merchandising_manager') {
            return buyers; // Managers see all buyers
        }
        else {
            return buyers.filter(buyer => buyer.merchantId === currentUser.email);
        }
    };
    const visibleBuyers = getVisibleBuyers();
    const [editingBuyer, setEditingBuyer] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        merchantId: '',
        reference: '',
        currency: 'USD',
        paymentTerms: '',
        deliveryAddress: '',
        invoiceAddress: '',
        shipmentMethod: '',
        articleNumbers: [],
        notes: '',
        isActive: true
    });
    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            merchantId: currentUser.role === 'merchant' ? currentUser.email : '',
            reference: '',
            currency: 'USD',
            paymentTerms: '',
            deliveryAddress: '',
            invoiceAddress: '',
            shipmentMethod: '',
            articleNumbers: [],
            notes: '',
            isActive: true
        });
        setEditingBuyer(null);
    };
    const handleEdit = (buyer) => {
        setEditingBuyer(buyer);
        setFormData(buyer);
        setIsDialogOpen(true);
    };
    const handleCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };
    const handleSave = () => {
        if (!formData.name || !formData.code || !formData.merchantId) {
            toast({
                title: "Missing required fields",
                description: "Please fill in Buyer Name, Code, and assign a Merchant.",
                variant: "destructive",
            });
            return;
        }
        if (editingBuyer) {
            // Update existing buyer
            updateBuyerMutation.mutate({ id: editingBuyer.id, ...formData });
        }
        else {
            // Create new buyer
            createBuyerMutation.mutate(formData);
        }
    };
    const handleDelete = (buyerId) => {
        if (window.confirm('Are you sure you want to delete this buyer?')) {
            deleteBuyerMutation.mutate(buyerId);
        }
    };
    const handleImportArticles = async () => {
        setIsImporting(true);
        try {
            const response = await fetch('/api/article-numbers/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (response.ok) {
                toast({
                    title: "Import Successful",
                    description: `${result.imported} article numbers imported successfully`,
                });
                queryClient.invalidateQueries({ queryKey: ['/api/buyers'] });
            }
            else {
                throw new Error(result.error || 'Import failed');
            }
        }
        catch (error) {
            toast({
                title: "Import Failed",
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: "destructive",
            });
        }
        finally {
            setIsImporting(false);
        }
    };
    const addArticleNumber = () => {
        const articleNumbers = formData.articleNumbers || [];
        setFormData({
            ...formData,
            articleNumbers: [...articleNumbers, '']
        });
    };
    const updateArticleNumber = (index, value) => {
        const articleNumbers = [...(formData.articleNumbers || [])];
        articleNumbers[index] = value;
        setFormData({
            ...formData,
            articleNumbers
        });
    };
    const removeArticleNumber = (index) => {
        const articleNumbers = formData.articleNumbers?.filter((_, i) => i !== index) || [];
        setFormData({
            ...formData,
            articleNumbers
        });
    };
    // Show loading state
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsx("h2", { className: "text-2xl font-bold", children: "Buyer Management" }) }), _jsx("div", { className: "text-center py-8", children: _jsx("p", { children: "Loading buyers..." }) })] }));
    }
    // Show error state
    if (error) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsx("h2", { className: "text-2xl font-bold", children: "Buyer Management" }) }), _jsx("div", { className: "text-center py-8 text-red-600", children: _jsxs("p", { children: ["Error loading buyers: ", error.message] }) })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Buyer Management" }), _jsxs("p", { className: "text-gray-600", children: ["Manage buyer profiles and their standard order details (", buyers?.length || 0, " buyers)"] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Label, { className: "text-sm", children: "Demo User:" }), _jsxs("select", { value: currentUser.email, onChange: (e) => {
                                            const email = e.target.value;
                                            setCurrentUser({
                                                email,
                                                role: email === 'manager@easternmills.com' ? 'merchandising_manager' : 'merchant'
                                            });
                                        }, className: "text-sm border rounded px-2 py-1", children: [_jsx("option", { value: "manager@easternmills.com", children: "Manager (sees all)" }), _jsx("option", { value: "israr@easternmills.com", children: "Israr (merchant)" }), _jsx("option", { value: "zahid@easternmills.com", children: "Zahid (merchant)" }), _jsx("option", { value: "ashfer@easternmills.com", children: "Ashfer (merchant)" }), _jsx("option", { value: "anas.mahboob@easternmills.com", children: "Anas (merchant)" })] })] }), currentUser.role === 'merchandising_manager' && (_jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { onClick: handleImportArticles, disabled: isImporting, variant: "outline", children: [_jsx(Database, { className: "h-4 w-4 mr-2" }), isImporting ? 'Importing...' : 'Import from ERP'] }), _jsxs(Button, { onClick: handleCreate, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add New Buyer"] })] }))] })] }), _jsxs("div", { className: "mb-4 p-3 bg-blue-50 rounded-lg", children: [_jsxs("p", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "Current User:" }), " ", currentUser.email, " (", currentUser.role === 'merchandising_manager' ? 'Merchandising Manager' : 'Merchant', ")"] }), _jsx("p", { className: "text-sm text-blue-600", children: currentUser.role === 'merchandising_manager'
                            ? `Viewing all ${buyers?.length || 0} buyers`
                            : `Viewing ${visibleBuyers?.length || 0} assigned buyers` })] }), _jsx("div", { className: "space-y-3", children: visibleBuyers?.map((buyer) => (_jsx(Card, { className: `${buyer.isActive ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-400 opacity-60'} transition-all hover:shadow-md`, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4 flex-1", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "h-6 w-6 text-blue-600" }) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 truncate", children: buyer.name }), _jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800", children: buyer.code }), _jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${buyer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`, children: buyer.isActive ? 'Active' : 'Inactive' })] }), _jsxs("div", { className: "mt-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-500", children: "Merchant:" }), " ", buyer.merchantId] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-500", children: "Currency:" }), " ", buyer.currency] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-500", children: "Reference:" }), " ", buyer.reference || 'Not set'] })] }), _jsxs("div", { className: "mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-500", children: "Payment Terms:" }), " ", buyer.paymentTerms || 'Not set'] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-500", children: "Shipment:" }), " ", buyer.shipmentMethod || 'Not set'] })] }), _jsx(ArticleNumbersInCard, { buyerId: buyer.id.toString() })] })] }), _jsxs("div", { className: "flex space-x-2 ml-4", children: [_jsx(ArticleNumberDisplay, { buyerId: buyer.id.toString(), buyerCode: buyer.code, buyerName: buyer.name }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleEdit(buyer), title: "Edit buyer details", children: _jsx(Edit, { className: "h-4 w-4" }) }), currentUser.role === 'merchandising_manager' && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDelete(buyer.id), title: "Delete buyer", children: _jsx(Trash2, { className: "h-4 w-4" }) }))] })] }) }) }, buyer.id))) }), _jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: editingBuyer ? 'Edit Buyer Profile' : 'Create New Buyer Profile' }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Basic Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Buyer Name *" }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "e.g., Classic Collection, ILVA A/S" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "code", children: "Buyer Code *" }), _jsx(Input, { id: "code", value: formData.code, onChange: (e) => setFormData({ ...formData, code: e.target.value }), placeholder: "e.g., A-01, B-02, C-03" })] }), currentUser.role === 'merchandising_manager' ? (_jsxs("div", { children: [_jsx(Label, { htmlFor: "merchantId", children: "Assigned Merchant *" }), _jsxs("select", { id: "merchantId", value: formData.merchantId, onChange: (e) => setFormData({ ...formData, merchantId: e.target.value }), className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background", children: [_jsx("option", { value: "", children: "Select a merchant" }), merchants.map(merchant => (_jsx("option", { value: merchant, children: merchant }, merchant)))] })] })) : (_jsxs("div", { children: [_jsx(Label, { htmlFor: "merchantId", children: "Assigned Merchant" }), _jsx(Input, { id: "merchantId", value: formData.merchantId, disabled: true, className: "bg-gray-100" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Only merchandising managers can assign merchants" })] })), _jsxs("div", { children: [_jsx(Label, { htmlFor: "reference", children: "Reference Contact" }), _jsx(Input, { id: "reference", value: formData.reference, onChange: (e) => setFormData({ ...formData, reference: e.target.value }), placeholder: "e.g., Pierre Flod\u00E9n, LHNI" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "currency", children: "Default Currency" }), _jsxs("select", { id: "currency", value: formData.currency, onChange: (e) => setFormData({ ...formData, currency: e.target.value }), className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background", children: [_jsx("option", { value: "USD", children: "USD" }), _jsx("option", { value: "EUR", children: "EUR" }), _jsx("option", { value: "GBP", children: "GBP" }), _jsx("option", { value: "SEK", children: "SEK" }), _jsx("option", { value: "DKK", children: "DKK" })] })] })] })] }), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Default Order Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "paymentTerms", children: "Payment Terms" }), _jsx(Input, { id: "paymentTerms", value: formData.paymentTerms, onChange: (e) => setFormData({ ...formData, paymentTerms: e.target.value }), placeholder: "e.g., 45 Days Net + 10 Days local" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "shipmentMethod", children: "Preferred Shipment Method" }), _jsx(Input, { id: "shipmentMethod", value: formData.shipmentMethod, onChange: (e) => setFormData({ ...formData, shipmentMethod: e.target.value }), placeholder: "e.g., Sea Freight, Road Transport" })] })] })] }), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Default Addresses" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "deliveryAddress", children: "Delivery Address" }), _jsx(Textarea, { id: "deliveryAddress", value: formData.deliveryAddress, onChange: (e) => setFormData({ ...formData, deliveryAddress: e.target.value }), placeholder: "Complete delivery address", rows: 4 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "invoiceAddress", children: "Invoice Address" }), _jsx(Textarea, { id: "invoiceAddress", value: formData.invoiceAddress, onChange: (e) => setFormData({ ...formData, invoiceAddress: e.target.value }), placeholder: "Complete invoice address", rows: 4 })] })] })] }), _jsxs("div", { className: "border rounded-lg p-4 bg-blue-50", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Article Numbers / SKUs" }), _jsx("p", { className: "text-sm text-blue-700 mb-2", children: "\uD83D\uDCCB Article numbers are now automatically imported from your ERP system. Design names, colors, and sizes are populated from actual order history." }), _jsx("p", { className: "text-xs text-blue-600", children: "To view and manage article numbers for this buyer, save the buyer profile and check the buyer card display." })] }), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Notes" }), _jsx(Textarea, { value: formData.notes, onChange: (e) => setFormData({ ...formData, notes: e.target.value }), placeholder: "Any special instructions or notes about this buyer", rows: 3 })] }), _jsx("div", { className: "border rounded-lg p-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "isActive", checked: formData.isActive, onChange: (e) => setFormData({ ...formData, isActive: e.target.checked }), className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "isActive", className: "font-medium", children: "Active Buyer" })] }) }), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleSave, children: editingBuyer ? 'Update Buyer' : 'Create Buyer' })] })] })] }) })] }));
};
export default BuyerManagement;
