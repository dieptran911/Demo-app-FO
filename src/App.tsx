/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { PurchaseOrders } from '@/pages/PurchaseOrders';
import { PurchaseAdvice } from '@/pages/PurchaseAdvice';
import { Inventory } from '@/pages/Inventory';

export type UserRole = 'employee' | 'manager';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [pageAction, setPageAction] = useState<{ type: string; payload?: any } | null>(null);

  const handleNavigate = (page: string, action?: { type: string; payload?: any }) => {
    setActivePage(page);
    if (action) {
      setPageAction(action);
    } else {
      setPageAction(null);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} userRole={userRole} />;
      case 'po':
        return <PurchaseOrders pageAction={pageAction} onActionHandled={() => setPageAction(null)} userRole={userRole} />;
      case 'pa':
        return <PurchaseAdvice userRole={userRole} />;
      case 'inventory':
        return <Inventory userRole={userRole} />;
      default:
        return <Dashboard onNavigate={handleNavigate} userRole={userRole} />;
    }
  };

  return (
    <Layout 
      activePage={activePage} 
      onNavigate={handleNavigate} 
      userRole={userRole} 
      onRoleChange={setUserRole}
    >
      {renderPage()}
    </Layout>
  );
}
