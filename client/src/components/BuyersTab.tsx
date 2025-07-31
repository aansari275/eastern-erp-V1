import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Search, Plus, Edit, Trash2, Users, Mail, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";

interface Buyer {
  id: number;
  buyerName: string;
  buyerCode: string;
  merchantName: string;
  merchantEmail: string;
  contractFiles?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const BuyersTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
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
    mutationFn: async (buyerData: any) => {
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
    mutationFn: async ({ id, buyerData }: { id: number; buyerData: any }) => {
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
    mutationFn: async (id: number) => {
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

  const filteredBuyers = buyers.filter((buyer: Buyer) =>
    buyer.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.buyerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.merchantEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleEdit = (buyer: Buyer) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBuyer) {
      updateBuyerMutation.mutate({ id: editingBuyer.id, buyerData: formData });
    } else {
      createBuyerMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this buyer?')) {
      deleteBuyerMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error loading buyers</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search buyers by name, code, merchant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setEditingBuyer(null);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Buyer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Buyer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="buyerName">Buyer Name *</Label>
                <Input
                  id="buyerName"
                  value={formData.buyerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                  placeholder="e.g., European Luxury Imports"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="buyerCode">Buyer Code *</Label>
                <Input
                  id="buyerCode"
                  value={formData.buyerCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyerCode: e.target.value }))}
                  placeholder="e.g., ELI-001"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="merchantName">Merchant Name *</Label>
                <Input
                  id="merchantName"
                  value={formData.merchantName}
                  onChange={(e) => setFormData(prev => ({ ...prev, merchantName: e.target.value }))}
                  placeholder="e.g., Sarah Johnson"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="merchantEmail">Merchant Email *</Label>
                <Input
                  id="merchantEmail"
                  type="email"
                  value={formData.merchantEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, merchantEmail: e.target.value }))}
                  placeholder="e.g., sarah.johnson@company.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contractFiles">Buyer Contracts/Agreements</Label>
                <Input
                  id="contractFiles"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData(prev => ({ ...prev, contractFiles: file.name }));
                    }
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.contractFiles && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {formData.contractFiles}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBuyerMutation.isPending}>
                  {createBuyerMutation.isPending ? 'Creating...' : 'Create Buyer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredBuyers.length} of {buyers.length} buyers
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            Active: {buyers.filter((b: Buyer) => b.isActive).length}
          </Badge>
          <Badge variant="outline">
            Inactive: {buyers.filter((b: Buyer) => !b.isActive).length}
          </Badge>
        </div>
      </div>

      {/* Buyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuyers.map((buyer: Buyer) => (
          <Card key={buyer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium line-clamp-1">
                  {buyer.buyerName}
                </CardTitle>
                <Badge variant={buyer.isActive ? "default" : "secondary"}>
                  {buyer.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="text-sm font-mono text-blue-600">
                {buyer.buyerCode}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Merchant:</span>
                  <span>{buyer.merchantName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Email:</span>
                  <span className="truncate">{buyer.merchantEmail}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Created:</span>
                  <span>{formatDate(buyer.createdAt)}</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(buyer)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Buyer - {buyer.buyerName}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="editBuyerName">Buyer Name *</Label>
                        <Input
                          id="editBuyerName"
                          value={formData.buyerName}
                          onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="editBuyerCode">Buyer Code *</Label>
                        <Input
                          id="editBuyerCode"
                          value={formData.buyerCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, buyerCode: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="editMerchantName">Merchant Name *</Label>
                        <Input
                          id="editMerchantName"
                          value={formData.merchantName}
                          onChange={(e) => setFormData(prev => ({ ...prev, merchantName: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="editMerchantEmail">Merchant Email *</Label>
                        <Input
                          id="editMerchantEmail"
                          type="email"
                          value={formData.merchantEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, merchantEmail: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="editContractFiles">Buyer Contracts/Agreements</Label>
                        <Input
                          id="editContractFiles"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData(prev => ({ ...prev, contractFiles: file.name }));
                            }
                          }}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {formData.contractFiles && (
                          <p className="text-sm text-gray-600 mt-1">Current: {formData.contractFiles}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="editIsActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <Label htmlFor="editIsActive">Active</Label>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setEditingBuyer(null)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updateBuyerMutation.isPending}>
                          {updateBuyerMutation.isPending ? 'Updating...' : 'Update Buyer'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDelete(buyer.id)}
                  disabled={deleteBuyerMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBuyers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No buyers found matching your search.' : 'No buyers created yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BuyersTab;