
import { supabase } from '@/lib/supabase';
import { PurchaseOrder } from '@/types';

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return [];
  }

  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*');

  if (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }

  // Map Supabase data to PurchaseOrder type
  return (data || []).map((po: any) => ({
    ...po,
    progress: typeof po.progress === 'string' ? JSON.parse(po.progress) : po.progress,
    itemsList: po.items_list ? (typeof po.items_list === 'string' ? JSON.parse(po.items_list) : po.items_list) : [],
  }));
};

export const createPurchaseOrder = async (po: PurchaseOrder): Promise<PurchaseOrder | null> => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return null;
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Map frontend PurchaseOrder to backend structure
  const dbPayload = {
    ...po,
    items_list: po.itemsList,
    created_by: user?.id
  };
  // Remove the frontend-only property if it exists in the payload to avoid errors
  // @ts-ignore
  delete dbPayload.itemsList;

  const { data, error } = await supabase
    .from('purchase_orders')
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error('Error creating purchase order:', error);
    return null;
  }

  return {
    ...data,
    progress: typeof data.progress === 'string' ? JSON.parse(data.progress) : data.progress,
    itemsList: data.items_list ? (typeof data.items_list === 'string' ? JSON.parse(data.items_list) : data.items_list) : [],
  };
};

export const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return null;
  }

  // Map frontend updates to backend structure
  const dbUpdates: any = { ...updates };
  if (updates.itemsList) {
    dbUpdates.items_list = updates.itemsList;
    delete dbUpdates.itemsList;
  }

  const { data, error } = await supabase
    .from('purchase_orders')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating purchase order:', error);
    return null;
  }

  return {
    ...data,
    progress: typeof data.progress === 'string' ? JSON.parse(data.progress) : data.progress,
    itemsList: data.items_list ? (typeof data.items_list === 'string' ? JSON.parse(data.items_list) : data.items_list) : [],
  };
};

export const deletePurchaseOrder = async (id: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return false;
  }

  const { error } = await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting purchase order:', error);
    return false;
  }

  return true;
};
