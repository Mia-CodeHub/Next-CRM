import type { SupabaseClient } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string | null;
  type: 'order_new' | 'order_status' | 'low_stock' | 'system';
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(supabase: SupabaseClient, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Notification[];
}

export async function getUnreadCount(supabase: SupabaseClient) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);
  if (error) throw error;
  return count ?? 0;
}

export async function markAsRead(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllAsRead(supabase: SupabaseClient) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);
  if (error) throw error;
}
