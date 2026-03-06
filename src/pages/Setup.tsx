import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Copy, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function Setup() {
  const [status, setStatus] = useState<{ [key: string]: boolean | null }>({
    inventory_items: null,
    purchase_orders: null,
    purchase_advice: null,
    messages: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkTables = async () => {
    setLoading(true);
    setError(null);
    const newStatus = { ...status };

    try {
      // Check inventory_items
      const { error: invError } = await supabase.from('inventory_items').select('count', { count: 'exact', head: true });
      newStatus.inventory_items = !invError || invError.code !== 'PGRST205'; // PGRST205 means relation does not exist

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
    } finally {
      setLoading(false);
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
          <AlertDescription>
            All required tables are present. You can now use the application.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
