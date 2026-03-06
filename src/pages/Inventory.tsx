import React, { useState, useEffect, useCallback } from 'react';
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
  Pencil,
  Trash2,
  Loader2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  fetchInventoryItems, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  InventoryItem 
} from '../services/inventory';

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    stock: 0,
    minStock: 0,
    price: ''
  });

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchInventoryItems();
      // Map backend min_stock to frontend minStock if needed, but we can just use the backend type
      // However, the UI expects minStock in some places if we kept the old structure.
      // Let's just use the backend type directly in the state.
      setItems(data || []);
    } catch (error) {
      console.error("Failed to load inventory items", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

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

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      stock: item.stock,
      minStock: item.min_stock,
      price: item.price.toString()
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteInventoryItem(id);
        setItems(items.filter(item => item.id !== id));
      } catch (error) {
        console.error("Failed to delete item", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const itemData = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        stock: formData.stock,
        min_stock: formData.minStock,
        price: parseFloat(formData.price) || 0
      };

      if (editingItem) {
        // Update existing
        const updated = await updateInventoryItem(editingItem.id, itemData);
        if (updated) {
          setItems(items.map(item => item.id === editingItem.id ? updated : item));
        }
      } else {
        // Create new
        const newItem = await addInventoryItem(itemData);
        if (newItem) {
          setItems([newItem, ...items]);
        }
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to save item", error);
    } finally {
      setIsSubmitting(false);
    }
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
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
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
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : (
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
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-500">
                          No items found. Add one to get started.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="border-b transition-colors hover:bg-slate-50/50">
                          <td className="p-4 align-middle font-medium">{item.name}</td>
                          <td className="p-4 align-middle text-slate-500">{item.sku}</td>
                          <td className="p-4 align-middle">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="p-4 align-middle font-mono">{item.stock}</td>
                          <td className="p-4 align-middle">
                            {item.stock < item.min_stock ? (
                              <Badge variant="destructive">Low Stock</Badge>
                            ) : (
                              <Badge variant="success">In Stock</Badge>
                            )}
                          </td>
                          <td className="p-4 align-middle text-right">${item.price}</td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end space-x-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit item details</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete item</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
