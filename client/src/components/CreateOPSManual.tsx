import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { FileText, Loader2, CheckCircle, Plus, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface BuyerProfile {
  id: string;
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

interface POData {
  // Buyer Information
  buyerId: string;
  buyerName: string;
  buyerPONo: string;
  orderDate: string;
  deliveryDate: string;
  
  // Addresses
  deliveryAddress: string;
  invoiceAddress: string;
  
  // Order Details
  supplierNumber: string;
  buyerReference: string;
  ourReference: string;
  currency: string;
  paymentTerms: string;
  shipmentMethod: string;
  
  // Items
  items: {
    artNo: string;
    supplierItem: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    notes?: string;
  }[];
  
  // Totals
  totalQty: number;
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  
  // Additional Notes
  orderNotes: string;
  urgentFlag: boolean;
}

const CreateOPSManual: React.FC = () => {
  // Mock current user for filtering
  const [currentUser, setCurrentUser] = useState({
    email: 'manager@easternmills.com', // Change this to test different merchant views
    role: 'merchandising_manager' // or 'merchant'
  });

  // Real buyer profiles from Eastern Mills data (first 10 for demo)
  const [allBuyerProfiles] = useState<BuyerProfile[]>([
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

  const [poData, setPOData] = useState<POData>({
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

  const handleBuyerChange = (buyerId: string) => {
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
    } else {
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

  const handleDataChange = (field: keyof POData, value: any) => {
    setPOData({ ...poData, [field]: value });
    
    // Auto-calculate totals when items change
    if (field === 'items') {
      calculateTotals(value);
    }
  };

  const calculateTotals = (items: POData['items']) => {
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

  const handleItemChange = (index: number, field: string, value: any) => {
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

  const removeItem = (index: number) => {
    if (poData.items.length <= 1) return;
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
      
    } catch (error) {
      console.error('Submit Error:', error);
      toast({
        title: "Creation failed",
        description: "Could not create the OPS. Please try again.",
        variant: "destructive",
      });
    } finally {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New OPS - Manual Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Enter purchase order details manually. All fields marked with * are required.
          </p>
          
          {/* User Role Switcher for Demo */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <strong>Demo User:</strong> {currentUser.email} ({currentUser.role === 'merchandising_manager' ? 'Manager - sees all buyers' : 'Merchant - sees assigned buyers only'})
            </div>
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

          {/* Buyer Information Section */}
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Buyer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="buyerSelect">Select Buyer Profile</Label>
                  <select
                    id="buyerSelect"
                    value={poData.buyerId}
                    onChange={(e) => handleBuyerChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Choose a buyer or enter manually below</option>
                    {buyerProfiles.filter(b => b.isActive).map(buyer => (
                      <option key={buyer.id} value={buyer.id}>
                        {buyer.name} ({buyer.code})
                      </option>
                    ))}
                  </select>
                  {poData.buyerId && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Buyer details automatically filled from profile
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="buyerName">Buyer Name *</Label>
                  <Input
                    id="buyerName"
                    value={poData.buyerName}
                    onChange={(e) => handleDataChange('buyerName', e.target.value)}
                    placeholder="e.g., Classic Collection, ILVA A/S, Nordic Knots Inc"
                  />
                </div>
                <div>
                  <Label htmlFor="buyerPONo">Purchase Order Number *</Label>
                  <Input
                    id="buyerPONo"
                    value={poData.buyerPONo}
                    onChange={(e) => handleDataChange('buyerPONo', e.target.value)}
                    placeholder="e.g., 1262, 1100459771_04597711, PO2559"
                  />
                </div>
                <div>
                  <Label htmlFor="orderDate">Order Date *</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={poData.orderDate}
                    onChange={(e) => handleDataChange('orderDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={poData.deliveryDate}
                    onChange={(e) => handleDataChange('deliveryDate', e.target.value)}
                  />
                </div>
              </div>
              {getSelectedBuyer() && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Buyer Profile Details</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Reference:</strong> {getSelectedBuyer()?.reference}</p>
                    <p><strong>Articles:</strong> {getSelectedBuyer()?.articleNumbers.join(', ')}</p>
                    {getSelectedBuyer()?.notes && (
                      <p><strong>Notes:</strong> {getSelectedBuyer()?.notes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Details Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierNumber">Supplier Number</Label>
                  <Input
                    id="supplierNumber"
                    value={poData.supplierNumber}
                    onChange={(e) => handleDataChange('supplierNumber', e.target.value)}
                    placeholder="e.g., Eastern Mills / 1265, 10069"
                  />
                </div>
                <div>
                  <Label htmlFor="buyerReference">Buyer Reference</Label>
                  <Input
                    id="buyerReference"
                    value={poData.buyerReference}
                    onChange={(e) => handleDataChange('buyerReference', e.target.value)}
                    placeholder="e.g., Pierre Flodén, LHNI, SM Jan 2026"
                  />
                </div>
                <div>
                  <Label htmlFor="ourReference">Our Reference</Label>
                  <Input
                    id="ourReference"
                    value={poData.ourReference}
                    onChange={(e) => handleDataChange('ourReference', e.target.value)}
                    placeholder="e.g., Abdul Rahim Ansari"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={poData.currency}
                    onChange={(e) => handleDataChange('currency', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="SEK">SEK</option>
                    <option value="DKK">DKK</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={poData.paymentTerms}
                    onChange={(e) => handleDataChange('paymentTerms', e.target.value)}
                    placeholder="e.g., 45 Days Net + 10 Days local"
                  />
                </div>
                <div>
                  <Label htmlFor="shipmentMethod">Shipment Method</Label>
                  <Input
                    id="shipmentMethod"
                    value={poData.shipmentMethod}
                    onChange={(e) => handleDataChange('shipmentMethod', e.target.value)}
                    placeholder="e.g., Boat Shipment, Sea Freight"
                  />
                </div>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={poData.deliveryAddress}
                    onChange={(e) => handleDataChange('deliveryAddress', e.target.value)}
                    placeholder="Complete delivery address with contact details"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceAddress">Invoice Address</Label>
                  <Textarea
                    id="invoiceAddress"
                    value={poData.invoiceAddress}
                    onChange={(e) => handleDataChange('invoiceAddress', e.target.value)}
                    placeholder="Complete invoice address (if different from delivery)"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Order Items</h3>
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {poData.items.map((item, index) => (
                  <div key={index} className="border rounded p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Item {index + 1}</span>
                      {poData.items.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeItem(index)}
                          variant="destructive"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`artNo-${index}`}>Article Number</Label>
                        {getSelectedBuyer() && getSelectedBuyer()!.articleNumbers.length > 0 ? (
                          <select
                            id={`artNo-${index}`}
                            value={item.artNo}
                            onChange={(e) => handleItemChange(index, 'artNo', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          >
                            <option value="">Select or enter custom</option>
                            {getSelectedBuyer()!.articleNumbers.map(artNo => (
                              <option key={artNo} value={artNo}>{artNo}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            id={`artNo-${index}`}
                            value={item.artNo}
                            onChange={(e) => handleItemChange(index, 'artNo', e.target.value)}
                            placeholder="e.g., SD104BE, MELA2-BRO-259"
                          />
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`supplierItem-${index}`}>Supplier Item Code</Label>
                        <Input
                          id={`supplierItem-${index}`}
                          value={item.supplierItem}
                          onChange={(e) => handleItemChange(index, 'supplierItem', e.target.value)}
                          placeholder="e.g., EM-25-MA-8741, AB12"
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-1">
                        <Label htmlFor={`description-${index}`}>Description</Label>
                        <Input
                          id={`description-${index}`}
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="e.g., Rug Solid 170x230 Beige"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                        <Input
                          id={`unitPrice-${index}`}
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`totalAmount-${index}`}>Total Amount</Label>
                        <Input
                          id={`totalAmount-${index}`}
                          type="number"
                          step="0.01"
                          value={item.totalAmount}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`notes-${index}`}>Item Notes (Optional)</Label>
                      <Input
                        id={`notes-${index}`}
                        value={item.notes || ''}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        placeholder="e.g., Original order 2 pieces - 5 pieces added 24-4-2025"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Section */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Total Quantity</Label>
                  <div className="text-lg font-medium">{poData.totalQty} pcs</div>
                </div>
                <div>
                  <Label>Subtotal ({poData.currency})</Label>
                  <div className="text-lg font-medium">{poData.totalAmount.toFixed(2)}</div>
                </div>
                <div>
                  <Label>VAT ({poData.currency})</Label>
                  <div className="text-lg font-medium">{poData.vatAmount.toFixed(2)}</div>
                </div>
                <div>
                  <Label>Grand Total ({poData.currency})</Label>
                  <div className="text-xl font-bold text-blue-600">{poData.grandTotal.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orderNotes">Order Notes</Label>
                  <Textarea
                    id="orderNotes"
                    value={poData.orderNotes}
                    onChange={(e) => handleDataChange('orderNotes', e.target.value)}
                    placeholder="Any special instructions or notes about this order"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="urgentFlag"
                    checked={poData.urgentFlag}
                    onChange={(e) => handleDataChange('urgentFlag', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="urgentFlag" className="text-red-600 font-medium">
                    Mark as Urgent Order
                  </Label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={clearForm}
              >
                Clear Form
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create OPS
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOPSManual;