import type { SupabaseClient } from '@supabase/supabase-js';

export async function getChannelTypes(supabase: SupabaseClient, tenantId: string) {
  const { data, error } = await supabase
    .from('channel_types')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createChannelType(supabase: SupabaseClient, tenantId: string, values: { name: string; color?: string; icon?: string }) {
  const { data, error } = await supabase
    .from('channel_types')
    .insert({ tenant_id: tenantId, ...values })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateChannelType(supabase: SupabaseClient, id: string, values: { name?: string; color?: string; icon?: string }) {
  const { error } = await supabase
    .from('channel_types')
    .update(values)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteChannelType(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('channel_types')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getChannels(supabase: SupabaseClient, tenantId: string) {
  const { data, error } = await supabase
    .from('channels')
    .select('*, channel_type:channel_types(id, name, color, icon)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createChannel(supabase: SupabaseClient, tenantId: string, values: { channel_type_id: string; name: string; url?: string; notes?: string }) {
  const { data, error } = await supabase
    .from('channels')
    .insert({ tenant_id: tenantId, ...values })
    .select('*, channel_type:channel_types(id, name, color, icon)')
    .single();
  if (error) throw error;
  return data;
}

export async function updateChannel(supabase: SupabaseClient, id: string, values: { name?: string; url?: string; notes?: string; is_active?: boolean }) {
  const { error } = await supabase
    .from('channels')
    .update(values)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteChannel(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('channels')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
