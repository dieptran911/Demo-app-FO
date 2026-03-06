
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

  // Map Supabase data to PurchaseOrder type if necessary
  // Assuming the Supabase table matches the PurchaseOrder type for now
  // But we might need to parse JSON fields if they are stored as strings
  return (data || []).map((po: any) => ({
    ...po,
    progress: typeof po.progress === 'string' ? JSON.parse(po.progress) : po.progress,
    itemsList: typeof po.itemsList === 'string' ? JSON.parse(po.itemsList) : po.itemsList,
  }));
};

export const createPurchaseOrder = async (po: PurchaseOrder): Promise<PurchaseOrder | null> => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return null;
  }

  const { data, error } = await supabase
    .from('purchase_orders')
    .insert([po])
    .select()
    .single();

  if (error) {
    console.error('Error creating purchase order:', error);
    return null;
  }

  return {
    ...data,
    progress: typeof data.progress === 'string' ? JSON.parse(data.progress) : data.progress,
    itemsList: typeof data.itemsList === 'string' ? JSON.parse(data.itemsList) : data.itemsList,
  };
};
