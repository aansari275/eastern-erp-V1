import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Edit, Trash2, Building2, Users, Database } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';



        {articleNumbers.map((article: any, index: number) => (
          <div key={index} className="grid grid-cols-4 gap-2 text-xs bg-gray-50 p-2 rounded">
            <div className="truncate">
              <span className="font-medium text-gray-600">Design:</span>
              <div className="text-gray-800">{article.designName || 'N/A'}</div>
            </div>
            <div className="truncate">
              <span className="font-medium text-gray-600">Size:</span>
              <div className="text-gray-800">{article.size || 'N/A'}</div>
            </div>
            <div className="truncate">
              <span className="font-medium text-gray-600">Color:</span>
              <div className="text-gray-800">{article.color || 'N/A'}</div>
            </div>
            <div className="truncate">
              <span className="font-medium text-gray-600">Article #:</span>
              <input 
                type="text" 
                placeholder="Enter code" 
                className="w-full text-xs border rounded px-1 py-0.5 bg-white"
                defaultValue={article.buyerArticleNumber || ''}
              />
            </div>
          </div>
        ))}
        {articleNumbers.length >= 5 && (
          <div className="text-xs text-gray-500 text-center py-1">
            Showing first 5 entries. Click "Articles" button to view all.
          </div>
        )}
      </div>
    </div>
  );
};

import { useToast } from '../hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface BuyerProfile {
  id: number;
  name: string;
  code: string;
  merchantId: string;
  reference: string;
  currency: string;
  paymentTerms: string;
  deliveryAddress: string;
  invoiceAddress: string;
  shipmentMethod: string;
  articleNumbers: string[];
  notes: string;
  isActive: boolean;
}

