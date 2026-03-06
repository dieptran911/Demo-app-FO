import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusTracker } from "@/components/StatusTracker";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Download,
  X,
  Save,
  ShoppingCart,
  Calendar as CalendarIcon,
  Loader2,
  Trash2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PurchaseOrder } from '@/types';
import { getPurchaseOrders, createPurchaseOrder, deletePurchaseOrder } from '@/services/purchaseOrders';
import { fetchInventoryItems, InventoryItem } from '@/services/inventory';

interface PurchaseOrdersProps {
  pageAction?: { type: string; payload?: any } | null;
  onActionHandled?: () => void;
  userRole?: 'employee' | 'manager';
}

interface SelectedItem {
  item: InventoryItem;
  quantity: number;
}

export function PurchaseOrders({ pageAction, onActionHandled, userRole }: PurchaseOrdersProps) {
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Inventory State for Creation
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vendor: '',
    date: '',
    notes: ''
  });
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const fetchPOs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPurchaseOrders();
      setPos(data);
    } catch (error) {
      console.error("Failed to fetch purchase orders", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  useEffect(() => {
    if (isCreating) {
      const loadInventory = async () => {
        setIsInventoryLoading(true);
        try {
          const items = await fetchInventoryItems();
          setInventoryItems(items);
        } catch (error) {
          console.error("Failed to load inventory items", error);
        } finally {
          setIsInventoryLoading(false);
        }
      };
      loadInventory();
    }
  }, [isCreating]);

  useEffect(() => {
    if (pageAction?.type === 'create') {
      setIsCreating(true);
      if (onActionHandled) {
        onActionHandled();
      }
    }
  }, [pageAction, onActionHandled]);

  const activePO = pos.find(p => p.id === selectedPO);

  const handleAddItem = (item: InventoryItem) => {
    if (selectedItems.some(i => i.item.id === item.id)) return;
    setSelectedItems([...selectedItems, { item, quantity: 1 }]);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(i => i.item.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedItems(selectedItems.map(i => 
      i.item.id === itemId ? { ...i, quantity } : i
    ));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const totalAmount = selectedItems.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
    const totalItems = selectedItems.reduce((sum, i) => sum + i.quantity, 0);

    // Generate ID based on max existing ID to avoid collisions
    const maxId = pos.reduce((max, p) => {
      const parts = p.id.split('-');
      const num = parseInt(parts[2] || '0');
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextId = maxId + 1;

    const newPO: PurchaseOrder = {
      id: `PO-2024-${String(nextId).padStart(3, '0')}`,
      vendor: formData.vendor || "New Vendor",
      date: formData.date || new Date().toISOString().split('T')[0],
      amount: `$${totalAmount.toFixed(2)}`,
      status: "Pending",
      items: totalItems,
      progress: [
        { id: '1', label: 'Created', status: 'current', date: 'Just now' },
        { id: '2', label: 'Approved', status: 'upcoming' },
        { id: '3', label: 'Ordered', status: 'upcoming' },
        { id: '4', label: 'Received', status: 'upcoming' },
      ],
      itemsList: selectedItems.map(i => ({
        name: i.item.name,
        quantity: i.quantity,
        price: `$${i.item.price.toFixed(2)}`
      })),
      notes: formData.notes
    };

    try {
      const createdPO = await createPurchaseOrder(newPO);
      if (createdPO) {
        setPos([createdPO, ...pos]);
        setIsCreating(false);
        setSelectedPO(createdPO.id);
        setFormData({ vendor: '', date: '', notes: '' });
        setSelectedItems([]);
      }
    } catch (error) {
      console.error("Failed to create purchase order", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const success = await deletePurchaseOrder(id);
        if (success) {
          setPos(pos.filter(p => p.id !== id));
          if (selectedPO === id) setSelectedPO(null);
        }
      } catch (error) {
        console.error("Failed to delete purchase order", error);
      }
    }
  };

  // Filter Logic
  const filteredPOs = pos.filter(po => {
    const matchesSearch = 
      po.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(po.status);
    
    const matchesDate = 
      (!dateRange.start || po.date >= dateRange.start) &&
      (!dateRange.end || po.date <= dateRange.end);
      
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (isCreating) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Create Purchase Order</h1>
          <Button variant="ghost" onClick={() => setIsCreating(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Vendor</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-slate-200 rounded-md" 
                    placeholder="Select vendor" 
                    value={formData.vendor}
                    onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Expected Date</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border border-slate-200 rounded-md" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Items</label>
                
                {/* Selected Items List */}
                {selectedItems.length > 0 && (
                  <div className="border border-slate-200 rounded-md overflow-hidden mb-4">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-slate-500">Item</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-500 w-20">Qty</th>
                          <th className="px-3 py-2 text-right font-medium text-slate-500">Price</th>
                          <th className="px-3 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedItems.map((item) => (
                          <tr key={item.item.id}>
                            <td className="px-3 py-2">{item.item.name}</td>
                            <td className="px-3 py-2">
                              <input 
                                type="number" 
                                min="1"
                                className="w-16 p-1 border border-slate-200 rounded text-center"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.item.id, parseInt(e.target.value) || 1)}
                              />
                            </td>
                            <td className="px-3 py-2 text-right">${(item.item.price * item.quantity).toFixed(2)}</td>
                            <td className="px-3 py-2 text-center">
                              <button 
                                type="button"
                                onClick={() => handleRemoveItem(item.item.id)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-medium">
                          <td className="px-3 py-2 text-right" colSpan={2}>Total:</td>
                          <td className="px-3 py-2 text-right">
                            ${selectedItems.reduce((sum, i) => sum + (i.item.price * i.quantity), 0).toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Inventory Selection */}
                <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                  <p className="text-xs font-medium text-slate-500 mb-2 uppercase">Add Items from Inventory</p>
                  {isInventoryLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  ) : inventoryItems.length === 0 ? (
                    <p className="text-sm text-slate-500 italic text-center py-2">No inventory items available.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {inventoryItems.map((item) => {
                        const isSelected = selectedItems.some(i => i.item.id === item.id);
                        return (
                          <div 
                            key={item.id} 
                            className={`flex items-center justify-between p-2 rounded border ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}
                          >
                            <div className="truncate mr-2">
                              <div className="text-sm font-medium truncate" title={item.name}>{item.name}</div>
                              <div className="text-xs text-slate-500">${item.price.toFixed(2)}</div>
                            </div>
                            <Button 
                              type="button" 
                              size="sm" 
                              variant={isSelected ? "secondary" : "outline"}
                              className="h-7 text-xs"
                              disabled={isSelected}
                              onClick={() => handleAddItem(item)}
                            >
                              {isSelected ? 'Added' : 'Add'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <textarea 
                  className="w-full p-2 border border-slate-200 rounded-md h-24" 
                  placeholder="Add notes..." 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Create Order
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Purchase Orders</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create PO
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new purchase order</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search POs..." 
              className="w-full pl-9 pr-4 py-2 text-sm border-none focus:ring-0 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 border-dashed text-slate-500 hover:text-slate-900">
                  <Filter className="w-4 h-4 mr-2" />
                  Status
                  {statusFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal text-xs">
                      {statusFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['Pending', 'Processing', 'Completed'].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setStatusFilter([...statusFilter, status]);
                      } else {
                        setStatusFilter(statusFilter.filter((s) => s !== status));
                      }
                    }}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
                {statusFilter.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setStatusFilter([])}
                      className="justify-center text-center"
                    >
                      Clear filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Date Range Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 border-dashed text-slate-500 hover:text-slate-900">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Date
                  {(dateRange.start || dateRange.end) && (
                    <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal text-xs">
                      •
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-auto p-4" align="end">
                <div className="flex flex-col space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Start Date</label>
                    <input
                      type="date"
                      className="w-full border rounded p-1 text-sm"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">End Date</label>
                    <input
                      type="date"
                      className="w-full border rounded p-1 text-sm"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                  {(dateRange.start || dateRange.end) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 mt-2"
                      onClick={() => setDateRange({ start: '', end: '' })}
                    >
                      Clear Dates
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : filteredPOs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No orders found matching your filters.
            </div>
          ) : (
            filteredPOs.map((po) => (
              <Card 
                key={po.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${selectedPO === po.id ? 'ring-2 ring-indigo-600' : ''}`}
                onClick={() => setSelectedPO(po.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{po.vendor}</h3>
                        <p className="text-sm text-slate-500">{po.id} • {po.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        po.status === "Completed" ? "success" : 
                        po.status === "Processing" ? "info" : "warning"
                      }>
                        {po.status}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => handleDelete(e, po.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-slate-500">
                      <span className="font-medium text-slate-900">{po.items}</span> items
                    </div>
                    <div className="font-bold text-slate-900">{po.amount}</div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-1">
          {activePO ? (
            <Card className="h-full sticky top-6">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>{activePO.id}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedPO(null)} aria-label="Close details">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-slate-500">{activePO.vendor}</p>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-4">Order Status</h4>
                  {/* @ts-ignore */}
                  <StatusTracker steps={activePO.progress} />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-medium text-slate-900">Items Purchased</h4>
                  {/* @ts-ignore */}
                  {activePO.itemsList && activePO.itemsList.length > 0 ? (
                    <div className="space-y-3">
                      {/* @ts-ignore */}
                      {activePO.itemsList.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <div>
                            <span className="font-medium text-slate-700">{item.name}</span>
                            <div className="text-slate-500 text-xs">Qty: {item.quantity}</div>
                          </div>
                          <span className="text-slate-900">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No items listed.</p>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-medium text-slate-900">Notes</h4>
                  {/* @ts-ignore */}
                  <p className="text-sm text-slate-600">{activePO.notes || "No notes available."}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Order Date</span>
                    <span className="font-medium">{activePO.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Amount</span>
                    <span className="font-bold text-lg">{activePO.amount}</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View full order details</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download order PDF</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
              Select an order to view details
            </div>
          )}
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
