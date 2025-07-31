import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, Package, Calendar, Eye, ExternalLink } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface OPSOrder {
  boId: number;
  opsNo: string;
  buyerCode: string;
  buyerName: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  currency: string;
  orderType: string;
  incharge: string;
  orderedPieces: number;
  totalArea: number;
  itemCount: number;
  totalOrderedQty: number;
  totalIssuedQty: number;
  totalBazarQty: number;
  totalSaleQty: number;
  isDelayed: boolean;
  daysDelayed: number;
}

interface OPSOrderDetail {
  boId: number;
  opsNo: string;
  buyerCode: string;
  buyerName: string;
  quality: string;
  design: string;
  colour: string;
  size: string;
  orderedQty: number;
  issuedQty: number;
  bazarQty: number;
  saleQty: number;
  itemArea: number;
  orderDate: string;
  deliveryDate: string;
  orderType: string;
  incharge: string;
}

interface OrdersManagementProps {
  startDate?: string;
  endDate?: string;
}

const OrdersManagement: React.FC<OrdersManagementProps> = ({ startDate, endDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'delayed' | 'on-track' | 'completed'>('all');
  const [buyerFilter, setBuyerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'delivery-date' | 'delay-days' | 'ops-no' | 'buyer'>('delivery-date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedOrder, setSelectedOrder] = useState<OPSOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch OPS orders
  const { data: orders = [], isLoading, error } = useQuery<OPSOrder[]>({
    queryKey: ['/api/ops', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`/api/ops?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch order details when order is selected
  const { data: orderDetails = [], isLoading: detailsLoading } = useQuery<OPSOrderDetail[]>({
    queryKey: ['/api/ops', selectedOrder?.boId, 'details'],
    enabled: !!selectedOrder?.boId,
    staleTime: 0,
    gcTime: 0, // Updated from cacheTime to gcTime for React Query v5
  });

  // Get unique buyers for filter dropdown
  const uniqueBuyers = React.useMemo(() => {
    const buyers = orders.map(order => ({ code: order.buyerCode, name: order.buyerName }));
    const uniqueList = buyers.filter((buyer, index, self) => 
      index === self.findIndex(b => b.code === buyer.code)
    );
    return uniqueList.sort((a, b) => a.name.localeCompare(b.name));
  }, [orders]);

  // Apply filters and sorting
  const filteredAndSortedOrders = React.useMemo(() => {
    const filtered = orders.filter(order => {
      const matchesSearch = 
        order.opsNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'delayed' && order.isDelayed) ||
        (statusFilter === 'on-track' && !order.isDelayed && order.totalSaleQty < order.totalOrderedQty) ||
        (statusFilter === 'completed' && order.totalSaleQty >= order.totalOrderedQty);

      const matchesBuyer = 
        buyerFilter === 'all' || order.buyerCode === buyerFilter;

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
    if (!filteredAndSortedOrders || filteredAndSortedOrders.length === 0) return null;
    
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
  const calculateDetailMetrics = (details: OPSOrderDetail[]) => {
    if (!details || details.length === 0) return null;
    
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

  const handleViewDetails = (order: OPSOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading orders: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-gray-600">Track OPS manufacturing workflow from order to shipping</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {filteredOrders.length} Orders
        </Badge>
      </div>

      {/* Manufacturing Workflow Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.totalOrders}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">🔴 Delayed Orders</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.delayedOrders}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">!</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">🟢 Completed Orders</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.completedOrders}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Delay Days</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.avgDelayDays}</p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">📅</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pieces</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.totalPieces.toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">P</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                  <p className="text-2xl font-bold text-teal-600">{metrics.onTimeRate}%</p>
                </div>
                <div className="h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-sm">%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="delayed">🔴 Delayed Orders</option>
              <option value="on-track">🟡 In Progress</option>
              <option value="completed">🟢 Completed</option>
            </select>

            <select
              value={buyerFilter}
              onChange={(e) => setBuyerFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Buyers</option>
              {uniqueBuyers.map(buyer => (
                <option key={buyer.code} value={buyer.code}>
                  {buyer.name} ({buyer.code})
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="delivery-date">Sort by Delivery Date</option>
              <option value="delay-days">Sort by Delay Days</option>
              <option value="ops-no">Sort by OPS No</option>
              <option value="buyer">Sort by Buyer</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            OPS Orders Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No orders match your search criteria' : 'No orders found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>OPS No</TableHead>
                    <TableHead>Buyer Details</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Days Delayed</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const progressPercentage = order.totalOrderedQty > 0 ? Math.round((order.totalSaleQty / order.totalOrderedQty) * 100) : 0;
                    const isCompleted = progressPercentage >= 100;
                    
                    return (
                      <TableRow key={order.boId} className={order.isDelayed && !isCompleted ? 'bg-red-50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {order.isDelayed && !isCompleted ? (
                              <span className="text-red-600 font-bold">🔴 DELAYED</span>
                            ) : isCompleted ? (
                              <span className="text-green-600 font-bold">🟢 COMPLETED</span>
                            ) : (
                              <span className="text-yellow-600 font-bold">🟡 IN PROGRESS</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-medium text-blue-600">
                          {order.opsNo}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.buyerName}</div>
                            <div className="text-sm text-gray-600">Code: {order.buyerCode}</div>
                            <div className="text-xs text-gray-500">In-charge: {order.incharge}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(order.orderDate)}
                          </div>
                        </TableCell>
                        <TableCell className={order.isDelayed ? 'text-red-600 font-medium' : ''}>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(order.deliveryDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.isDelayed && !isCompleted ? (
                            <Badge variant="destructive" className="text-xs">
                              {order.daysDelayed} days
                            </Badge>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{order.totalSaleQty}/{order.totalOrderedQty}</span>
                              <span>{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isCompleted ? 'bg-green-500' : 
                                  order.isDelayed ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.orderedPieces} pcs • {order.totalArea} sqm
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(order)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Order Details - OPS {selectedOrder?.opsNo}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Internal OPS No</p>
                    <p className="font-mono font-medium text-blue-600">{selectedOrder.opsNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">BO ID</p>
                    <p className="font-mono font-medium">{selectedOrder.boId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Buyer</p>
                    <p className="font-medium">{selectedOrder.buyerName}</p>
                    <p className="text-sm text-gray-600">Code: {selectedOrder.buyerCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Type</p>
                    <p className="font-medium text-purple-600">{selectedOrder.orderType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">In-charge</p>
                    <p className="font-medium">{selectedOrder.incharge}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Pieces</p>
                    <p className="font-medium">{selectedOrder.orderedPieces} pcs</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Area</p>
                    <p className="font-medium">{selectedOrder.totalArea} sqm</p>
                  </div>
                  {selectedOrder.totalAmount > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Expected Value</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manufacturing Workflow Progress */}
              {detailMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Manufacturing Workflow Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Ordered Qty</p>
                        <p className="text-2xl font-bold text-blue-600">{detailMetrics.totalOrdered}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Issued for Weaving</p>
                        <p className="text-2xl font-bold text-green-600">{detailMetrics.totalIssued}</p>
                        <p className="text-xs text-gray-500">{detailMetrics.weavingProgress}% of ordered</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Post-Weaving Qty</p>
                        <p className="text-2xl font-bold text-orange-600">{detailMetrics.totalBazar}</p>
                        <p className="text-xs text-gray-500">{detailMetrics.inspectionProgress}% of issued</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Shipped Qty</p>
                        <p className="text-2xl font-bold text-purple-600">{detailMetrics.totalShipped}</p>
                        <p className="text-xs text-gray-500">{detailMetrics.overallProgress}% complete</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Overall Progress: {detailMetrics.overallProgress}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${detailMetrics.overallProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Order</span>
                        <span>Weaving</span>
                        <span>Inspection</span>
                        <span>Shipping</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items Detail</CardTitle>
                </CardHeader>
                <CardContent>
                  {detailsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Loading items...</p>
                    </div>
                  ) : orderDetails.length === 0 ? (
                    <p className="text-center text-gray-600 py-4">No items found for this order</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Quality</TableHead>
                            <TableHead>Design</TableHead>
                            <TableHead>Colour</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Ordered Qty</TableHead>
                            <TableHead>Issued Qty</TableHead>
                            <TableHead>Bazar Qty</TableHead>
                            <TableHead>Sale Qty</TableHead>
                            <TableHead>Area</TableHead>
                            <TableHead>Delivery Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderDetails.map((item, index) => (
                            <TableRow key={`${item.boId}-${item.design}-${item.colour}-${index}`}>
                              <TableCell className="font-medium">{item.quality}</TableCell>
                              <TableCell className="font-medium text-blue-600">{item.design}</TableCell>
                              <TableCell>{item.colour}</TableCell>
                              <TableCell className="font-mono text-sm">{item.size}</TableCell>
                              <TableCell className="text-right font-medium">{item.orderedQty.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-green-600">{item.issuedQty.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-orange-600">{item.bazarQty.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-purple-600">{item.saleQty.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{item.itemArea} sqm</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {formatDate(item.deliveryDate)}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;