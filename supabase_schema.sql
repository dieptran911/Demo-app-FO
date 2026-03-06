-- Enable UUID extension if not already enabled
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
