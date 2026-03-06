import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight,
  ArrowDownLeft,
  Package,
  X,
  Save,
  Pencil
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock Data
const initialInventoryItems = [
  { id: "INV-001", name: "Office Chair Ergonomic", sku: "FURN-001", stock: 45, minStock: 10, category: "Furniture", price: "120.00" },
  { id: "INV-002", name: "Monitor 27-inch 4K", sku: "ELEC-002", stock: 8, minStock: 15, category: "Electronics", price: "350.00" },
  { id: "INV-003", name: "Wireless Keyboard", sku: "ELEC-003", stock: 120, minStock: 20, category: "Electronics", price: "45.00" },
  { id: "INV-004", name: "Standing Desk", sku: "FURN-004", stock: 12, minStock: 5, category: "Furniture", price: "450.00" },
  { id: "INV-005", name: "USB-C Hub", sku: "ACC-005", stock: 200, minStock: 50, category: "Accessories", price: "25.00" },
];

export function Inventory() {
  const [items, setItems] = useState(initialInventoryItems);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    stock: 0,
    minStock: 0,
    price: ''
  });

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      sku: '',
      category: 'Electronics',
      stock: 0,
      minStock: 0,
      price: ''
    });
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      stock: item.stock,
      minStock: item.minStock,
      price: item.price
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      // Update existing
      const updatedItems = items.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData } 
          : item
      );
      setItems(updatedItems);
    } else {
      // Create new
      const newItem = {
        id: `INV-${String(items.length + 1).padStart(3, '0')}`,
        ...formData
      };
      setItems([newItem, ...items]);
    }
    
    setIsFormOpen(false);
  };

  if (isFormOpen) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            {editingItem ? 'Edit Inventory Item' : 'Add New Item'}
          </h1>
          <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Item Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-slate-200 rounded-md" 
                  placeholder="e.g. Ergonomic Chair"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">SKU</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-slate-200 rounded-md" 
                    placeholder="e.g. FURN-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <select 
                    className="w-full p-2 border border-slate-200 rounded-md bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Electronics</option>
                    <option>Furniture</option>
                    <option>Accessories</option>
                    <option>Office Supplies</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Current Stock</label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full p-2 border border-slate-200 rounded-md" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Min Stock Alert</label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full p-2 border border-slate-200 rounded-md" 
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Price ($)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-slate-200 rounded-md" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingItem ? 'Update Item' : 'Save Item'}
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventory Management</h1>
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <ArrowDownLeft className="w-4 h-4 mr-2 text-emerald-600" />
                  Import Stock
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload CSV to bulk import items</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <ArrowUpRight className="w-4 h-4 mr-2 text-blue-600" />
                  Export Stock
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download current inventory report</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new inventory item</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Items</p>
                <h3 className="text-2xl font-bold text-slate-900">{items.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Inbound (Today)</p>
                <h3 className="text-2xl font-bold text-slate-900">45</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Outbound (Today)</p>
                <h3 className="text-2xl font-bold text-slate-900">128</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Stock Levels</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search items..." 
                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter by category or status</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Item Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">SKU</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Category</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Stock</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Status</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-slate-500">Price</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {items.map((item) => (
                    <tr key={item.id} className="border-b transition-colors hover:bg-slate-50/50">
                      <td className="p-4 align-middle font-medium">{item.name}</td>
                      <td className="p-4 align-middle text-slate-500">{item.sku}</td>
                      <td className="p-4 align-middle">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="p-4 align-middle font-mono">{item.stock}</td>
                      <td className="p-4 align-middle">
                        {item.stock < item.minStock ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>
                      <td className="p-4 align-middle text-right">${item.price}</td>
                      <td className="p-4 align-middle text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit item details</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
