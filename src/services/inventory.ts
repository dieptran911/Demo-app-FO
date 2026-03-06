import { supabase } from '../lib/supabase';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  min_stock: number;
  price: number;
  created_at?: string;
}

export const fetchInventoryItems = async () => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return [];
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }

  return data as InventoryItem[];
};

export const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at'>) => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return null;
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }

  return data as InventoryItem;
};

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return null;
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }

  return data as InventoryItem;
};

export const deleteInventoryItem = async (id: string) => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return null;
  }

  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }

  return true;
};
