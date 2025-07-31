import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Edit, Trash2, Building2, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<BuyerProfile | null>(null);
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

  const openEditDialog = (buyer: BuyerProfile) => {
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
    } else {
      createBuyerMutation.mutate(formData);
    }
  };

  // Filter buyers based on search term and user role
  const filteredBuyers = Array.isArray(buyers) ? buyers.filter((buyer: BuyerProfile) => {
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
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading buyers: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buyer Management</h1>
          <p className="text-gray-600 mt-1">Manage buyer profiles and account details</p>
        </div>
        
        {/* User Role Toggle */}
        <div className="flex space-x-2">
          <Button
            variant={currentUser.role === 'merchandising_manager' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentUser({ ...currentUser, role: 'merchandising_manager' })}
          >
            Manager View
          </Button>
          <Button
            variant={currentUser.role === 'merchant' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentUser({ ...currentUser, role: 'merchant', email: 'israr@easternmills.com' })}
          >
            Merchant View
          </Button>
        </div>
      </div>

      {/* Search and Add Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search buyers by name, code, or merchant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {filteredBuyers.length} of {buyers.length} buyers
          </div>
          
          {(currentUser.role === 'merchandising_manager') && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Buyer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBuyer ? 'Edit Buyer' : 'Add New Buyer'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Buyer Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter buyer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Buyer Code</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        placeholder="e.g., A-01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="merchantId">Assigned Merchant</Label>
                      <Select 
                        value={formData.merchantId} 
                        onValueChange={(value) => setFormData({...formData, merchantId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select merchant" />
                        </SelectTrigger>
                        <SelectContent>
                          {merchants.map((merchant) => (
                            <SelectItem key={merchant} value={merchant}>
                              {merchant}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select 
                        value={formData.currency} 
                        onValueChange={(value) => setFormData({...formData, currency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reference">Reference</Label>
                      <Input
                        id="reference"
                        value={formData.reference}
                        onChange={(e) => setFormData({...formData, reference: e.target.value})}
                        placeholder="Internal reference"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentTerms">Payment Terms</Label>
                      <Input
                        id="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                        placeholder="e.g., Net 30"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shipmentMethod">Shipment Method</Label>
                    <Input
                      id="shipmentMethod"
                      value={formData.shipmentMethod}
                      onChange={(e) => setFormData({...formData, shipmentMethod: e.target.value})}
                      placeholder="e.g., Sea Freight, Air Cargo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryAddress">Delivery Address</Label>
                    <Textarea
                      id="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                      placeholder="Complete delivery address"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="invoiceAddress">Invoice Address</Label>
                    <Textarea
                      id="invoiceAddress"
                      value={formData.invoiceAddress}
                      onChange={(e) => setFormData({...formData, invoiceAddress: e.target.value})}
                      placeholder="Complete invoice address"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes or special requirements"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={createBuyerMutation.isPending || updateBuyerMutation.isPending}
                    >
                      {editingBuyer ? 'Update' : 'Create'} Buyer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Buyers Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading buyers...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuyers.map((buyer) => (
            <Card key={buyer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-gray-900">{buyer.name}</CardTitle>
                    <p className="text-sm text-blue-600 font-medium">{buyer.code}</p>
                  </div>
                  <div className="flex space-x-1">
                    {(currentUser.role === 'merchandising_manager' || 
                      (currentUser.role === 'merchant' && buyer.merchantId === currentUser.email)) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(buyer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {currentUser.role === 'merchandising_manager' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBuyerMutation.mutate(buyer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{buyer.merchantId}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>{buyer.currency} • {buyer.paymentTerms || 'Terms TBD'}</span>
                  </div>
                </div>
                
                {buyer.notes && (
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    <strong>Notes:</strong> {buyer.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredBuyers.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm ? 'No buyers match your search' : 'No buyers found'}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerManagement;