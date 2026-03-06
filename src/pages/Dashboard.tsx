import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  FileText,
  TrendingUp
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardProps {
  onNavigate: (page: string, action?: { type: string; payload?: any }) => void;
  userRole: 'employee' | 'manager';
}

export function Dashboard({ onNavigate, userRole }: DashboardProps) {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {userRole === 'manager' ? 'Manager' : 'User'}</p>
          </div>
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Download Report</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export dashboard summary as PDF</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => onNavigate('po', { type: 'create' })}
                >
                  New Order
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new purchase order</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <DollarSign className="h-4 w-4 text-slate-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Total revenue generated this month</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active POs</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <ShoppingCart className="h-4 w-4 text-slate-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Number of active purchase orders</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-slate-500 mt-1">
              +180 new orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending PAs</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <FileText className="h-4 w-4 text-slate-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Purchase advices waiting for approval</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-amber-600 mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Alert</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Package className="h-4 w-4 text-slate-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Items with low stock levels</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-red-600 mt-1">
              Items low on stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { id: "PO-2024-001", client: "Acme Corp", amount: "$1,200.00", status: "Completed" },
                { id: "PO-2024-002", client: "Globex Inc", amount: "$250.00", status: "Processing" },
                { id: "PO-2024-003", client: "Soylent Corp", amount: "$4,500.00", status: "Pending" },
                { id: "PO-2024-004", client: "Initech", amount: "$850.00", status: "Completed" },
                { id: "PO-2024-005", client: "Umbrella Corp", amount: "$12,000.00", status: "Processing" },
              ].map((order) => (
                <div key={order.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{order.client}</p>
                    <p className="text-sm text-slate-500">{order.id}</p>
                  </div>
                  <div className="ml-auto font-medium">{order.amount}</div>
                  <Badge 
                    className="ml-4 w-24 justify-center" 
                    variant={
                      order.status === "Completed" ? "success" : 
                      order.status === "Processing" ? "info" : "warning"
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { action: "New PO Created", user: "John Doe", time: "2 min ago", icon: ShoppingCart },
                { action: "Stock Updated", user: "Jane Smith", time: "1 hour ago", icon: Package },
                { action: "PA Approved", user: "Mike Johnson", time: "3 hours ago", icon: FileText },
                { action: "Export Completed", user: "Sarah Wilson", time: "5 hours ago", icon: ArrowUpRight },
              ].map((activity, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <activity.icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-slate-500">by {activity.user}</p>
                  </div>
                  <div className="ml-auto text-xs text-slate-400">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  );
}
