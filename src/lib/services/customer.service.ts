import type { SupabaseClient } from '@supabase/supabase-js';
import type { Customer, CustomerFilters, PaginationParams } from '../types';

export async function getCustomers(supabase: SupabaseClient, filters: CustomerFilters, pagination: PaginationParams) {
  let query = supabase.from('customers').select('*', { count: 'exact' });

  if (filters.search) query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  if (filters.channel) query = query.eq('channel_id', filters.channel);

  const from = (pagination.page - 1) * pagination.pageSize;
  const to = from + pagination.pageSize - 1;

  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  return { data: (data ?? []) as Customer[], total: count ?? 0 };
}

export async function getCustomerById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Customer;
}

export async function createCustomer(supabase: SupabaseClient, customer: Partial<Customer>) {
  const { data, error } = await supabase.from('customers').insert(customer).select().single();
  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(supabase: SupabaseClient, id: string, customer: Partial<Customer>) {
  const { data, error } = await supabase.from('customers').update(customer).eq('id', id).select().single();
  if (error) throw error;
  return data as Customer;
}

export async function deleteCustomer(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
}
