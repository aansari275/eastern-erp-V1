import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Download, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
const QuoteHistory = ({ rugs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [timeFilter, setTimeFilter] = useState('All Time');
    const [buyerFilter, setBuyerFilter] = useState('All Buyers');
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [expandedQuotes, setExpandedQuotes] = useState(new Set());
    const [editingQuote, setEditingQuote] = useState(null);
    const [actualQuotedAmount, setActualQuotedAmount] = useState('');
    const [productQuoteAmounts, setProductQuoteAmounts] = useState({});
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // Helper function to format Firebase timestamps
    const formatDate = (timestamp) => {
        if (!timestamp)
            return 'Invalid Date';
        try {
            // Handle Firebase timestamp object
            if (timestamp._seconds) {
                return new Date(timestamp._seconds * 1000).toLocaleDateString();
            }
            // Handle regular date string
            return new Date(timestamp).toLocaleDateString();
        }
        catch (error) {
            return 'Invalid Date';
        }
    };
    // Mutation to update quote with actual quoted amount
    const updateQuoteMutation = useMutation({
        mutationFn: async ({ quoteId, actualQuotedAmount }) => {
            const response = await fetch(`/api/quotes/${quoteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ actualQuotedAmount }),
            });
            if (!response.ok) {
                throw new Error('Failed to update quote');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
            toast({
                title: "Quote Updated",
                description: "Actual quoted amount has been saved successfully.",
            });
            setEditingQuote(null);
            setActualQuotedAmount('');
        },
        onError: (error) => {
            toast({
                title: "Update Failed",
                description: "Failed to update quote. Please try again.",
                variant: "destructive",
            });
        },
    });
    // Fetch quotes from quotes table
    const { data: quotes = [], isLoading: quotesLoading } = useQuery({
        queryKey: ['/api/quotes'],
        queryFn: async () => {
            const response = await fetch('/api/quotes');
            if (!response.ok) {
                throw new Error('Failed to fetch quotes');
            }
            return response.json();
        },
    });
    // Fetch buyers from buyers table
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
    // Helper functions for quote expansion and editing
    const toggleQuoteExpansion = (quoteId) => {
        setExpandedQuotes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(quoteId)) {
                newSet.delete(quoteId);
            }
            else {
                newSet.add(quoteId);
            }
            return newSet;
        });
    };
    const startEditingQuote = (quote) => {
        setEditingQuote(quote.id);
        setActualQuotedAmount(quote.actualQuotedAmount || '');
    };
    const cancelEditingQuote = () => {
        setEditingQuote(null);
        setActualQuotedAmount('');
    };
    const saveActualQuote = (quoteId) => {
        if (actualQuotedAmount.trim()) {
            updateQuoteMutation.mutate({ quoteId, actualQuotedAmount });
        }
    };
    // Helper functions for individual product quote amounts
    const getProductQuoteKey = (quoteId, rugId) => `${quoteId}-${rugId}`;
    const updateProductQuoteAmount = (quoteId, rugId, amount) => {
        const key = getProductQuoteKey(quoteId, rugId);
        setProductQuoteAmounts(prev => ({
            ...prev,
            [key]: amount
        }));
    };
    const getProductQuoteAmount = (quoteId, rugId) => {
        const key = getProductQuoteKey(quoteId, rugId);
        return productQuoteAmounts[key] || '';
    };
    const saveProductQuoteAmount = (quoteId, rugId) => {
        const amount = getProductQuoteAmount(quoteId, rugId);
        if (amount.trim()) {
            toast({
                title: "Product Quote Saved",
                description: `Quote amount ₹${amount} saved for product.`,
            });
        }
    };
    // Calculate profit metrics for individual products
    const calculateProductProfit = (calculatedCost, actualQuote) => {
        if (!actualQuote || !calculatedCost)
            return { profitAmount: 0, profitPercentage: 0 };
        const quotedAmount = parseFloat(actualQuote);
        const profitAmount = quotedAmount - calculatedCost;
        const profitPercentage = (profitAmount / calculatedCost) * 100;
        return { profitAmount, profitPercentage };
    };
    // Filter quotes based on search and filters
    const filteredQuotes = quotes.filter((quote) => {
        const matchesSearch = !searchTerm ||
            quote.quoteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.buyerName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBuyer = buyerFilter === 'All Buyers' ||
            quote.buyerName === buyerFilter;
        // Time filter logic
        let matchesTime = timeFilter === 'All Time';
        if (!matchesTime && quote.createdAt) {
            try {
                const quoteDate = quote.createdAt._seconds ?
                    new Date(quote.createdAt._seconds * 1000) :
                    new Date(quote.createdAt);
                const now = new Date();
                const diffInDays = Math.floor((now.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24));
                switch (timeFilter) {
                    case 'Last 7 Days':
                        matchesTime = diffInDays <= 7;
                        break;
                    case 'Last 30 Days':
                        matchesTime = diffInDays <= 30;
                        break;
                    case 'Last 90 Days':
                        matchesTime = diffInDays <= 90;
                        break;
                }
            }
            catch (error) {
                matchesTime = timeFilter === 'All Time';
            }
        }
        return matchesSearch && matchesBuyer && matchesTime;
    });
    // Sort by creation date (newest first)
    const sortedQuotes = [...filteredQuotes].sort((a, b) => {
        const dateA = new Date(a.createdAt || '');
        const dateB = new Date(b.createdAt || '');
        return dateB.getTime() - dateA.getTime();
    });
    // Get rugs associated with a quote
    const getQuoteRugs = (rugIds) => {
        return rugs.filter(rug => rugIds.includes(rug.id.toString()));
    };
    const handleExportQuote = (quote) => {
        const quoteRugs = getQuoteRugs(quote.rugIds);
        const quoteData = {
            quoteName: quote.quoteName,
            clientName: quote.clientName,
            buyerName: quote.buyerName,
            totalAmount: quote.totalAmount,
            currency: quote.currency,
            unitType: quote.unitType,
            overheadPercentage: quote.overheadPercentage,
            profitPercentage: quote.profitPercentage,
            notes: quote.notes,
            products: quoteRugs.map(rug => ({
                designName: rug.designName,
                construction: rug.construction,
                quality: rug.quality,
                color: rug.color,
                size: rug.size,
            })),
            quoteDate: new Date(quote.createdAt).toLocaleDateString(),
            createdBy: quote.createdBy,
        };
        const dataStr = JSON.stringify(quoteData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Quote_${quote.quoteName}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    const handleViewQuote = (quote) => {
        setSelectedQuote(quote);
        setIsDetailDialogOpen(true);
    };
    if (quotesLoading) {
        return (_jsxs("div", { className: "text-center py-12 bg-white rounded-lg shadow-sm", children: [_jsx("div", { className: "text-2xl text-gray-300 mb-4", children: "\u23F3" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Loading Quote History" }), _jsx("p", { className: "text-gray-500", children: "Please wait while we fetch your quotes..." })] }));
    }
    if (quotes.length === 0) {
        return (_jsxs("div", { className: "text-center py-12 bg-white rounded-lg shadow-sm", children: [_jsx("div", { className: "text-6xl text-gray-300 mb-4", children: "\uD83D\uDCCB" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Quote History Available" }), _jsx("p", { className: "text-gray-500", children: "Save some quotes from the Costing Review to see history here." })] }));
    }
    return (_jsxs("div", { className: "space-y-3 sm:space-y-6 pt-4 sm:pt-6", children: [_jsx("div", { className: "flex flex-col gap-3 sm:gap-2", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-lg sm:text-2xl font-semibold text-gray-900", children: "Quote History" }), _jsxs("p", { className: "text-sm sm:text-base text-gray-600", children: [filteredQuotes.length, " of ", quotes.length, " quotes"] })] }), _jsxs(Button, { variant: "outline", size: "sm", className: "text-xs sm:text-sm w-full sm:w-auto mt-2 sm:mt-0", children: [_jsx(Download, { className: "h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" }), "Export All"] })] }) }), _jsx("div", { className: "bg-white rounded-lg p-3 sm:p-4 shadow-sm", children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4", children: [_jsxs("div", { className: "relative sm:col-span-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" }), _jsx(Input, { placeholder: "Search quotes...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-8 sm:pl-10 text-xs sm:text-sm" })] }), _jsxs(Select, { value: timeFilter, onValueChange: setTimeFilter, children: [_jsx(SelectTrigger, { className: "text-xs sm:text-sm", children: _jsx(SelectValue, { placeholder: "All Time" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "All Time", children: "All Time" }), _jsx(SelectItem, { value: "Last 7 Days", children: "Last 7 Days" }), _jsx(SelectItem, { value: "Last 30 Days", children: "Last 30 Days" }), _jsx(SelectItem, { value: "Last 90 Days", children: "Last 90 Days" })] })] }), _jsxs(Select, { value: buyerFilter, onValueChange: setBuyerFilter, children: [_jsx(SelectTrigger, { className: "text-xs sm:text-sm", children: _jsx(SelectValue, { placeholder: "All Buyers" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "All Buyers", children: "All Buyers" }), buyers.filter(buyer => buyer && buyer.buyerName && buyer.buyerName.trim() !== '').map(buyer => (_jsxs(SelectItem, { value: buyer.buyerName, children: [buyer.buyerName, " (", buyer.buyerCode, ")"] }, buyer.id)))] })] })] }) }), _jsx("div", { className: "space-y-3", children: sortedQuotes.map((quote) => {
                    const quoteRugs = getQuoteRugs(quote.rugIds);
                    const isExpanded = expandedQuotes.has(quote.id);
                    const isEditing = editingQuote === quote.id;
                    return (_jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200", children: [_jsx("div", { className: "p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors", onClick: () => toggleQuoteExpansion(quote.id), children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "sm:hidden space-y-2", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900 text-sm", children: quote.quoteName }), _jsx("div", { className: "text-xs text-gray-500", children: quote.clientName })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: quote.status === 'draft' ? 'secondary' : 'default', className: "text-xs", children: quote.status }), isExpanded ? (_jsx(ChevronUp, { className: "h-4 w-4 text-gray-400" })) : (_jsx(ChevronDown, { className: "h-4 w-4 text-gray-400" }))] })] }), _jsxs("div", { className: "flex justify-between items-center text-xs", children: [_jsxs("span", { className: "text-gray-600", children: [quote.rugIds.length, " product", quote.rugIds.length !== 1 ? 's' : ''] }), _jsxs("span", { className: "font-medium text-gray-900", children: ["\u20B9", parseFloat(quote.totalAmount).toFixed(0)] })] })] }), _jsxs("div", { className: "hidden sm:flex sm:items-center sm:justify-between sm:w-full", children: [_jsxs("div", { className: "flex-1 grid grid-cols-6 gap-4 items-center", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: quote.quoteName }), _jsxs("div", { className: "text-sm text-gray-500", children: ["by ", quote.createdBy] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-900", children: quote.clientName }), quote.buyerName && (_jsx("div", { className: "text-sm text-gray-500", children: quote.buyerName }))] }), _jsxs("div", { children: [_jsxs("div", { className: "text-sm text-gray-900", children: [quote.rugIds.length, " product", quote.rugIds.length !== 1 ? 's' : ''] }), _jsxs("div", { className: "text-sm text-gray-500", children: [quoteRugs.slice(0, 2).map(rug => rug.designName).join(', '), quoteRugs.length > 2 && ` +${quoteRugs.length - 2} more`] })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-sm font-medium text-gray-900", children: ["\u20B9", parseFloat(quote.totalAmount).toFixed(2)] }), _jsx("div", { className: "text-sm text-gray-500", children: quote.unitType })] }), _jsxs("div", { children: [_jsx(Badge, { variant: quote.status === 'draft' ? 'secondary' : 'default', children: quote.status }), _jsx("div", { className: "text-sm text-gray-500 mt-1", children: formatDate(quote.createdAt) })] }), _jsx("div", { className: "flex space-x-2", children: _jsx(Button, { variant: "outline", size: "sm", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    handleExportQuote(quote);
                                                                }, children: _jsx(Download, { className: "h-3 w-3" }) }) })] }), _jsx("div", { className: "ml-4", children: isExpanded ? (_jsx(ChevronUp, { className: "h-5 w-5 text-gray-400" })) : (_jsx(ChevronDown, { className: "h-5 w-5 text-gray-400" })) })] })] }) }), isExpanded && (_jsxs("div", { className: "border-t border-gray-200 p-3 sm:p-4 bg-gray-50", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base", children: ["Products (", quote.rugIds.length, ")"] }), _jsx("div", { className: "space-y-2 sm:space-y-3", children: quoteRugs.map((rug, index) => (_jsxs("div", { className: "border rounded-md p-2 sm:p-3 bg-white", children: [_jsxs("div", { className: "sm:hidden space-y-2", children: [_jsx("div", { className: "font-medium text-gray-900 text-sm", children: rug.designName }), _jsxs("div", { className: "text-xs text-gray-600", children: [rug.construction, " \u2022 ", rug.color, " \u2022 ", rug.size] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Calculated Cost" }), _jsxs("span", { className: "font-medium text-gray-900 text-sm", children: [quote.currency === 'USD' ? '$' : '₹', rug.finalCostPSM ? (parseFloat(rug.finalCostPSM.toString())).toFixed(0) : '0'] })] })] }), _jsxs("div", { className: "hidden sm:grid sm:grid-cols-4 sm:gap-4 sm:items-center", children: [_jsxs("div", { className: "col-span-2", children: [_jsx("div", { className: "font-medium text-gray-900", children: rug.designName }), _jsxs("div", { className: "text-sm text-gray-600", children: [rug.construction, " \u2022 ", rug.quality] }), _jsxs("div", { className: "text-sm text-gray-600", children: [rug.color, " \u2022 ", rug.size] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Calculated Cost" }), _jsxs("div", { className: "font-medium text-gray-900", children: [quote.currency === 'USD' ? '$' : '₹', rug.finalCostPSM ? (parseFloat(rug.finalCostPSM.toString())).toFixed(2) : '0.00'] }), _jsx("div", { className: "text-xs text-gray-500", children: quote.unitType }), _jsxs("div", { className: "text-xs text-gray-400 mt-1 space-y-1", children: [_jsxs("div", { children: ["Material: ", quote.currency === 'USD' ? '$' : '₹', (rug.totalMaterialCost || 0).toFixed(2)] }), _jsxs("div", { children: ["Process: ", quote.currency === 'USD' ? '$' : '₹', ((rug.weavingCost || 0) + (rug.finishingCost || 0) + (rug.packingCost || 0)).toFixed(2)] }), _jsxs("div", { children: ["OH: ", quote.overheadPercentage, "%"] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Actual Quote Amount" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { type: "number", placeholder: "Enter amount", value: getProductQuoteAmount(quote.id, rug.id.toString()), onChange: (e) => updateProductQuoteAmount(quote.id, rug.id.toString(), e.target.value), className: "flex-1" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => saveProductQuoteAmount(quote.id, rug.id.toString()), disabled: !getProductQuoteAmount(quote.id, rug.id.toString()).trim(), children: _jsx(Save, { className: "h-3 w-3" }) })] }), getProductQuoteAmount(quote.id, rug.id.toString()) && (_jsx("div", { className: "mt-2 text-xs", children: (() => {
                                                                                const calculatedCost = rug.finalCostPSM ? parseFloat(rug.finalCostPSM.toString()) : 0;
                                                                                const { profitAmount, profitPercentage } = calculateProductProfit(calculatedCost, getProductQuoteAmount(quote.id, rug.id.toString()));
                                                                                return (_jsx("div", { className: `p-2 rounded ${profitAmount >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`, children: _jsxs("div", { children: ["Profit: ", quote.currency === 'USD' ? '$' : '₹', profitAmount.toFixed(2), " (", profitPercentage.toFixed(1), "%)"] }) }));
                                                                            })() }))] })] })] }, index))) })] }), quote.notes && (_jsxs("div", { className: "mt-4 pt-4 border-t border-gray-300", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Notes" }), _jsx("p", { className: "text-sm text-gray-600", children: quote.notes })] }))] }))] }, quote.id));
                }) }), filteredQuotes.length === 0 && quotes.length > 0 && (_jsxs("div", { className: "text-center py-12 bg-white rounded-lg shadow-sm", children: [_jsx("div", { className: "text-4xl text-gray-300 mb-4", children: "\uD83D\uDD0D" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Matching Quotes" }), _jsx("p", { className: "text-gray-500", children: "Try adjusting your search or filter criteria." })] })), _jsx(Dialog, { open: isDetailDialogOpen, onOpenChange: setIsDetailDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-[600px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Quote Details" }), _jsx(DialogDescription, { children: "Detailed information about the selected quote." })] }), selectedQuote && (_jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Quote Information" }), _jsxs("div", { className: "space-y-2 mt-2 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Name:" }), " ", selectedQuote.quoteName] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Client:" }), " ", selectedQuote.clientName] }), selectedQuote.buyerName && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Buyer:" }), " ", selectedQuote.buyerName] })), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Status:" }), " ", _jsx(Badge, { variant: "secondary", children: selectedQuote.status })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Created:" }), " ", new Date(selectedQuote.createdAt).toLocaleDateString()] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Created By:" }), " ", selectedQuote.createdBy] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Pricing Details" }), _jsxs("div", { className: "space-y-2 mt-2 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Total Amount:" }), " \u20B9", parseFloat(selectedQuote.totalAmount).toFixed(2)] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Currency:" }), " ", selectedQuote.currency] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Unit Type:" }), " ", selectedQuote.unitType] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Overhead:" }), " ", selectedQuote.overheadPercentage, "%"] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Profit:" }), " ", selectedQuote.profitPercentage, "%"] }), selectedQuote.currency === 'USD' && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "USD Rate:" }), " \u20B9", selectedQuote.usdRate] }))] })] })] }), selectedQuote.notes && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Notes" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: selectedQuote.notes })] })), _jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-gray-900", children: ["Products (", selectedQuote.rugIds.length, ")"] }), _jsx("div", { className: "mt-2 space-y-2", children: getQuoteRugs(selectedQuote.rugIds).map((rug, index) => (_jsx("div", { className: "border rounded-md p-3 bg-gray-50", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: rug.designName }), _jsxs("div", { className: "text-gray-600", children: ["Construction: ", rug.construction] }), _jsxs("div", { className: "text-gray-600", children: ["Quality: ", rug.quality] })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-gray-600", children: ["Color: ", rug.color] }), _jsxs("div", { className: "text-gray-600", children: ["Size: ", rug.size] })] })] }) }, index))) })] })] }))] }) })] }));
};
export default QuoteHistory;
