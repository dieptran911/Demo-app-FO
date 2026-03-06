import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusTracker } from "@/components/StatusTracker";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Loader2,
  Trash2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PurchaseAdvice } from '@/types';
import { 
  getPurchaseAdvice, 
  createPurchaseAdvice, 
  deletePurchaseAdvice 
} from '@/services/purchaseAdvice';

interface PurchaseAdviceProps {
  userRole?: 'employee' | 'manager';
}

export function PurchaseAdvice({ userRole }: PurchaseAdviceProps) {
  const [selectedPA, setSelectedPA] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pas, setPas] = useState<PurchaseAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    department: 'IT Department',
    priority: 'Medium',
    description: '',
    justification: ''
  });

  const fetchPAs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPurchaseAdvice();
      setPas(data);
    } catch (error) {
      console.error("Failed to fetch purchase advice", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPAs();
  }, [fetchPAs]);

  const activePA = pas.find(p => p.id === selectedPA);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newPA: PurchaseAdvice = {
      id: `PA-2024-${String(pas.length + 1).padStart(3, '0')}`,
      department: formData.department,
      requester: "Current User", // In a real app, get from auth context
      date: new Date().toISOString().split('T')[0],
      priority: formData.priority,
      status: "Pending Approval",
      description: formData.description,
      justification: formData.justification,
      progress: [
        { id: '1', label: 'Submitted', status: 'current', date: 'Just now' },
        { id: '2', label: 'Manager Review', status: 'upcoming' },
        { id: '3', label: 'Finance Review', status: 'upcoming' },
        { id: '4', label: 'Final Approval', status: 'upcoming' },
      ]
    };

    try {
      const createdPA = await createPurchaseAdvice(newPA);
      if (createdPA) {
        setPas([createdPA, ...pas]);
        setIsCreating(false);
        setSelectedPA(createdPA.id);
        // Reset form
        setFormData({
          department: 'IT Department',
          priority: 'Medium',
          description: '',
          justification: ''
        });
      }
    } catch (error) {
      console.error("Failed to create purchase advice", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card click
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const success = await deletePurchaseAdvice(id);
        if (success) {
          setPas(pas.filter(p => p.id !== id));
          if (selectedPA === id) setSelectedPA(null);
        }
      } catch (error) {
        console.error("Failed to delete purchase advice", error);
      }
    }
  };

  if (isCreating) {
    return (
      <TooltipProvider>
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Create Purchase Advice</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" onClick={() => setIsCreating(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close form</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Department</label>
                    <select 
                      className="w-full p-2 border border-slate-200 rounded-md bg-white"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    >
                      <option>IT Department</option>
                      <option>Marketing</option>
                      <option>Operations</option>
                      <option>HR</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Priority</label>
                    <select 
                      className="w-full p-2 border border-slate-200 rounded-md bg-white"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-slate-200 rounded-md" 
                    placeholder="Brief description of request" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Justification</label>
                  <textarea 
                    className="w-full p-2 border border-slate-200 rounded-md h-24" 
                    placeholder="Why is this needed?" 
                    value={formData.justification}
                    onChange={(e) => setFormData({...formData, justification: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Submit Request
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save and submit this purchase advice</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Purchase Advice</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new purchase advice request</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search PAs..." 
              className="w-full pl-9 pr-4 py-2 text-sm border-none focus:ring-0 focus:outline-none"
            />
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-500">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Filter requests by status or department</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : pas.length === 0 ? (
              <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No purchase advice requests found.
              </div>
            ) : (
              pas.map((pa) => (
                <Card 
                  key={pa.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedPA === pa.id ? 'ring-2 ring-indigo-600' : ''}`}
                  onClick={() => setSelectedPA(pa.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{pa.description}</h3>
                          <p className="text-sm text-slate-500">{pa.id} • {pa.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          pa.status === "Approved" ? "success" : 
                          pa.status === "Rejected" ? "destructive" : "warning"
                        }>
                          {pa.status}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => handleDelete(e, pa.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-500">
                        <span className="mr-2">Requester:</span>
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 mr-2">
                          {pa.requester.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{pa.requester}</span>
                      </div>
                      <Badge variant="outline" className={
                        pa.priority === "High" ? "text-red-600 border-red-200 bg-red-50" : "text-slate-600"
                      }>
                        {pa.priority} Priority
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Detail View */}
          <div className="lg:col-span-1">
            {activePA ? (
              <Card className="h-full sticky top-6">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>{activePA.id}</CardTitle>
                    <Badge variant={activePA.priority === "High" ? "destructive" : "secondary"}>
                      {activePA.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{activePA.department}</p>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-4">Approval Workflow</h4>
                    {/* @ts-ignore */}
                    <StatusTracker steps={activePA.progress} />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Description</span>
                      <p className="text-sm mt-1 text-slate-700">{activePA.description}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Submitted Date</span>
                      <span className="font-medium">{activePA.date}</span>
                    </div>
                  </div>

                  {userRole === 'manager' && (
                    <div className="flex space-x-2 pt-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Approve this request</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="destructive" className="flex-1">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reject this request</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                Select a request to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
