import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order, OrderItem, OrderFilters, PaginationParams } from '../types';

export async function getOrders(supabase: SupabaseClient, filters: OrderFilters, pagination: PaginationParams) {
  let query = supabase
    .from('orders')
    .select('*, customer:customers(id, name, phone), items:order_items(*)', { count: 'exact' });

  if (filters.search) query = query.ilike('order_code', `%${filters.search}%`);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.channel) query = query.eq('channel_id', filters.channel);

  const from = (pagination.page - 1) * pagination.pageSize;
  const to = from + pagination.pageSize - 1;

  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  return { data: (data ?? []) as Order[], total: count ?? 0 };
}

export async function getOrderById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customer:customers(*), items:order_items(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Order;
}

export async function createOrder(
  supabase: SupabaseClient,
  order: Partial<Order>,
  items: Partial<OrderItem>[]
) {
  const { data: orderData, error: orderError } = await supabase.from('orders').insert(order).select().single();
  if (orderError) throw orderError;

  const created = orderData as Order;
  if (items.length > 0) {
    const orderItems = items.map((item) => ({ ...item, order_id: created.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;
  }

  return created;
}

export async function updateOrder(supabase: SupabaseClient, id: string, order: Partial<Order>) {
  const { data, error } = await supabase.from('orders').update(order).eq('id', id).select().single();
  if (error) throw error;
  return data as Order;
}

export async function deleteOrder(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
}
