import type { SupabaseClient } from '@supabase/supabase-js';

export async function getWarehouses(supabase: SupabaseClient, tenantId: string) {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createWarehouse(supabase: SupabaseClient, tenantId: string, values: { name: string; address?: string; phone?: string }) {
  const { data, error } = await supabase
    .from('warehouses')
    .insert({ tenant_id: tenantId, ...values })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWarehouse(supabase: SupabaseClient, id: string, values: { name?: string; address?: string; phone?: string; is_active?: boolean }) {
  const { error } = await supabase
    .from('warehouses')
    .update(values)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteWarehouse(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('warehouses')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