const BuyerManagement: React.FC = () => {
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
      if (!response.ok) throw new Error('Failed to fetch buyer articles');
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
    mutationFn: async (buyerData: any) => {
      const response = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buyerData)
      });
      if (!response.ok) throw new Error('Failed to create buyer');
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
    mutationFn: async ({ id, ...buyerData }: any) => {
      const response = await fetch(`/api/buyers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buyerData)
      });
      if (!response.ok) throw new Error('Failed to update buyer');
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
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/buyers/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete buyer');
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
    if (!buyers || !Array.isArray(buyers)) return [];
    
    if (currentUser.role === 'merchandising_manager') {
      return buyers; // Managers see all buyers
    } else {
      return buyers.filter(buyer => buyer.merchantId === currentUser.email);
    }
  };

  const visibleBuyers = getVisibleBuyers();

  const [editingBuyer, setEditingBuyer] = useState<BuyerProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [formData, setFormData] = useState<Partial<BuyerProfile>>({
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

  const handleEdit = (buyer: BuyerProfile) => {
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
    } else {
      // Create new buyer
      createBuyerMutation.mutate(formData);
    }
  };

  const handleDelete = (buyerId: number) => {
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
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
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

  const updateArticleNumber = (index: number, value: string) => {
    const articleNumbers = [...(formData.articleNumbers || [])];
    articleNumbers[index] = value;
    setFormData({
      ...formData,
      articleNumbers
    });
  };

  const removeArticleNumber = (index: number) => {
    const articleNumbers = formData.articleNumbers?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      articleNumbers
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Buyer Management</h2>
        </div>
        <div className="text-center py-8">
          <p>Loading buyers...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Buyer Management</h2>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Error loading buyers: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Buyer Management</h2>
          <p className="text-gray-600">Manage buyer profiles and their standard order details ({buyers?.length || 0} buyers)</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* User Role Switcher for Demo */}
          <div className="flex items-center space-x-2">
            <Label className="text-sm">Demo User:</Label>
            <select
              value={currentUser.email}
              onChange={(e) => {
                const email = e.target.value;
                setCurrentUser({
                  email,
                  role: email === 'manager@easternmills.com' ? 'merchandising_manager' : 'merchant'
                });
              }}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="manager@easternmills.com">Manager (sees all)</option>
              <option value="israr@easternmills.com">Israr (merchant)</option>
              <option value="zahid@easternmills.com">Zahid (merchant)</option>
              <option value="ashfer@easternmills.com">Ashfer (merchant)</option>
              <option value="anas.mahboob@easternmills.com">Anas (merchant)</option>
            </select>
          </div>
          {currentUser.role === 'merchandising_manager' && (
            <div className="flex space-x-2">
              <Button 
                onClick={handleImportArticles}
                disabled={isImporting}
                variant="outline"
              >
                <Database className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import from ERP'}
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Buyer
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Current User:</strong> {currentUser.email} ({currentUser.role === 'merchandising_manager' ? 'Merchandising Manager' : 'Merchant'})
        </p>
        <p className="text-sm text-blue-600">
          {currentUser.role === 'merchandising_manager' 
            ? `Viewing all ${buyers?.length || 0} buyers` 
            : `Viewing ${visibleBuyers?.length || 0} assigned buyers`}
        </p>
      </div>

      <div className="space-y-3">
        {visibleBuyers?.map((buyer) => (
          <Card key={buyer.id} className={`${buyer.isActive ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-400 opacity-60'} transition-all hover:shadow-md`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{buyer.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {buyer.code}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        buyer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {buyer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium text-gray-500">Merchant:</span> {buyer.merchantId}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Currency:</span> {buyer.currency}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Reference:</span> {buyer.reference || 'Not set'}
                      </div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium text-gray-500">Payment Terms:</span> {buyer.paymentTerms || 'Not set'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Shipment:</span> {buyer.shipmentMethod || 'Not set'}
                      </div>
                    </div>
                    
                    {/* Article Numbers Section */}
                    <ArticleNumbersInCard buyerId={buyer.id.toString()} />
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <ArticleNumberDisplay 
                    buyerId={buyer.id.toString()} 
                    buyerCode={buyer.code} 
                    buyerName={buyer.name} 
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(buyer)}
                    title="Edit buyer details"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {currentUser.role === 'merchandising_manager' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(buyer.id)}
                      title="Delete buyer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBuyer ? 'Edit Buyer Profile' : 'Create New Buyer Profile'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Buyer Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Classic Collection, ILVA A/S"
                  />
                </div>
                <div>
                  <Label htmlFor="code">Buyer Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., A-01, B-02, C-03"
                  />
                </div>
                {currentUser.role === 'merchandising_manager' ? (
                  <div>
                    <Label htmlFor="merchantId">Assigned Merchant *</Label>
                    <select
                      id="merchantId"
                      value={formData.merchantId}
                      onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="">Select a merchant</option>
                      {merchants.map(merchant => (
                        <option key={merchant} value={merchant}>{merchant}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="merchantId">Assigned Merchant</Label>
                    <Input
                      id="merchantId"
                      value={formData.merchantId}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Only merchandising managers can assign merchants</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="reference">Reference Contact</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="e.g., Pierre Flodén, LHNI"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="SEK">SEK</option>
                    <option value="DKK">DKK</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Default Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    placeholder="e.g., 45 Days Net + 10 Days local"
                  />
                </div>
                <div>
                  <Label htmlFor="shipmentMethod">Preferred Shipment Method</Label>
                  <Input
                    id="shipmentMethod"
                    value={formData.shipmentMethod}
                    onChange={(e) => setFormData({ ...formData, shipmentMethod: e.target.value })}
                    placeholder="e.g., Sea Freight, Road Transport"
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Default Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    placeholder="Complete delivery address"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceAddress">Invoice Address</Label>
                  <Textarea
                    id="invoiceAddress"
                    value={formData.invoiceAddress}
                    onChange={(e) => setFormData({ ...formData, invoiceAddress: e.target.value })}
                    placeholder="Complete invoice address"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Article Numbers - Note: Now imported from ERP automatically */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold mb-2">Article Numbers / SKUs</h3>
              <p className="text-sm text-blue-700 mb-2">
                📋 Article numbers are now automatically imported from your ERP system. 
                Design names, colors, and sizes are populated from actual order history.
              </p>
              <p className="text-xs text-blue-600">
                To view and manage article numbers for this buyer, save the buyer profile and check the buyer card display.
              </p>
            </div>

            {/* Notes */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special instructions or notes about this buyer"
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="font-medium">
                  Active Buyer
                </Label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingBuyer ? 'Update Buyer' : 'Create Buyer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerManagement;