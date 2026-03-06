import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  created_at: string;
  content: string;
  sender_id: string;
  thread_id: string;
}

export const fetchMessages = async () => {
  if (!supabase) {
    console.warn('Supabase client is not initialized. Returning empty array.');
    return [];
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data as Message[];
};

export const sendMessage = async (content: string, threadId: string, senderId: string) => {
    if (!supabase) {
        console.warn('Supabase client is not initialized. Cannot send message.');
        return null;
    }

    const { data, error } = await supabase
        .from('messages')
        .insert([
            { content, thread_id: threadId, sender_id: senderId }
        ])
        .select();

    if (error) {
        console.error('Error sending message:', error);
        throw error;
    }

    return data;
};
