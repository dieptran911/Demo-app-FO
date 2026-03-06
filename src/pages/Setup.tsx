import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Copy, Loader2, RefreshCw, HelpCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Setup() {
  const [status, setStatus] = useState<{ [key: string]: boolean | null }>({
    inventory_items: null,
    purchase_orders: null,
    purchase_advice: null,
    messages: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionTest, setConnectionTest] = useState<{ success: boolean; message: string } | null>(null);

  const [seeding, setSeeding] = useState(false);

  const checkTables = async () => {
    setLoading(true);
    setError(null);
    setConnectionTest(null);
    const newStatus = { ...status };

    try {
      // Test basic connection first
      const { error: connError } = await supabase.from('inventory_items').select('count', { count: 'exact', head: true });
      
      if (connError && connError.code !== 'PGRST205') {
         // If it's NOT a missing table error, it might be connection/auth
         setConnectionTest({ success: false, message: `Connection failed: ${connError.message} (${connError.code})` });
      } else {
         setConnectionTest({ success: true, message: "Connected to Supabase successfully." });
      }

      // Check inventory_items
      const { error: invError } = await supabase.from('inventory_items').select('count', { count: 'exact', head: true });
      newStatus.inventory_items = !invError || invError.code !== 'PGRST205'; 

      // Check purchase_orders
      const { error: poError } = await supabase.from('purchase_orders').select('count', { count: 'exact', head: true });
      newStatus.purchase_orders = !poError || poError.code !== 'PGRST205';

      // Check purchase_advice
      const { error: paError } = await supabase.from('purchase_advice').select('count', { count: 'exact', head: true });
      newStatus.purchase_advice = !paError || paError.code !== 'PGRST205';

      // Check messages
      const { error: msgError } = await supabase.from('messages').select('count', { count: 'exact', head: true });
      newStatus.messages = !msgError || msgError.code !== 'PGRST205';

      setStatus(newStatus);
    } catch (err: any) {
      console.error("Error checking tables:", err);
      setError(err.message || "An unexpected error occurred while checking tables.");
      setConnectionTest({ success: false, message: `Unexpected error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    setSeeding(true);
    setError(null);
    try {
      // Seed Inventory
      const { error: invError } = await supabase.from('inventory_items').insert([
        { id: 'INV-001', name: 'Ergonomic Office Chair', sku: 'FUR-CHR-001', category: 'Furniture', stock: 15, min_stock: 5, price: 299.99 },
        { id: 'INV-002', name: '27" 4K Monitor', sku: 'TEC-MON-027', category: 'Electronics', stock: 8, min_stock: 3, price: 450.00 },
        { id: 'INV-003', name: 'Mechanical Keyboard', sku: 'TEC-KEY-002', category: 'Electronics', stock: 20, min_stock: 10, price: 120.50 },
        { id: 'INV-004', name: 'Standing Desk', sku: 'FUR-DSK-005', category: 'Furniture', stock: 5, min_stock: 2, price: 550.00 },
      ]);
      if (invError) throw invError;

      // Seed Purchase Orders
      const { error: poError } = await supabase.from('purchase_orders').insert([
        {
          id: 'PO-2024-001',
          vendor: 'TechSupplies Inc.',
          date: '2024-03-01',
          amount: '$1,350.00',
          status: 'Completed',
          items: 3,
          progress: [
            { id: '1', label: 'Created', status: 'completed', date: '2024-03-01' },
            { id: '2', label: 'Approved', status: 'completed', date: '2024-03-02' },
            { id: '3', label: 'Ordered', status: 'completed', date: '2024-03-03' },
            { id: '4', label: 'Received', status: 'completed', date: '2024-03-05' }
          ],
          items_list: [
            { name: '27" 4K Monitor', quantity: 3, price: '$450.00' }
          ],
          notes: 'Urgent order for new hires.'
        },
        {
          id: 'PO-2024-002',
          vendor: 'Office Comforts Ltd.',
          date: '2024-03-06',
          amount: '$899.97',
          status: 'Processing',
          items: 3,
          progress: [
            { id: '1', label: 'Created', status: 'completed', date: '2024-03-06' },
            { id: '2', label: 'Approved', status: 'current', date: '2024-03-07' },
            { id: '3', label: 'Ordered', status: 'upcoming' },
            { id: '4', label: 'Received', status: 'upcoming' }
          ],
          items_list: [
            { name: 'Ergonomic Office Chair', quantity: 3, price: '$299.99' }
          ],
          notes: 'Replacement chairs for sales team.'
        }
      ]);
      if (poError) throw poError;

      // Seed Purchase Advice
      const { error: paError } = await supabase.from('purchase_advice').insert([
        {
          id: 'PA-2024-001',
          department: 'Engineering',
          requester: 'Alice Smith',
          date: '2024-03-07',
          priority: 'High',
          status: 'Pending Approval',
          description: 'New server rack for testing environment.',
          justification: 'Current rack is full and we need to expand capacity for the new project.',
          progress: [
            { id: '1', label: 'Submitted', status: 'current', date: '2024-03-07' },
            { id: '2', label: 'Manager Review', status: 'upcoming' },
            { id: '3', label: 'Procurement', status: 'upcoming' },
            { id: '4', label: 'Completed', status: 'upcoming' }
          ]
        }
      ]);
      if (paError) throw paError;

      alert("Database seeded successfully!");
    } catch (err: any) {
      console.error("Error seeding database:", err);
      setError(err.message || "An error occurred while seeding the database.");
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    checkTables();
  }, []);

  const sqlScript = `-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Inventory Items Table
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  vendor TEXT NOT NULL,
  date DATE NOT NULL,
  amount TEXT,
  status TEXT NOT NULL,
  items INTEGER NOT NULL DEFAULT 0,
  progress JSONB DEFAULT '[]'::jsonb,
  items_list JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Advice Table
CREATE TABLE IF NOT EXISTS purchase_advice (
  id TEXT PRIMARY KEY,
  department TEXT NOT NULL,
  requester TEXT NOT NULL,
  date DATE NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  justification TEXT,
  progress JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  thread_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for development purposes)
-- WARNING: In production, you should restrict these policies to authenticated users
CREATE POLICY "Allow public read access" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON inventory_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON inventory_items FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON purchase_orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON purchase_orders FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON purchase_advice FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON purchase_advice FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON purchase_advice FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON purchase_advice FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON messages FOR INSERT WITH CHECK (true);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    alert("SQL script copied to clipboard!");
  };

  const allTablesExist = Object.values(status).every(s => s === true);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Database Setup</h1>
        <Button onClick={checkTables} disabled={loading} variant="outline">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Check Connection
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(status).map(([table, exists]) => (
          <Card key={table} className={exists ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {table}
              </CardTitle>
              {exists === null ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : exists ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {exists === null ? "Checking..." : exists ? "Table exists" : "Table missing"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!allTablesExist && (
        <Card>
          <CardHeader>
            <CardTitle>Initialize Database</CardTitle>
            <CardDescription>
              Some required tables are missing. Please run the following SQL script in your Supabase SQL Editor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative rounded-md bg-slate-950 p-4">
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-4 top-4 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <pre className="overflow-x-auto text-xs text-slate-50">
                <code>{sqlScript}</code>
              </pre>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => window.open('https://supabase.com/dashboard/project/_/sql', '_blank')}>
                Open Supabase SQL Editor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {allTablesExist && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Ready to go!</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>All required tables are present. You can now use the application.</p>
            <div className="flex gap-2">
              <Button onClick={seedDatabase} disabled={seeding} variant="outline" className="bg-white hover:bg-green-100 border-green-300 text-green-700">
                {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Seed Database with Sample Data
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Troubleshooting Section */}
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Troubleshooting
        </h2>
        
        {connectionTest && (
          <div className={`mb-4 p-3 rounded-md border ${connectionTest.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <p className="text-sm font-medium">Connection Status: {connectionTest.message}</p>
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Error: "Could not find the table/column ... in the schema cache" (PGRST204 / PGRST205)
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-slate-600 space-y-2">
              <p>This error means Supabase cannot see the table or column, even if you just created it.</p>
              <p><strong>Solution:</strong> You need to reload the Schema Cache in Supabase.</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to your Supabase Dashboard.</li>
                <li>Navigate to <strong>Settings</strong> (cog icon) &gt; <strong>API</strong>.</li>
                <li>Find the <strong>Schema Cache</strong> section.</li>
                <li>Click <strong>Reload</strong>.</li>
                <li>Come back here and click "Check Connection" again.</li>
              </ol>
              <p className="mt-2"><strong>If that doesn't work for "column" errors (PGRST204):</strong></p>
              <p>The column might be missing. Run this SQL in Supabase to ensure it exists:</p>
              <div className="bg-slate-950 p-3 rounded-md mt-2 relative group">
                <pre className="text-xs text-slate-50 overflow-x-auto">
                  <code>ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS amount TEXT;</code>
                </pre>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-2 top-2 h-6 w-6 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    navigator.clipboard.writeText("ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS amount TEXT;");
                    alert("SQL copied!");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-sm font-medium">Tables exist but still getting errors</AccordionTrigger>
            <AccordionContent className="text-sm text-slate-600 space-y-2">
              <p>This might be due to Row Level Security (RLS) policies blocking access.</p>
              <p><strong>Solution:</strong> Ensure you ran the full SQL script which includes `CREATE POLICY` statements. If you created tables manually, you might need to add policies or disable RLS for development.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Error: "new row violates row-level security policy" (42501)
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-slate-600 space-y-2">
              <p>This means Row Level Security (RLS) is enabled but no policy allows your current action.</p>
              <p><strong>Solution:</strong> For development, you can disable RLS on the tables.</p>
              <div className="bg-slate-950 p-3 rounded-md mt-2 relative group">
                <pre className="text-xs text-slate-50 overflow-x-auto">
                  <code>
ALTER TABLE public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_advice DISABLE ROW LEVEL SECURITY;
                  </code>
                </pre>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-2 top-2 h-6 w-6 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    navigator.clipboard.writeText(`ALTER TABLE public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_advice DISABLE ROW LEVEL SECURITY;`);
                    alert("SQL copied!");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-500">Run this in your Supabase SQL Editor.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-500" />
                Fix RLS: Add 'created_by' column (Recommended)
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-slate-600 space-y-2">
              <p>If your RLS policies check for <code>auth.uid()</code>, you need a <code>created_by</code> column in your tables.</p>
              <p><strong>Solution:</strong> Run this SQL to add the column to your tables.</p>
              <div className="bg-slate-950 p-3 rounded-md mt-2 relative group">
                <pre className="text-xs text-slate-50 overflow-x-auto">
                  <code>
-- Add created_by column
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.purchase_advice ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_items_created_by ON public.inventory_items (created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON public.purchase_orders (created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_advice_created_by ON public.purchase_advice (created_by);
                  </code>
                </pre>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-2 top-2 h-6 w-6 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    navigator.clipboard.writeText(`-- Add created_by column
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.purchase_advice ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_items_created_by ON public.inventory_items (created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON public.purchase_orders (created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_advice_created_by ON public.purchase_advice (created_by);`);
                    alert("SQL copied!");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
