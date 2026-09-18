import type { SupabaseClient } from '@supabase/supabase-js';

interface OrderRow { id: string; total: number; status: string; channel_id: string }

export async function getOverviewStats(supabase: SupabaseClient) {
  const [orders, products, customers] = await Promise.all([
    supabase.from('orders').select('id, total, status'),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
  ]);

  const orderData = (orders.data ?? []) as OrderRow[];
  const totalRevenue = orderData
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total), 0);

  return {
    totalOrders: orderData.length,
    totalRevenue,
    totalProducts: products.count ?? 0,
    totalCustomers: customers.count ?? 0,
  };
}

export async function getRecentOrders(supabase: SupabaseClient, limit = 10) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customer:customers(id, name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getOrdersByChannel(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('orders').select('channel_id, status');
  if (error) throw error;

  const channels: Record<string, { total: number; delivered: number; returned: number }> = {};
  ((data ?? []) as { channel_id: string; status: string }[]).forEach((order) => {
    if (!channels[order.channel_id]) channels[order.channel_id] = { total: 0, delivered: 0, returned: 0 };
    channels[order.channel_id].total++;
    if (order.status === 'delivered') channels[order.channel_id].delivered++;
    if (order.status === 'returned') channels[order.channel_id].returned++;
  });

  return channels;
}
