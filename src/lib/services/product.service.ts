import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product, ProductFilters, PaginationParams } from '../types';

export async function getProducts(supabase: SupabaseClient, filters: ProductFilters, pagination: PaginationParams) {
  let query = supabase.from('products').select('*', { count: 'exact' });

  if (filters.search) query = query.ilike('name', `%${filters.search}%`);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.channel) query = query.eq('channel_id', filters.channel);

  const from = (pagination.page - 1) * pagination.pageSize;
  const to = from + pagination.pageSize - 1;

  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  return { data: (data ?? []) as Product[], total: count ?? 0 };
}

export async function getProductById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Product;
}

export async function createProduct(supabase: SupabaseClient, product: Partial<Product>) {
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(supabase: SupabaseClient, id: string, product: Partial<Product>) {
  const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}
