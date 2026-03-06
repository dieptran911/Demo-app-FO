import { supabase } from '@/lib/supabase';
import { PurchaseAdvice } from '@/types';

export const getPurchaseAdvice = async (): Promise<PurchaseAdvice[]> => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return [];
  }

  const { data, error } = await supabase
    .from('purchase_advice')
    .select('*');

  if (error) {
    console.error('Error fetching purchase advice:', error);
    return [];
  }

  return (data || []).map((pa: any) => ({
    ...pa,
    progress: typeof pa.progress === 'string' ? JSON.parse(pa.progress) : pa.progress,
  }));
};

export const createPurchaseAdvice = async (pa: PurchaseAdvice): Promise<PurchaseAdvice | null> => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return null;
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    ...pa,
    created_by: user?.id
  };

  const { data, error } = await supabase
    .from('purchase_advice')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error creating purchase advice:', error);
    return null;
  }

  return {
    ...data,
    progress: typeof data.progress === 'string' ? JSON.parse(data.progress) : data.progress,
  };
};

export const updatePurchaseAdvice = async (id: string, updates: Partial<PurchaseAdvice>): Promise<PurchaseAdvice | null> => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return null;
  }

  const { data, error } = await supabase
    .from('purchase_advice')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating purchase advice:', error);
    return null;
  }

  return {
    ...data,
    progress: typeof data.progress === 'string' ? JSON.parse(data.progress) : data.progress,
  };
};

export const deletePurchaseAdvice = async (id: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return false;
  }

  const { error } = await supabase
    .from('purchase_advice')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting purchase advice:', error);
    return false;
  }

  return true;
};
