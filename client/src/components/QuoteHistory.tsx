import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Search, Calendar, Download, Eye, ChevronDown, ChevronUp, Edit3, Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';

interface Quote {
  id: number;
  quoteName: string;
  clientName: string;
  buyerName?: string;
  rugIds: string[];
  overheadPercentage: string;
  profitPercentage: string;
  unitType: string;
  currency: string;
  usdRate: string;
  totalAmount: string;
  actualQuotedAmount?: string;
  notes?: string;
  status: string;
  createdBy: string;
  createdAt: any; // Firebase timestamp
  updatedAt: any; // Firebase timestamp
}

interface Rug {
  id: string | number;
  designName: string;
  construction: string;
  quality: string;
  color: string;
  size: string;
  buyerName?: string;
  finalCostPSM?: number;
  totalMaterialCost?: number;
  weavingCost?: number;
  finishingCost?: number;
  packingCost?: number;
  createdAt?: string;
}

interface Buyer {
  id: string | number;
  buyerName: string;
  buyerCode: string;
}

interface QuoteHistoryProps {
  rugs: Rug[];
}

const QuoteHistory: React.FC<QuoteHistoryProps> = ({ rugs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [buyerFilter, setBuyerFilter] = useState('All Buyers');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [expandedQuotes, setExpandedQuotes] = useState<Set<number>>(new Set());
  const [editingQuote, setEditingQuote] = useState<number | null>(null);
  const [actualQuotedAmount, setActualQuotedAmount] = useState('');
  const [productQuoteAmounts, setProductQuoteAmounts] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper function to format Firebase timestamps
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Invalid Date';
    
    try {
      // Handle Firebase timestamp object
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toLocaleDateString();
      }
      // Handle regular date string
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Mutation to update quote with actual quoted amount
  const updateQuoteMutation = useMutation({
    mutationFn: async ({ quoteId, actualQuotedAmount }: { quoteId: number; actualQuotedAmount: string }) => {
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
  const toggleQuoteExpansion = (quoteId: number) => {
    setExpandedQuotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) {
        newSet.delete(quoteId);
      } else {
        newSet.add(quoteId);
      }
      return newSet;
    });
  };

  const startEditingQuote = (quote: Quote) => {
    setEditingQuote(quote.id);
    setActualQuotedAmount(quote.actualQuotedAmount || '');
  };

  const cancelEditingQuote = () => {
    setEditingQuote(null);
    setActualQuotedAmount('');
  };

  const saveActualQuote = (quoteId: number) => {
    if (actualQuotedAmount.trim()) {
      updateQuoteMutation.mutate({ quoteId, actualQuotedAmount });
    }
  };

  // Helper functions for individual product quote amounts
  const getProductQuoteKey = (quoteId: number, rugId: string) => `${quoteId}-${rugId}`;
  
  const updateProductQuoteAmount = (quoteId: number, rugId: string, amount: string) => {
    const key = getProductQuoteKey(quoteId, rugId);
    setProductQuoteAmounts(prev => ({
      ...prev,
      [key]: amount
    }));
  };

  const getProductQuoteAmount = (quoteId: number, rugId: string) => {
    const key = getProductQuoteKey(quoteId, rugId);
    return productQuoteAmounts[key] || '';
  };

  const saveProductQuoteAmount = (quoteId: number, rugId: string) => {
    const amount = getProductQuoteAmount(quoteId, rugId);
    if (amount.trim()) {
      toast({
        title: "Product Quote Saved",
        description: `Quote amount ₹${amount} saved for product.`,
      });
    }
  };

  // Calculate profit metrics for individual products
  const calculateProductProfit = (calculatedCost: number, actualQuote: string) => {
    if (!actualQuote || !calculatedCost) return { profitAmount: 0, profitPercentage: 0 };
    
    const quotedAmount = parseFloat(actualQuote);
    const profitAmount = quotedAmount - calculatedCost;
    const profitPercentage = (profitAmount / calculatedCost) * 100;
    
    return { profitAmount, profitPercentage };
  };

  // Filter quotes based on search and filters
  const filteredQuotes = quotes.filter((quote: Quote) => {
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
      } catch (error) {
        matchesTime = timeFilter === 'All Time';
      }
    }

    return matchesSearch && matchesBuyer && matchesTime;
  });

  // Sort by creation date (newest first)
  const sortedQuotes = [...filteredQuotes].sort((a: Quote, b: Quote) => {
    const dateA = new Date(a.createdAt || '');
    const dateB = new Date(b.createdAt || '');
    return dateB.getTime() - dateA.getTime();
  });

  // Get rugs associated with a quote
  const getQuoteRugs = (rugIds: string[]) => {
    return rugs.filter(rug => rugIds.includes(rug.id.toString()));
  };

  const handleExportQuote = (quote: Quote) => {
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

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsDetailDialogOpen(true);
  };

  if (quotesLoading) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <div className="text-2xl text-gray-300 mb-4">⏳</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Quote History</h3>
        <p className="text-gray-500">Please wait while we fetch your quotes...</p>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <div className="text-6xl text-gray-300 mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Quote History Available</h3>
        <p className="text-gray-500">Save some quotes from the Costing Review to see history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6 pt-4 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1">
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Quote History</h2>
            <p className="text-sm sm:text-base text-gray-600">{filteredQuotes.length} of {quotes.length} quotes</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto mt-2 sm:mt-0">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
            <Input
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 text-xs sm:text-sm"
            />
          </div>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="text-xs sm:text-sm">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Time">All Time</SelectItem>
              <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
              <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
              <SelectItem value="Last 90 Days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={buyerFilter} onValueChange={setBuyerFilter}>
            <SelectTrigger className="text-xs sm:text-sm">
              <SelectValue placeholder="All Buyers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Buyers">All Buyers</SelectItem>
              {buyers.filter(buyer => buyer && buyer.buyerName && buyer.buyerName.trim() !== '').map(buyer => (
                <SelectItem key={buyer.id} value={buyer.buyerName}>
                  {buyer.buyerName} ({buyer.buyerCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quote History Cards */}
      <div className="space-y-3">
        {sortedQuotes.map((quote: Quote) => {
          const quoteRugs = getQuoteRugs(quote.rugIds);
          const isExpanded = expandedQuotes.has(quote.id);
          const isEditing = editingQuote === quote.id;
          
          return (
            <div key={quote.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Collapsed Quote Summary */}
              <div 
                className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleQuoteExpansion(quote.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{quote.quoteName}</div>
                        <div className="text-xs text-gray-500">{quote.clientName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={quote.status === 'draft' ? 'secondary' : 'default'} className="text-xs">
                          {quote.status}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">
                        {quote.rugIds.length} product{quote.rugIds.length !== 1 ? 's' : ''}
                      </span>
                      <span className="font-medium text-gray-900">
                        ₹{parseFloat(quote.totalAmount).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between sm:w-full">
                    <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                      {/* Quote Name & Creator */}
                      <div>
                        <div className="font-medium text-gray-900">{quote.quoteName}</div>
                        <div className="text-sm text-gray-500">by {quote.createdBy}</div>
                      </div>
                      
                      {/* Client/Buyer */}
                      <div>
                        <div className="text-sm text-gray-900">{quote.clientName}</div>
                        {quote.buyerName && (
                          <div className="text-sm text-gray-500">{quote.buyerName}</div>
                        )}
                      </div>
                      
                      {/* Products Count */}
                      <div>
                        <div className="text-sm text-gray-900">
                          {quote.rugIds.length} product{quote.rugIds.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quoteRugs.slice(0, 2).map(rug => rug.designName).join(', ')}
                          {quoteRugs.length > 2 && ` +${quoteRugs.length - 2} more`}
                        </div>
                      </div>
                      
                      {/* Total Amount */}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          ₹{parseFloat(quote.totalAmount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">{quote.unitType}</div>
                      </div>
                      
                      {/* Status & Date */}
                      <div>
                        <Badge variant={quote.status === 'draft' ? 'secondary' : 'default'}>
                          {quote.status}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDate(quote.createdAt)}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportQuote(quote);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Expand/Collapse Icon */}
                    <div className="ml-4">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expanded Quote Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
                  {/* Products List with Individual Quote Amounts */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Products ({quote.rugIds.length})</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {quoteRugs.map((rug, index) => (
                        <div key={index} className="border rounded-md p-2 sm:p-3 bg-white">
                          {/* Mobile Layout */}
                          <div className="sm:hidden space-y-2">
                            <div className="font-medium text-gray-900 text-sm">{rug.designName}</div>
                            <div className="text-xs text-gray-600">
                              {rug.construction} • {rug.color} • {rug.size}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">Calculated Cost</span>
                              <span className="font-medium text-gray-900 text-sm">
                                {quote.currency === 'USD' ? '$' : '₹'}{rug.finalCostPSM ? (parseFloat(rug.finalCostPSM.toString())).toFixed(0) : '0'}
                              </span>
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden sm:grid sm:grid-cols-4 sm:gap-4 sm:items-center">
                            {/* Product Details */}
                            <div className="col-span-2">
                              <div className="font-medium text-gray-900">{rug.designName}</div>
                              <div className="text-sm text-gray-600">
                                {rug.construction} • {rug.quality}
                              </div>
                              <div className="text-sm text-gray-600">
                                {rug.color} • {rug.size}
                              </div>
                            </div>
                            
                            {/* Calculated Cost */}
                            <div>
                              <div className="text-sm text-gray-500">Calculated Cost</div>
                              <div className="font-medium text-gray-900">
                                {quote.currency === 'USD' ? '$' : '₹'}{rug.finalCostPSM ? (parseFloat(rug.finalCostPSM.toString())).toFixed(2) : '0.00'}
                              </div>
                              <div className="text-xs text-gray-500">{quote.unitType}</div>
                              <div className="text-xs text-gray-400 mt-1 space-y-1">
                                <div>Material: {quote.currency === 'USD' ? '$' : '₹'}{(rug.totalMaterialCost || 0).toFixed(2)}</div>
                                <div>Process: {quote.currency === 'USD' ? '$' : '₹'}{((rug.weavingCost || 0) + (rug.finishingCost || 0) + (rug.packingCost || 0)).toFixed(2)}</div>
                                <div>OH: {quote.overheadPercentage}%</div>
                              </div>
                            </div>
                            
                            {/* Actual Quote Amount Input */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Actual Quote Amount
                              </label>
                              <div className="flex space-x-2">
                                <Input
                                  type="number"
                                  placeholder="Enter amount"
                                  value={getProductQuoteAmount(quote.id, rug.id.toString())}
                                  onChange={(e) => updateProductQuoteAmount(quote.id, rug.id.toString(), e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => saveProductQuoteAmount(quote.id, rug.id.toString())}
                                  disabled={!getProductQuoteAmount(quote.id, rug.id.toString()).trim()}
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              {/* Live Profit Calculation */}
                              {getProductQuoteAmount(quote.id, rug.id.toString()) && (
                                <div className="mt-2 text-xs">
                                  {(() => {
                                    const calculatedCost = rug.finalCostPSM ? parseFloat(rug.finalCostPSM.toString()) : 0;
                                    const { profitAmount, profitPercentage } = calculateProductProfit(
                                      calculatedCost, 
                                      getProductQuoteAmount(quote.id, rug.id.toString())
                                    );
                                    
                                    return (
                                      <div className={`p-2 rounded ${profitAmount >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        <div>Profit: {quote.currency === 'USD' ? '$' : '₹'}{profitAmount.toFixed(2)} ({profitPercentage.toFixed(1)}%)</div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  

                  
                  {/* Notes Section */}
                  {quote.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">{quote.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredQuotes.length === 0 && quotes.length > 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-4xl text-gray-300 mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Quotes</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Quote Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected quote.
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Quote Information</h4>
                  <div className="space-y-2 mt-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedQuote.quoteName}</div>
                    <div><span className="font-medium">Client:</span> {selectedQuote.clientName}</div>
                    {selectedQuote.buyerName && (
                      <div><span className="font-medium">Buyer:</span> {selectedQuote.buyerName}</div>
                    )}
                    <div><span className="font-medium">Status:</span> <Badge variant="secondary">{selectedQuote.status}</Badge></div>
                    <div><span className="font-medium">Created:</span> {new Date(selectedQuote.createdAt).toLocaleDateString()}</div>
                    <div><span className="font-medium">Created By:</span> {selectedQuote.createdBy}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Pricing Details</h4>
                  <div className="space-y-2 mt-2 text-sm">
                    <div><span className="font-medium">Total Amount:</span> ₹{parseFloat(selectedQuote.totalAmount).toFixed(2)}</div>
                    <div><span className="font-medium">Currency:</span> {selectedQuote.currency}</div>
                    <div><span className="font-medium">Unit Type:</span> {selectedQuote.unitType}</div>
                    <div><span className="font-medium">Overhead:</span> {selectedQuote.overheadPercentage}%</div>
                    <div><span className="font-medium">Profit:</span> {selectedQuote.profitPercentage}%</div>
                    {selectedQuote.currency === 'USD' && (
                      <div><span className="font-medium">USD Rate:</span> ₹{selectedQuote.usdRate}</div>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedQuote.notes && (
                <div>
                  <h4 className="font-medium text-gray-900">Notes</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedQuote.notes}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900">Products ({selectedQuote.rugIds.length})</h4>
                <div className="mt-2 space-y-2">
                  {getQuoteRugs(selectedQuote.rugIds).map((rug, index) => (
                    <div key={index} className="border rounded-md p-3 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">{rug.designName}</div>
                          <div className="text-gray-600">Construction: {rug.construction}</div>
                          <div className="text-gray-600">Quality: {rug.quality}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Color: {rug.color}</div>
                          <div className="text-gray-600">Size: {rug.size}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuoteHistory;