import React, { useState, useEffect } from 'react';
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
  Loader2
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
import { supabase } from '@/lib/supabase';
import { PurchaseOrder } from '@/types';

// Mock Data
const initialPOs: PurchaseOrder[] = [
  { 
    id: "PO-2024-001", 
    vendor: "TechSupplies Inc", 
    date: "2024-03-10", 
    amount: "$5,400.00", 
    status: "Completed",
    items: 12,
    progress: [
      { id: '1', label: 'Created', status: 'completed', date: 'Mar 10' },
      { id: '2', label: 'Approved', status: 'completed', date: 'Mar 11' },
      { id: '3', label: 'Ordered', status: 'completed', date: 'Mar 12' },
      { id: '4', label: 'Received', status: 'completed', date: 'Mar 15' },
    ],
    itemsList: [
      { name: "Dell XPS 15", quantity: 2, price: "$2,000.00" },
      { name: "Dell Monitor 27\"", quantity: 5, price: "$200.00" },
      { name: "Wireless Keyboard", quantity: 5, price: "$80.00" }
    ],
    notes: "Delivered to Building B, Reception."
  },
  { 
    id: "PO-2024-002", 
    vendor: "OfficeDepot", 
    date: "2024-03-12", 
    amount: "$1,250.00", 
    status: "Processing",
    items: 5,
    progress: [
      { id: '1', label: 'Created', status: 'completed', date: 'Mar 12' },
      { id: '2', label: 'Approved', status: 'completed', date: 'Mar 13' },
      { id: '3', label: 'Ordered', status: 'current', date: 'Mar 14' },
      { id: '4', label: 'Received', status: 'upcoming' },
    ],
    itemsList: [
      { name: "Office Chair", quantity: 5, price: "$250.00" }
    ],
    notes: "Pending confirmation on delivery date."
  },
  { 
    id: "PO-2024-003", 
    vendor: "Global Logistics", 
    date: "2024-03-14", 
    amount: "$12,800.00", 
    status: "Pending",
    items: 45,
    progress: [
      { id: '1', label: 'Created', status: 'completed', date: 'Mar 14' },
      { id: '2', label: 'Approved', status: 'current' },
      { id: '3', label: 'Ordered', status: 'upcoming' },
      { id: '4', label: 'Received', status: 'upcoming' },
    ],
    itemsList: [
      { name: "Shipping Containers", quantity: 2, price: "$5,000.00" },
      { name: "Packaging Material", quantity: 43, price: "$65.11" }
    ],
    notes: "Awaiting customs clearance documentation."
  },
];

interface PurchaseOrdersProps {
  pageAction?: { type: string; payload?: any } | null;
  onActionHandled?: () => void;
  userRole?: 'employee' | 'manager';
}

export function PurchaseOrders({ pageAction, onActionHandled, userRole }: PurchaseOrdersProps) {
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pos, setPos] = useState<PurchaseOrder[]>(initialPOs);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  useEffect(() => {
    const fetchPOs = async () => {
      if (!supabase) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*');
        
      if (error) {
        console.error('Error fetching purchase orders:', error);
      } else if (data) {
        // Map Supabase data to PurchaseOrder type
        const mappedData = data.map((po: any) => ({
          id: po.id,
          vendor: po.vendor,
          date: po.date,
          amount: po.amount,
          status: po.status,
          items: po.items,
          notes: po.notes,
          progress: typeof po.progress === 'string' ? JSON.parse(po.progress) : po.progress,
          itemsList: typeof po.items_list === 'string' ? JSON.parse(po.items_list) : (po.items_list || []),
        }));
        setPos(mappedData);
      }
      setLoading(false);
    };

    fetchPOs();
  }, []);

  useEffect(() => {
    if (pageAction?.type === 'create') {
      setIsCreating(true);
      if (onActionHandled) {
        onActionHandled();
      }
    }
  }, [pageAction, onActionHandled]);

  const activePO = pos.find(p => p.id === selectedPO);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPO: PurchaseOrder = {
      id: `PO-2024-${String(pos.length + 1).padStart(3, '0')}`,
      vendor: "New Vendor Inc",
      date: new Date().toISOString().split('T')[0],
      amount: "$0.00",
      status: "Pending",
      items: 0,
      progress: [
        { id: '1', label: 'Created', status: 'current', date: 'Just now' },
        { id: '2', label: 'Approved', status: 'upcoming' },
        { id: '3', label: 'Ordered', status: 'upcoming' },
        { id: '4', label: 'Received', status: 'upcoming' },
      ],
      itemsList: [],
      notes: ""
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert([{
          id: newPO.id,
          vendor: newPO.vendor,
          date: newPO.date,
          amount: newPO.amount,
          status: newPO.status,
          items: newPO.items,
          notes: newPO.notes,
          progress: newPO.progress,
          items_list: newPO.itemsList
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating purchase order:', error);
        // Fallback to local state update if error occurs (optional)
      } else if (data) {
         const createdPO = {
          id: data.id,
          vendor: data.vendor,
          date: data.date,
          amount: data.amount,
          status: data.status,
          items: data.items,
          notes: data.notes,
          progress: typeof data.progress === 'string' ? JSON.parse(data.progress) : data.progress,
          itemsList: typeof data.items_list === 'string' ? JSON.parse(data.items_list) : (data.items_list || []),
        };
        setPos([createdPO, ...pos]);
        setIsCreating(false);
        setSelectedPO(createdPO.id);
        return;
      }
    }

    // Fallback for local state only
    setPos([newPO, ...pos]);
    setIsCreating(false);
    setSelectedPO(newPO.id);
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
                  <input type="text" className="w-full p-2 border border-slate-200 rounded-md" placeholder="Select vendor" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Expected Date</label>
                  <input type="date" className="w-full p-2 border border-slate-200 rounded-md" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Items</label>
                <div className="border border-slate-200 rounded-md p-4 bg-slate-50 text-center text-slate-500 text-sm">
                  No items added yet. Click to add items from inventory.
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <textarea className="w-full p-2 border border-slate-200 rounded-md h-24" placeholder="Add notes..." />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  <Save className="w-4 h-4 mr-2" />
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
                    <Badge variant={
                      po.status === "Completed" ? "success" : 
                      po.status === "Processing" ? "info" : "warning"
                    }>
                      {po.status}
                    </Badge>
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
