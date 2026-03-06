-- Add created_by column to tables that are missing it
-- This is required for RLS policies that check auth.uid() against created_by

-- 1. Inventory Items
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_items_created_by ON public.inventory_items (created_by);

-- 2. Purchase Advice
ALTER TABLE public.purchase_advice 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_purchase_advice_created_by ON public.purchase_advice (created_by);

-- 3. Update RLS Policies to check created_by (Optional but recommended for security)
-- Example: Only allow users to update their own items
-- DROP POLICY IF EXISTS inventory_items_update_auth ON public.inventory_items;
-- CREATE POLICY inventory_items_update_auth ON public.inventory_items 
--   FOR UPDATE TO authenticated 
--   USING (auth.uid() = created_by) 
--   WITH CHECK (auth.uid() = created_by);
