import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Package, Calendar, Eye, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const OrdersManagement = ({ startDate, endDate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [buyerFilter, setBuyerFilter] = useState('all');
    const [sortBy, setSortBy] = useState('delivery-date');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const { toast } = useToast();
    // Fetch OPS orders
    const { data: orders = [], isLoading, error } = useQuery({
        queryKey: ['/api/ops', startDate, endDate],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (startDate)
                params.append('startDate', startDate);
            if (endDate)
                params.append('endDate', endDate);
            const response = await fetch(`/api/ops?${params.toString()}`);
            if (!response.ok)
                throw new Error('Failed to fetch orders');
            return response.json();
        },
        staleTime: 0,
        gcTime: 0,
    });
    // Fetch order details when order is selected
    const { data: orderDetails = [], isLoading: detailsLoading } = useQuery({
        queryKey: ['/api/ops', selectedOrder?.boId, 'details'],
        enabled: !!selectedOrder?.boId,
        staleTime: 0,
        gcTime: 0, // Updated from cacheTime to gcTime for React Query v5
    });
    // Get unique buyers for filter dropdown
    const uniqueBuyers = React.useMemo(() => {
        const buyers = orders.map(order => ({ code: order.buyerCode, name: order.buyerName }));
        const uniqueList = buyers.filter((buyer, index, self) => index === self.findIndex(b => b.code === buyer.code));
        return uniqueList.sort((a, b) => a.name.localeCompare(b.name));
    }, [orders]);
    // Apply filters and sorting
    const filteredAndSortedOrders = React.useMemo(() => {
        const filtered = orders.filter(order => {
            const matchesSearch = order.opsNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.buyerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.orderType.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'delayed' && order.isDelayed) ||
                (statusFilter === 'on-track' && !order.isDelayed && order.totalSaleQty < order.totalOrderedQty) ||
                (statusFilter === 'completed' && order.totalSaleQty >= order.totalOrderedQty);
            const matchesBuyer = buyerFilter === 'all' || order.buyerCode === buyerFilter;
            return matchesSearch && matchesStatus && matchesBuyer;
        });
        // Sort orders
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'delivery-date':
                    comparison = new Date(a.deliveryDate || '').getTime() - new Date(b.deliveryDate || '').getTime();
                    break;
                case 'delay-days':
                    comparison = a.daysDelayed - b.daysDelayed;
                    break;
                case 'ops-no':
                    comparison = a.opsNo.localeCompare(b.opsNo);
                    break;
                case 'buyer':
                    comparison = a.buyerName.localeCompare(b.buyerName);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        return filtered;
    }, [orders, searchTerm, statusFilter, buyerFilter, sortBy, sortOrder]);
    // Calculate manufacturing workflow metrics
    const calculateMetrics = () => {
        if (!filteredAndSortedOrders || filteredAndSortedOrders.length === 0)
            return null;
        const totalOrders = filteredAndSortedOrders.length;
        const delayedOrders = filteredAndSortedOrders.filter(order => order.isDelayed).length;
        const completedOrders = filteredAndSortedOrders.filter(order => order.totalSaleQty >= order.totalOrderedQty).length;
        const totalPieces = filteredAndSortedOrders.reduce((sum, order) => sum + order.orderedPieces, 0);
        const totalArea = filteredAndSortedOrders.reduce((sum, order) => sum + order.totalArea, 0);
        const avgDelayDays = delayedOrders > 0 ? Math.round(filteredAndSortedOrders.filter(order => order.isDelayed).reduce((sum, order) => sum + order.daysDelayed, 0) / delayedOrders) : 0;
        return {
            totalOrders,
            delayedOrders,
            completedOrders,
            totalPieces,
            totalArea: Math.round(totalArea),
            avgDelayDays,
            onTimeRate: totalOrders > 0 ? Math.round(((totalOrders - delayedOrders) / totalOrders) * 100) : 100
        };
    };
    // Calculate order detail metrics for selected order
    const calculateDetailMetrics = (details) => {
        if (!details || details.length === 0)
            return null;
        const totalOrdered = details.reduce((sum, item) => sum + item.orderedQty, 0);
        const totalIssued = details.reduce((sum, item) => sum + item.issuedQty, 0);
        const totalBazar = details.reduce((sum, item) => sum + item.bazarQty, 0);
        const totalShipped = details.reduce((sum, item) => sum + item.saleQty, 0);
        return {
            totalOrdered,
            totalIssued,
            totalBazar,
            totalShipped,
            weavingProgress: totalOrdered > 0 ? Math.round((totalIssued / totalOrdered) * 100) : 0,
            inspectionProgress: totalIssued > 0 ? Math.round((totalBazar / totalIssued) * 100) : 0,
            shippingProgress: totalBazar > 0 ? Math.round((totalShipped / totalBazar) * 100) : 0,
            overallProgress: totalOrdered > 0 ? Math.round((totalShipped / totalOrdered) * 100) : 0
        };
    };
    const metrics = calculateMetrics();
    const detailMetrics = calculateDetailMetrics(orderDetails);
    // Filter orders based on search term
    // Use the filtered and sorted orders
    const filteredOrders = filteredAndSortedOrders;
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };
    const formatCurrency = (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(amount);
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN');
    };
    if (error) {
        return (_jsx(Card, { className: "w-full", children: _jsx(CardContent, { className: "p-6", children: _jsx("div", { className: "text-center text-red-600", children: _jsxs("p", { children: ["Error loading orders: ", error instanceof Error ? error.message : 'Unknown error'] }) }) }) }));
    }
    return (_jsxs("div", { className: "w-full space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Orders Management" }), _jsx("p", { className: "text-gray-600", children: "Track OPS manufacturing workflow from order to shipping" })] }), _jsxs(Badge, { variant: "secondary", className: "text-lg px-3 py-1", children: [filteredOrders.length, " Orders"] })] }), metrics && (_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Orders" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: metrics.totalOrders })] }), _jsx(Package, { className: "h-8 w-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\uD83D\uDD34 Delayed Orders" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: metrics.delayedOrders })] }), _jsx("div", { className: "h-8 w-8 bg-red-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-red-600 font-bold text-sm", children: "!" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\uD83D\uDFE2 Completed Orders" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: metrics.completedOrders })] }), _jsx("div", { className: "h-8 w-8 bg-green-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-green-600 font-bold text-sm", children: "\u2713" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Avg Delay Days" }), _jsx("p", { className: "text-2xl font-bold text-orange-600", children: metrics.avgDelayDays })] }), _jsx("div", { className: "h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-orange-600 font-bold text-sm", children: "\uD83D\uDCC5" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Pieces" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: metrics.totalPieces.toLocaleString() })] }), _jsx("div", { className: "h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-purple-600 font-bold text-sm", children: "P" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "On-Time Rate" }), _jsxs("p", { className: "text-2xl font-bold text-teal-600", children: [metrics.onTimeRate, "%"] })] }), _jsx("div", { className: "h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-teal-600 font-bold text-sm", children: "%" }) })] }) }) })] })), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Search orders...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "All Orders" }), _jsx("option", { value: "delayed", children: "\uD83D\uDD34 Delayed Orders" }), _jsx("option", { value: "on-track", children: "\uD83D\uDFE1 In Progress" }), _jsx("option", { value: "completed", children: "\uD83D\uDFE2 Completed" })] }), _jsxs("select", { value: buyerFilter, onChange: (e) => setBuyerFilter(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "All Buyers" }), uniqueBuyers.map(buyer => (_jsxs("option", { value: buyer.code, children: [buyer.name, " (", buyer.code, ")"] }, buyer.code)))] }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "delivery-date", children: "Sort by Delivery Date" }), _jsx("option", { value: "delay-days", children: "Sort by Delay Days" }), _jsx("option", { value: "ops-no", children: "Sort by OPS No" }), _jsx("option", { value: "buyer", children: "Sort by Buyer" })] }), _jsx("button", { onClick: () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'), className: "px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500", children: sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending' })] }) }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Package, { className: "h-5 w-5" }), "OPS Orders Management"] }) }), _jsx(CardContent, { children: isLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Loading orders..." })] })) : filteredOrders.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Package, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: searchTerm ? 'No orders match your search criteria' : 'No orders found' })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "OPS No" }), _jsx(TableHead, { children: "Buyer Details" }), _jsx(TableHead, { children: "Order Date" }), _jsx(TableHead, { children: "Delivery Date" }), _jsx(TableHead, { children: "Days Delayed" }), _jsx(TableHead, { children: "Progress" }), _jsx(TableHead, { children: "Amount" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: filteredOrders.map((order) => {
                                            const progressPercentage = order.totalOrderedQty > 0 ? Math.round((order.totalSaleQty / order.totalOrderedQty) * 100) : 0;
                                            const isCompleted = progressPercentage >= 100;
                                            return (_jsxs(TableRow, { className: order.isDelayed && !isCompleted ? 'bg-red-50' : '', children: [_jsx(TableCell, { children: _jsx("div", { className: "flex items-center gap-2", children: order.isDelayed && !isCompleted ? (_jsx("span", { className: "text-red-600 font-bold", children: "\uD83D\uDD34 DELAYED" })) : isCompleted ? (_jsx("span", { className: "text-green-600 font-bold", children: "\uD83D\uDFE2 COMPLETED" })) : (_jsx("span", { className: "text-yellow-600 font-bold", children: "\uD83D\uDFE1 IN PROGRESS" })) }) }), _jsx(TableCell, { className: "font-mono font-medium text-blue-600", children: order.opsNo }), _jsx(TableCell, { children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: order.buyerName }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Code: ", order.buyerCode] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["In-charge: ", order.incharge] })] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-1 text-sm", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400" }), formatDate(order.orderDate)] }) }), _jsx(TableCell, { className: order.isDelayed ? 'text-red-600 font-medium' : '', children: _jsxs("div", { className: "flex items-center gap-1 text-sm", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400" }), formatDate(order.deliveryDate)] }) }), _jsx(TableCell, { children: order.isDelayed && !isCompleted ? (_jsxs(Badge, { variant: "destructive", className: "text-xs", children: [order.daysDelayed, " days"] })) : (_jsx("span", { className: "text-gray-500 text-sm", children: "-" })) }), _jsx(TableCell, { children: _jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "flex justify-between text-xs mb-1", children: [_jsxs("span", { children: [order.totalSaleQty, "/", order.totalOrderedQty] }), _jsxs("span", { children: [progressPercentage, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' :
                                                                            order.isDelayed ? 'bg-red-500' : 'bg-blue-500'}`, style: { width: `${Math.min(progressPercentage, 100)}%` } }) })] }) }), _jsxs(TableCell, { children: [_jsx("div", { className: "text-sm font-medium", children: formatCurrency(order.totalAmount) }), _jsxs("div", { className: "text-xs text-gray-500", children: [order.orderedPieces, " pcs \u2022 ", order.totalArea, " sqm"] })] }), _jsx(TableCell, { children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleViewDetails(order), className: "flex items-center gap-1", children: [_jsx(Eye, { className: "h-4 w-4" }), "Details"] }) })] }, order.boId));
                                        }) })] }) })) })] }), _jsx(Dialog, { open: detailsOpen, onOpenChange: setDetailsOpen, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(ExternalLink, { className: "h-5 w-5" }), "Order Details - OPS ", selectedOrder?.opsNo] }) }), selectedOrder && (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Order Summary" }) }), _jsxs(CardContent, { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Internal OPS No" }), _jsx("p", { className: "font-mono font-medium text-blue-600", children: selectedOrder.opsNo })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "BO ID" }), _jsx("p", { className: "font-mono font-medium", children: selectedOrder.boId })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Buyer" }), _jsx("p", { className: "font-medium", children: selectedOrder.buyerName }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Code: ", selectedOrder.buyerCode] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Order Type" }), _jsx("p", { className: "font-medium text-purple-600", children: selectedOrder.orderType })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "In-charge" }), _jsx("p", { className: "font-medium", children: selectedOrder.incharge })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Order Pieces" }), _jsxs("p", { className: "font-medium", children: [selectedOrder.orderedPieces, " pcs"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Area" }), _jsxs("p", { className: "font-medium", children: [selectedOrder.totalArea, " sqm"] })] }), selectedOrder.totalAmount > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Expected Value" }), _jsx("p", { className: "font-medium text-green-600", children: formatCurrency(selectedOrder.totalAmount, selectedOrder.currency) })] }))] })] }), detailMetrics && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Manufacturing Workflow Progress" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Ordered Qty" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: detailMetrics.totalOrdered })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Issued for Weaving" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: detailMetrics.totalIssued }), _jsxs("p", { className: "text-xs text-gray-500", children: [detailMetrics.weavingProgress, "% of ordered"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Post-Weaving Qty" }), _jsx("p", { className: "text-2xl font-bold text-orange-600", children: detailMetrics.totalBazar }), _jsxs("p", { className: "text-xs text-gray-500", children: [detailMetrics.inspectionProgress, "% of issued"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Shipped Qty" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: detailMetrics.totalShipped }), _jsxs("p", { className: "text-xs text-gray-500", children: [detailMetrics.overallProgress, "% complete"] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("p", { className: "text-sm font-medium text-gray-700", children: ["Overall Progress: ", detailMetrics.overallProgress, "%"] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300", style: { width: `${detailMetrics.overallProgress}%` } }) }), _jsxs("div", { className: "flex justify-between text-xs text-gray-500", children: [_jsx("span", { children: "Order" }), _jsx("span", { children: "Weaving" }), _jsx("span", { children: "Inspection" }), _jsx("span", { children: "Shipping" })] })] })] })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Order Items Detail" }) }), _jsx(CardContent, { children: detailsLoading ? (_jsxs("div", { className: "text-center py-4", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Loading items..." })] })) : orderDetails.length === 0 ? (_jsx("p", { className: "text-center text-gray-600 py-4", children: "No items found for this order" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Quality" }), _jsx(TableHead, { children: "Design" }), _jsx(TableHead, { children: "Colour" }), _jsx(TableHead, { children: "Size" }), _jsx(TableHead, { children: "Ordered Qty" }), _jsx(TableHead, { children: "Issued Qty" }), _jsx(TableHead, { children: "Bazar Qty" }), _jsx(TableHead, { children: "Sale Qty" }), _jsx(TableHead, { children: "Area" }), _jsx(TableHead, { children: "Delivery Date" })] }) }), _jsx(TableBody, { children: orderDetails.map((item, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: item.quality }), _jsx(TableCell, { className: "font-medium text-blue-600", children: item.design }), _jsx(TableCell, { children: item.colour }), _jsx(TableCell, { className: "font-mono text-sm", children: item.size }), _jsx(TableCell, { className: "text-right font-medium", children: item.orderedQty.toLocaleString() }), _jsx(TableCell, { className: "text-right text-green-600", children: item.issuedQty.toLocaleString() }), _jsx(TableCell, { className: "text-right text-orange-600", children: item.bazarQty.toLocaleString() }), _jsx(TableCell, { className: "text-right text-purple-600", children: item.saleQty.toLocaleString() }), _jsxs(TableCell, { className: "text-right", children: [item.itemArea, " sqm"] }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-1 text-sm", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400" }), formatDate(item.deliveryDate)] }) })] }, `${item.boId}-${item.design}-${item.colour}-${index}`))) })] }) })) })] })] }))] }) })] }));
};
export default OrdersManagement;
