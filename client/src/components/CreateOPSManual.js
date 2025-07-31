import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Loader2, CheckCircle, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const CreateOPSManual = () => {
    // Mock current user for filtering
    const [currentUser, setCurrentUser] = useState({
        email: 'manager@easternmills.com', // Change this to test different merchant views
        role: 'merchandising_manager' // or 'merchant'
    });
    // Real buyer profiles from Eastern Mills data (first 10 for demo)
    const [allBuyerProfiles] = useState([
        { id: '1', name: 'ARSIN RIG', code: 'A-01', merchantId: 'israr@easternmills.com', reference: '', currency: 'USD', paymentTerms: '', deliveryAddress: '', invoiceAddress: '', shipmentMethod: '', articleNumbers: [], notes: '', isActive: true },
        { id: '2', name: 'ATELIER TORTIL', code: 'A-02', merchantId: 'israr@easternmills.com', reference: '', currency: 'USD', paymentTerms: '', deliveryAddress: '', invoiceAddress: '', shipmentMethod: '', articleNumbers: [], notes: '', isActive: true },
        { id: '3', name: 'AM PM', code: 'A-03', merchantId: 'anas.mahboob@easternmills.com', reference: '', currency: 'USD', paymentTerms: '', deliveryAddress: '', invoiceAddress: '', shipmentMethod: '', articleNumbers: [], notes: '', isActive: true },
        { id: '4', name: 'ABC ITALIA', code: 'A-05', merchantId: 'ashfer@easternmills.com', reference: '', currency: 'EUR', paymentTerms: '', deliveryAddress: '', invoiceAddress: '', shipmentMethod: '', articleNumbers: [], notes: '', isActive: true },
        { id: '5', name: 'ADORA', code: 'A-06', merchantId: 'zahid@easternmills.com', reference: '', currency: 'USD', paymentTerms: '', deliveryAddress: '', invoiceAddress: '', shipmentMethod: '', articleNumbers: [], notes: '', isActive: true },
        { id: '6', name: 'BENUTA', code: 'B-02', merchantId: 'ashfer@easternmills.com', reference: '', currency: 'EUR', paymentTerms: '', deliveryAddress: '', invoiceAddress: '', shipmentMethod: '', articleNumbers: [], notes: '', isActive: true },
        { id: '7', name: 'COURISTAN', code: 'C-01', merchantId: 'zahid@easternmills.com', reference: '', currency: 'USD', paymentTerms: '', deliveryAddress: '', invoiceAddress: '', shipmentMethod: '', articleNumbers: [], notes: '', isActive: true },
        { id: '8', name: 'CC MILANO', code: 'C-02', merchantId: 'anas.mahboob@easternmills.com', reference: '', currency: 'EUR', paymentTerms: '', deliveryAddress: '', invoiceAddress: '', shipmentMethod: '', articleNumbers: [], notes: '', isActive: true },
        { id: '9', name: 'CLASSIC COLLECTION', code: 'C-03', merchantId: 'zahid@easternmills.com', reference: '', currency: 'SEK', paymentTerms: '45 Days Net + 10 Days local', deliveryAddress: 'Classic Collection AB\nSödra Hamngatan 45\n411 06 Göteborg\nSweden', invoiceAddress: 'Classic Collection AB\nBox 123\n411 06 Göteborg\nSweden', shipmentMethod: 'Sea Freight', articleNumbers: ['SD104BE', 'SD105GR', 'CC-2024-001'], notes: 'Preferred shipping via Göteborg port', isActive: true },
        { id: '10', name: 'DESIGNER GUILD', code: 'D-01', merchantId: 'israr@easternmills.com', reference: '', currency: 'GBP', paymentTerms: '', deliveryAddress: '', invoiceAddress: '', shipmentMethod: '', articleNumbers: [], notes: '', isActive: true },
    ]);
    // Filter buyers based on user role
    const buyerProfiles = currentUser.role === 'merchandising_manager'
        ? allBuyerProfiles
        : allBuyerProfiles.filter(buyer => buyer.merchantId === currentUser.email);
    const [poData, setPOData] = useState({
        buyerId: '',
        buyerName: '',
        buyerPONo: '',
        orderDate: '',
        deliveryDate: '',
        deliveryAddress: '',
        invoiceAddress: '',
        supplierNumber: '',
        buyerReference: '',
        ourReference: '',
        currency: 'USD',
        paymentTerms: '',
        shipmentMethod: '',
        items: [{
                artNo: '',
                supplierItem: '',
                description: '',
                quantity: 0,
                unitPrice: 0,
                totalAmount: 0,
                notes: ''
            }],
        totalQty: 0,
        totalAmount: 0,
        vatAmount: 0,
        grandTotal: 0,
        orderNotes: '',
        urgentFlag: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const handleBuyerChange = (buyerId) => {
        const selectedBuyer = buyerProfiles.find(b => b.id === buyerId);
        if (selectedBuyer) {
            setPOData({
                ...poData,
                buyerId: selectedBuyer.id,
                buyerName: selectedBuyer.name,
                buyerReference: selectedBuyer.reference,
                currency: selectedBuyer.currency,
                paymentTerms: selectedBuyer.paymentTerms,
                deliveryAddress: selectedBuyer.deliveryAddress,
                invoiceAddress: selectedBuyer.invoiceAddress,
                shipmentMethod: selectedBuyer.shipmentMethod
            });
            toast({
                title: "Buyer details loaded",
                description: `${selectedBuyer.name} details have been automatically filled in.`,
            });
        }
        else {
            // Clear buyer data if no buyer selected
            setPOData({
                ...poData,
                buyerId: '',
                buyerName: '',
                buyerReference: '',
                currency: 'USD',
                paymentTerms: '',
                deliveryAddress: '',
                invoiceAddress: '',
                shipmentMethod: ''
            });
        }
    };
    const handleDataChange = (field, value) => {
        setPOData({ ...poData, [field]: value });
        // Auto-calculate totals when items change
        if (field === 'items') {
            calculateTotals(value);
        }
    };
    const calculateTotals = (items) => {
        const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalAmount = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
        const vatAmount = totalAmount * 0; // Assuming no VAT for now
        const grandTotal = totalAmount + vatAmount;
        setPOData(prev => ({
            ...prev,
            totalQty,
            totalAmount,
            vatAmount,
            grandTotal
        }));
    };
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...poData.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        // Auto-calculate total amount for the item
        if (field === 'quantity' || field === 'unitPrice') {
            const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
            const unitPrice = field === 'unitPrice' ? value : updatedItems[index].unitPrice;
            updatedItems[index].totalAmount = quantity * unitPrice;
        }
        setPOData({ ...poData, items: updatedItems });
        calculateTotals(updatedItems);
    };
    const addItem = () => {
        const newItem = {
            artNo: '',
            supplierItem: '',
            description: '',
            quantity: 0,
            unitPrice: 0,
            totalAmount: 0,
            notes: ''
        };
        const updatedItems = [...poData.items, newItem];
        setPOData({ ...poData, items: updatedItems });
    };
    const removeItem = (index) => {
        if (poData.items.length <= 1)
            return;
        const updatedItems = poData.items.filter((_, i) => i !== index);
        setPOData({ ...poData, items: updatedItems });
        calculateTotals(updatedItems);
    };
    const handleSubmit = async () => {
        // Validate required fields
        if (!poData.buyerName || !poData.buyerPONo || !poData.orderDate) {
            toast({
                title: "Missing required fields",
                description: "Please fill in Buyer Name, PO Number, and Order Date.",
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/ops/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(poData),
            });
            if (!response.ok) {
                throw new Error('Failed to create OPS');
            }
            toast({
                title: "OPS created successfully",
                description: "New order processing sheet has been created and added to the system.",
            });
            // Reset form
            clearForm();
        }
        catch (error) {
            console.error('Submit Error:', error);
            toast({
                title: "Creation failed",
                description: "Could not create the OPS. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const clearForm = () => {
        setPOData({
            buyerId: '',
            buyerName: '',
            buyerPONo: '',
            orderDate: '',
            deliveryDate: '',
            deliveryAddress: '',
            invoiceAddress: '',
            supplierNumber: '',
            buyerReference: '',
            ourReference: '',
            currency: 'USD',
            paymentTerms: '',
            shipmentMethod: '',
            items: [{
                    artNo: '',
                    supplierItem: '',
                    description: '',
                    quantity: 0,
                    unitPrice: 0,
                    totalAmount: 0,
                    notes: ''
                }],
            totalQty: 0,
            totalAmount: 0,
            vatAmount: 0,
            grandTotal: 0,
            orderNotes: '',
            urgentFlag: false
        });
    };
    const getSelectedBuyer = () => {
        return buyerProfiles.find(b => b.id === poData.buyerId);
    };
    return (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5" }), "Create New OPS - Manual Entry"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-gray-600 mb-4", children: "Enter purchase order details manually. All fields marked with * are required." }), _jsxs("div", { className: "mb-6 p-3 bg-gray-50 rounded-lg flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-700", children: [_jsx("strong", { children: "Demo User:" }), " ", currentUser.email, " (", currentUser.role === 'merchandising_manager' ? 'Manager - sees all buyers' : 'Merchant - sees assigned buyers only', ")"] }), _jsxs("select", { value: currentUser.email, onChange: (e) => {
                                        const email = e.target.value;
                                        setCurrentUser({
                                            email,
                                            role: email === 'manager@easternmills.com' ? 'merchandising_manager' : 'merchant'
                                        });
                                    }, className: "text-sm border rounded px-2 py-1", children: [_jsx("option", { value: "manager@easternmills.com", children: "Manager (sees all)" }), _jsx("option", { value: "israr@easternmills.com", children: "Israr (merchant)" }), _jsx("option", { value: "zahid@easternmills.com", children: "Zahid (merchant)" }), _jsx("option", { value: "ashfer@easternmills.com", children: "Ashfer (merchant)" }), _jsx("option", { value: "anas.mahboob@easternmills.com", children: "Anas (merchant)" })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Buyer Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx(Label, { htmlFor: "buyerSelect", children: "Select Buyer Profile" }), _jsxs("select", { id: "buyerSelect", value: poData.buyerId, onChange: (e) => handleBuyerChange(e.target.value), className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background", children: [_jsx("option", { value: "", children: "Choose a buyer or enter manually below" }), buyerProfiles.filter(b => b.isActive).map(buyer => (_jsxs("option", { value: buyer.id, children: [buyer.name, " (", buyer.code, ")"] }, buyer.id)))] }), poData.buyerId && (_jsx("p", { className: "text-sm text-green-600 mt-1", children: "\u2713 Buyer details automatically filled from profile" }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerName", children: "Buyer Name *" }), _jsx(Input, { id: "buyerName", value: poData.buyerName, onChange: (e) => handleDataChange('buyerName', e.target.value), placeholder: "e.g., Classic Collection, ILVA A/S, Nordic Knots Inc" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerPONo", children: "Purchase Order Number *" }), _jsx(Input, { id: "buyerPONo", value: poData.buyerPONo, onChange: (e) => handleDataChange('buyerPONo', e.target.value), placeholder: "e.g., 1262, 1100459771_04597711, PO2559" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "orderDate", children: "Order Date *" }), _jsx(Input, { id: "orderDate", type: "date", value: poData.orderDate, onChange: (e) => handleDataChange('orderDate', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "deliveryDate", children: "Delivery Date" }), _jsx(Input, { id: "deliveryDate", type: "date", value: poData.deliveryDate, onChange: (e) => handleDataChange('deliveryDate', e.target.value) })] })] }), getSelectedBuyer() && (_jsxs("div", { className: "mt-4 p-3 bg-blue-50 rounded-lg", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "Buyer Profile Details" }), _jsxs("div", { className: "text-sm text-blue-800 space-y-1", children: [_jsxs("p", { children: [_jsx("strong", { children: "Reference:" }), " ", getSelectedBuyer()?.reference] }), _jsxs("p", { children: [_jsx("strong", { children: "Articles:" }), " ", getSelectedBuyer()?.articleNumbers.join(', ')] }), getSelectedBuyer()?.notes && (_jsxs("p", { children: [_jsx("strong", { children: "Notes:" }), " ", getSelectedBuyer()?.notes] }))] })] }))] }), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Order Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "supplierNumber", children: "Supplier Number" }), _jsx(Input, { id: "supplierNumber", value: poData.supplierNumber, onChange: (e) => handleDataChange('supplierNumber', e.target.value), placeholder: "e.g., Eastern Mills / 1265, 10069" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerReference", children: "Buyer Reference" }), _jsx(Input, { id: "buyerReference", value: poData.buyerReference, onChange: (e) => handleDataChange('buyerReference', e.target.value), placeholder: "e.g., Pierre Flod\u00E9n, LHNI, SM Jan 2026" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "ourReference", children: "Our Reference" }), _jsx(Input, { id: "ourReference", value: poData.ourReference, onChange: (e) => handleDataChange('ourReference', e.target.value), placeholder: "e.g., Abdul Rahim Ansari" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "currency", children: "Currency" }), _jsxs("select", { id: "currency", value: poData.currency, onChange: (e) => handleDataChange('currency', e.target.value), className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background", children: [_jsx("option", { value: "USD", children: "USD" }), _jsx("option", { value: "EUR", children: "EUR" }), _jsx("option", { value: "GBP", children: "GBP" }), _jsx("option", { value: "SEK", children: "SEK" }), _jsx("option", { value: "DKK", children: "DKK" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "paymentTerms", children: "Payment Terms" }), _jsx(Input, { id: "paymentTerms", value: poData.paymentTerms, onChange: (e) => handleDataChange('paymentTerms', e.target.value), placeholder: "e.g., 45 Days Net + 10 Days local" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "shipmentMethod", children: "Shipment Method" }), _jsx(Input, { id: "shipmentMethod", value: poData.shipmentMethod, onChange: (e) => handleDataChange('shipmentMethod', e.target.value), placeholder: "e.g., Boat Shipment, Sea Freight" })] })] })] }), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Addresses" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "deliveryAddress", children: "Delivery Address" }), _jsx(Textarea, { id: "deliveryAddress", value: poData.deliveryAddress, onChange: (e) => handleDataChange('deliveryAddress', e.target.value), placeholder: "Complete delivery address with contact details", rows: 4 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "invoiceAddress", children: "Invoice Address" }), _jsx(Textarea, { id: "invoiceAddress", value: poData.invoiceAddress, onChange: (e) => handleDataChange('invoiceAddress', e.target.value), placeholder: "Complete invoice address (if different from delivery)", rows: 4 })] })] })] }), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Order Items" }), _jsxs(Button, { type: "button", onClick: addItem, variant: "outline", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Item"] })] }), _jsx("div", { className: "space-y-4", children: poData.items.map((item, index) => (_jsxs("div", { className: "border rounded p-4 space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "font-medium", children: ["Item ", index + 1] }), poData.items.length > 1 && (_jsx(Button, { type: "button", onClick: () => removeItem(index), variant: "destructive", size: "sm", children: _jsx(X, { className: "h-4 w-4" }) }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: `artNo-${index}`, children: "Article Number" }), getSelectedBuyer() && getSelectedBuyer().articleNumbers.length > 0 ? (_jsxs("select", { id: `artNo-${index}`, value: item.artNo, onChange: (e) => handleItemChange(index, 'artNo', e.target.value), className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background", children: [_jsx("option", { value: "", children: "Select or enter custom" }), getSelectedBuyer().articleNumbers.map(artNo => (_jsx("option", { value: artNo, children: artNo }, artNo)))] })) : (_jsx(Input, { id: `artNo-${index}`, value: item.artNo, onChange: (e) => handleItemChange(index, 'artNo', e.target.value), placeholder: "e.g., SD104BE, MELA2-BRO-259" }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: `supplierItem-${index}`, children: "Supplier Item Code" }), _jsx(Input, { id: `supplierItem-${index}`, value: item.supplierItem, onChange: (e) => handleItemChange(index, 'supplierItem', e.target.value), placeholder: "e.g., EM-25-MA-8741, AB12" })] }), _jsxs("div", { className: "md:col-span-2 lg:col-span-1", children: [_jsx(Label, { htmlFor: `description-${index}`, children: "Description" }), _jsx(Input, { id: `description-${index}`, value: item.description, onChange: (e) => handleItemChange(index, 'description', e.target.value), placeholder: "e.g., Rug Solid 170x230 Beige" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: `quantity-${index}`, children: "Quantity" }), _jsx(Input, { id: `quantity-${index}`, type: "number", value: item.quantity, onChange: (e) => handleItemChange(index, 'quantity', Number(e.target.value)), placeholder: "0" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: `unitPrice-${index}`, children: "Unit Price" }), _jsx(Input, { id: `unitPrice-${index}`, type: "number", step: "0.01", value: item.unitPrice, onChange: (e) => handleItemChange(index, 'unitPrice', Number(e.target.value)), placeholder: "0.00" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: `totalAmount-${index}`, children: "Total Amount" }), _jsx(Input, { id: `totalAmount-${index}`, type: "number", step: "0.01", value: item.totalAmount, disabled: true, className: "bg-gray-50" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: `notes-${index}`, children: "Item Notes (Optional)" }), _jsx(Input, { id: `notes-${index}`, value: item.notes || '', onChange: (e) => handleItemChange(index, 'notes', e.target.value), placeholder: "e.g., Original order 2 pieces - 5 pieces added 24-4-2025" })] })] }, index))) })] }), _jsxs("div", { className: "border rounded-lg p-4 bg-gray-50", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Order Summary" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Total Quantity" }), _jsxs("div", { className: "text-lg font-medium", children: [poData.totalQty, " pcs"] })] }), _jsxs("div", { children: [_jsxs(Label, { children: ["Subtotal (", poData.currency, ")"] }), _jsx("div", { className: "text-lg font-medium", children: poData.totalAmount.toFixed(2) })] }), _jsxs("div", { children: [_jsxs(Label, { children: ["VAT (", poData.currency, ")"] }), _jsx("div", { className: "text-lg font-medium", children: poData.vatAmount.toFixed(2) })] }), _jsxs("div", { children: [_jsxs(Label, { children: ["Grand Total (", poData.currency, ")"] }), _jsx("div", { className: "text-xl font-bold text-blue-600", children: poData.grandTotal.toFixed(2) })] })] })] }), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Additional Information" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "orderNotes", children: "Order Notes" }), _jsx(Textarea, { id: "orderNotes", value: poData.orderNotes, onChange: (e) => handleDataChange('orderNotes', e.target.value), placeholder: "Any special instructions or notes about this order", rows: 3 })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "urgentFlag", checked: poData.urgentFlag, onChange: (e) => handleDataChange('urgentFlag', e.target.checked), className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "urgentFlag", className: "text-red-600 font-medium", children: "Mark as Urgent Order" })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: clearForm, children: "Clear Form" }), _jsx(Button, { onClick: handleSubmit, disabled: isSubmitting, className: "min-w-32", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Creating..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Create OPS"] })) })] })] })] })] }) }));
};
export default CreateOPSManual;
