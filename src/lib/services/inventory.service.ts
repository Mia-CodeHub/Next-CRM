import type { SupabaseClient } from '@supabase/supabase-js';

export interface InventoryItem {
  id: string;
  tenant_id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  warehouse?: { id: string; name: string };
  product?: { id: string; name: string; sku: string | null; price: number };
}

export async function getInventoryByProduct(supabase: SupabaseClient, productId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, warehouse:warehouses(id, name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as InventoryItem[];
}

export async function getInventoryByWarehouse(supabase: SupabaseClient, warehouseId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, product:products(id, name, sku, price)')
    .eq('warehouse_id', warehouseId)
    .gt('quantity', 0)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as InventoryItem[];
}

export async function upsertInventory(
  supabase: SupabaseClient,
  tenantId: string,
  productId: string,
  entries: { warehouse_id: string; quantity: number }[]
) {
  const rows = entries.map((e) => ({
    tenant_id: tenantId,
    product_id: productId,
    warehouse_id: e.warehouse_id,
    quantity: e.quantity,
  }));

  const { error } = await supabase
    .from('inventory')
    .upsert(rows, { onConflict: 'product_id,warehouse_id' });
  if (error) throw error;
}

export async function deleteInventoryForProduct(supabase: SupabaseClient, productId: string, warehouseIds: string[]) {
  if (warehouseIds.length === 0) return;
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('product_id', productId)
    .in('warehouse_id', warehouseIds);
  if (error) throw error;
}
