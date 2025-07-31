import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Factory, TrendingUp } from 'lucide-react';
import OrdersManagement from './OrdersManagement';
const ProductionDashboard = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // Set default date range to last 30 days
    React.useEffect(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    }, []);
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Production Management" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Monitor and manage manufacturing orders and production workflow" })] }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5" }), "Filter by Date Range"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 items-end", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "startDate", className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Date" }), _jsx(Input, { id: "startDate", type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "endDate", className: "block text-sm font-medium text-gray-700 mb-1", children: "End Date" }), _jsx(Input, { id: "endDate", type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value) })] }), _jsx("div", { children: _jsx(Button, { onClick: () => {
                                            // Trigger refresh of orders with new date range
                                            window.location.reload();
                                        }, className: "w-full", children: "Apply Filter" }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active Production" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: "Manufacturing Orders" })] }), _jsx(Factory, { className: "h-8 w-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Workflow Tracking" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: "Order Progress" })] }), _jsx(TrendingUp, { className: "h-8 w-8 text-green-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Delay Management" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: "Critical Orders" })] }), _jsx(Calendar, { className: "h-8 w-8 text-red-500" })] }) }) })] }), _jsx(OrdersManagement, { startDate: startDate, endDate: endDate })] }));
};
export default ProductionDashboard;
