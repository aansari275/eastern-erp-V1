import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Building2, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const BuyerManagement = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // Mock current user - in real app this would come from auth context
    const [currentUser, setCurrentUser] = useState({
        email: 'manager@easternmills.com', // Change this to test different user types
        role: 'merchandising_manager' // or 'merchant'
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
            setEditingBuyer(null);
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
    // Form state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBuyer, setEditingBuyer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
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
        notes: '',
        isActive: true
    });
    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            merchantId: '',
            reference: '',
            currency: 'USD',
            paymentTerms: '',
            deliveryAddress: '',
            invoiceAddress: '',
            shipmentMethod: '',
            notes: '',
            isActive: true
        });
        setEditingBuyer(null);
    };
    const openEditDialog = (buyer) => {
        setEditingBuyer(buyer);
        setFormData({
            name: buyer.name,
            code: buyer.code,
            merchantId: buyer.merchantId,
            reference: buyer.reference,
            currency: buyer.currency,
            paymentTerms: buyer.paymentTerms,
            deliveryAddress: buyer.deliveryAddress,
            invoiceAddress: buyer.invoiceAddress,
            shipmentMethod: buyer.shipmentMethod,
            notes: buyer.notes,
            isActive: buyer.isActive
        });
        setIsDialogOpen(true);
    };
    const handleSubmit = () => {
        if (editingBuyer) {
            updateBuyerMutation.mutate({ id: editingBuyer.id, ...formData });
        }
        else {
            createBuyerMutation.mutate(formData);
        }
    };
    // Filter buyers based on search term and user role
    const filteredBuyers = Array.isArray(buyers) ? buyers.filter((buyer) => {
        const matchesSearch = searchTerm === '' ||
            buyer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            buyer.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            buyer.merchantId?.toLowerCase().includes(searchTerm.toLowerCase());
        // Role-based filtering
        if (currentUser.role === 'merchant') {
            return matchesSearch && buyer.merchantId === currentUser.email;
        }
        return matchesSearch;
    }) : [];
    if (error) {
        return (_jsx("div", { className: "p-6", children: _jsxs("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded", children: ["Error loading buyers: ", error.message] }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Buyer Management" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage buyer profiles and account details" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: currentUser.role === 'merchandising_manager' ? 'default' : 'outline', size: "sm", onClick: () => setCurrentUser({ ...currentUser, role: 'merchandising_manager' }), children: "Manager View" }), _jsx(Button, { variant: currentUser.role === 'merchant' ? 'default' : 'outline', size: "sm", onClick: () => setCurrentUser({ ...currentUser, role: 'merchant', email: 'israr@easternmills.com' }), children: "Merchant View" })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between", children: [_jsx("div", { className: "flex-1 max-w-md", children: _jsx(Input, { placeholder: "Search buyers by name, code, or merchant...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full" }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-sm text-gray-600", children: [filteredBuyers.length, " of ", buyers.length, " buyers"] }), (currentUser.role === 'merchandising_manager') && (_jsxs(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { onClick: resetForm, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Buyer"] }) }), _jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: editingBuyer ? 'Edit Buyer' : 'Add New Buyer' }) }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Buyer Name" }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Enter buyer name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "code", children: "Buyer Code" }), _jsx(Input, { id: "code", value: formData.code, onChange: (e) => setFormData({ ...formData, code: e.target.value }), placeholder: "e.g., A-01" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "merchantId", children: "Assigned Merchant" }), _jsxs(Select, { value: formData.merchantId, onValueChange: (value) => setFormData({ ...formData, merchantId: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select merchant" }) }), _jsx(SelectContent, { children: merchants.map((merchant) => (_jsx(SelectItem, { value: merchant, children: merchant }, merchant))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "currency", children: "Currency" }), _jsxs(Select, { value: formData.currency, onValueChange: (value) => setFormData({ ...formData, currency: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD" }), _jsx(SelectItem, { value: "EUR", children: "EUR" }), _jsx(SelectItem, { value: "GBP", children: "GBP" }), _jsx(SelectItem, { value: "CAD", children: "CAD" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "reference", children: "Reference" }), _jsx(Input, { id: "reference", value: formData.reference, onChange: (e) => setFormData({ ...formData, reference: e.target.value }), placeholder: "Internal reference" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "paymentTerms", children: "Payment Terms" }), _jsx(Input, { id: "paymentTerms", value: formData.paymentTerms, onChange: (e) => setFormData({ ...formData, paymentTerms: e.target.value }), placeholder: "e.g., Net 30" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "shipmentMethod", children: "Shipment Method" }), _jsx(Input, { id: "shipmentMethod", value: formData.shipmentMethod, onChange: (e) => setFormData({ ...formData, shipmentMethod: e.target.value }), placeholder: "e.g., Sea Freight, Air Cargo" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "deliveryAddress", children: "Delivery Address" }), _jsx(Textarea, { id: "deliveryAddress", value: formData.deliveryAddress, onChange: (e) => setFormData({ ...formData, deliveryAddress: e.target.value }), placeholder: "Complete delivery address", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "invoiceAddress", children: "Invoice Address" }), _jsx(Textarea, { id: "invoiceAddress", value: formData.invoiceAddress, onChange: (e) => setFormData({ ...formData, invoiceAddress: e.target.value }), placeholder: "Complete invoice address", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "notes", children: "Notes" }), _jsx(Textarea, { id: "notes", value: formData.notes, onChange: (e) => setFormData({ ...formData, notes: e.target.value }), placeholder: "Additional notes or special requirements", rows: 2 })] }), _jsxs("div", { className: "flex justify-end space-x-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setIsDialogOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleSubmit, disabled: createBuyerMutation.isPending || updateBuyerMutation.isPending, children: [editingBuyer ? 'Update' : 'Create', " Buyer"] })] })] })] })] }))] })] }), isLoading ? (_jsx("div", { className: "text-center py-8", children: _jsx("div", { className: "text-gray-600", children: "Loading buyers..." }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredBuyers.map((buyer) => (_jsxs(Card, { className: "hover:shadow-md transition-shadow", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg text-gray-900", children: buyer.name }), _jsx("p", { className: "text-sm text-blue-600 font-medium", children: buyer.code })] }), _jsxs("div", { className: "flex space-x-1", children: [(currentUser.role === 'merchandising_manager' ||
                                                (currentUser.role === 'merchant' && buyer.merchantId === currentUser.email)) && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEditDialog(buyer), children: _jsx(Edit, { className: "h-4 w-4" }) })), currentUser.role === 'merchandising_manager' && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => deleteBuyerMutation.mutate(buyer.id), children: _jsx(Trash2, { className: "h-4 w-4" }) }))] })] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Users, { className: "h-4 w-4 mr-2" }), _jsx("span", { children: buyer.merchantId })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Building2, { className: "h-4 w-4 mr-2" }), _jsxs("span", { children: [buyer.currency, " \u2022 ", buyer.paymentTerms || 'Terms TBD'] })] })] }), buyer.notes && (_jsxs("div", { className: "bg-gray-50 p-2 rounded text-xs", children: [_jsx("strong", { children: "Notes:" }), " ", buyer.notes] }))] })] }, buyer.id))) })), filteredBuyers.length === 0 && !isLoading && (_jsx("div", { className: "text-center py-12", children: _jsx("div", { className: "text-gray-500", children: searchTerm ? 'No buyers match your search' : 'No buyers found' }) }))] }));
};
export default BuyerManagement;
