-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Inventory Items
-- Changed ID to TEXT to support custom IDs like 'INV-001'
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  sku text NOT NULL,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 0,
  price numeric(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON public.inventory_items (sku);

-- 2. Suppliers (Optional for now, but good for future)
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_info jsonb DEFAULT '{}'::jsonb,
  organization_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Purchase Orders
-- Changed ID to TEXT to support custom IDs like 'PO-2024-001'
-- Added 'vendor', 'date', 'items_list', 'progress', 'items' to match frontend
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id text PRIMARY KEY,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  vendor text,
  reference text,
  status text NOT NULL DEFAULT 'Pending',
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  amount numeric(12,2), -- Kept for compatibility
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid,
  notes text,
  date text,
  items_list jsonb DEFAULT '[]'::jsonb,
  progress jsonb DEFAULT '[]'::jsonb,
  items integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON public.purchase_orders (supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON public.purchase_orders (created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders (status);

-- 4. Purchase Order Items (Normalized table, optional if using items_list)
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id text REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id uuid, -- Link to products if used
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric GENERATED ALWAYS AS (quantity * unit_price) STORED
);
CREATE INDEX IF NOT EXISTS idx_po_items_purchase_order_id ON public.purchase_order_items (purchase_order_id);

-- 5. Purchase Advice
-- Changed ID to TEXT to support custom IDs like 'PA-2024-001'
CREATE TABLE IF NOT EXISTS public.purchase_advice (
  id text PRIMARY KEY,
  department text NOT NULL,
  requester text NOT NULL,
  date text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL,
  description text NOT NULL,
  justification text,
  progress jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Products (Optional)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE,
  name text,
  description text,
  unit_price numeric,
  organization_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Inventory (Warehouse stock, Optional)
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id uuid,
  quantity numeric DEFAULT 0,
  reserved numeric DEFAULT 0,
  organization_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Messages / Threads
CREATE TABLE IF NOT EXISTS public.threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.threads(id) ON DELETE SET NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Sync Trigger for Purchase Orders (amount <-> total_amount)
CREATE OR REPLACE FUNCTION public.sync_purchase_order_amounts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.amount IS NOT NULL THEN
    NEW.total_amount := NEW.amount;
  ELSE
    NEW.amount := NEW.total_amount;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_purchase_order_amounts ON public.purchase_orders;
CREATE TRIGGER trg_sync_purchase_order_amounts
BEFORE INSERT OR UPDATE ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.sync_purchase_order_amounts();

-- Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create Policies (Permissive for authenticated users for now)
DO $$
BEGIN
  -- Inventory Items
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'inventory_items_select_auth') THEN
    CREATE POLICY inventory_items_select_auth ON public.inventory_items FOR SELECT TO authenticated USING (true);
    CREATE POLICY inventory_items_insert_auth ON public.inventory_items FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY inventory_items_update_auth ON public.inventory_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY inventory_items_delete_auth ON public.inventory_items FOR DELETE TO authenticated USING (true);
  END IF;

  -- Purchase Orders
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'purchase_orders_select_auth') THEN
    CREATE POLICY purchase_orders_select_auth ON public.purchase_orders FOR SELECT TO authenticated USING (true);
    CREATE POLICY purchase_orders_insert_auth ON public.purchase_orders FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY purchase_orders_update_auth ON public.purchase_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY purchase_orders_delete_auth ON public.purchase_orders FOR DELETE TO authenticated USING (true);
  END IF;

  -- Purchase Advice
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'purchase_advice_select_auth') THEN
    CREATE POLICY purchase_advice_select_auth ON public.purchase_advice FOR SELECT TO authenticated USING (true);
    CREATE POLICY purchase_advice_insert_auth ON public.purchase_advice FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY purchase_advice_update_auth ON public.purchase_advice FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY purchase_advice_delete_auth ON public.purchase_advice FOR DELETE TO authenticated USING (true);
  END IF;

  -- Messages
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'messages_select_auth') THEN
    CREATE POLICY messages_select_auth ON public.messages FOR SELECT TO authenticated USING (true);
    CREATE POLICY messages_insert_auth ON public.messages FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END$$;
