import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Package, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Bell,
  User,
  Shield,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  userRole: 'employee' | 'manager';
  onRoleChange: (role: 'employee' | 'manager') => void;
}

export function Layout({ children, activePage, onNavigate, userRole, onRoleChange }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'po', label: 'Purchase Orders', icon: ShoppingCart },
    { id: 'pa', label: 'Purchase Advice', icon: FileText },
    { id: 'inventory', label: 'Inventory (In/Out)', icon: Package },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'setup', label: 'Database Setup', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="font-bold text-xl text-slate-900">BizFlow</span>
          <button 
            type="button"
            className="ml-auto lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-indigo-600" : "text-slate-400")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <button type="button" className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Settings className="w-5 h-5 mr-3 text-slate-400" />
            Settings
          </button>
          <button type="button" className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1">
            <LogOut className="w-5 h-5 mr-3 text-red-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-col min-h-screen lg:pl-64 transition-all duration-200">
        {/* Top Navigation Bar (Header) */}
        <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200">
          <div className="flex h-16 items-center px-4 lg:px-8">
            {/* Mobile Menu Button */}
            <button 
              type="button"
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 mr-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo - Mobile Only */}
            <div className="flex items-center mr-8 lg:hidden">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-xl text-slate-900 hidden sm:block">BizFlow</span>
            </div>

            <div className="flex items-center ml-auto space-x-4">
              {/* Role Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                    {userRole === 'manager' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    <span className="capitalize">{userRole} View</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onRoleChange('employee')}>
                    <User className="w-4 h-4 mr-2" />
                    Employee
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRoleChange('manager')}>
                    <Shield className="w-4 h-4 mr-2" />
                    Manager
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button type="button" className="p-2 text-slate-400 hover:text-slate-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center pl-4 border-l border-slate-200">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm",
                  userRole === 'manager' ? "bg-indigo-600" : "bg-slate-500"
                )}>
                  {userRole === 'manager' ? 'JD' : 'U'}
                </div>
                <span className="ml-3 text-sm font-medium text-slate-700 hidden sm:block">
                  {userRole === 'manager' ? 'John Doe (Mgr)' : 'User'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
