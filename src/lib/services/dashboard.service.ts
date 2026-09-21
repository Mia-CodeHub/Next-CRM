import type { SupabaseClient } from '@supabase/supabase-js';

interface OrderRow { id: string; total: number; status: string; channel_id: string; ordered_at: string }

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

export type Period = 'day' | 'week' | 'month';

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export async function getRevenueByPeriod(supabase: SupabaseClient, period: Period, days: number): Promise<RevenuePoint[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('orders')
    .select('total, status, ordered_at')
    .gte('ordered_at', since.toISOString());
  if (error) throw error;

  const orders = (data ?? []) as { total: number; status: string; ordered_at: string }[];
  const buckets = new Map<string, { revenue: number; orders: number }>();

  orders.forEach((o) => {
    const d = new Date(o.ordered_at);
    let key: string;
    if (period === 'day') {
      key = d.toISOString().slice(0, 10);
    } else if (period === 'week') {
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay() + 1);
      key = startOfWeek.toISOString().slice(0, 10);
    } else {
      key = d.toISOString().slice(0, 7);
    }

    if (!buckets.has(key)) buckets.set(key, { revenue: 0, orders: 0 });
    const b = buckets.get(key)!;
    b.orders++;
    if (o.status === 'delivered') b.revenue += Number(o.total);
  });

  return Array.from(buckets.entries())
    .map(([date, vals]) => ({ date, ...vals }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface TopProduct {
  id: string;
  name: string;
  image_url: string | null;
  totalSold: number;
  totalRevenue: number;
}

export async function getTopProducts(supabase: SupabaseClient, limit = 5): Promise<TopProduct[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_id, product_name, quantity, unit_price');
  if (error) throw error;

  const products = new Map<string, { name: string; totalSold: number; totalRevenue: number }>();
  ((data ?? []) as { product_id: string | null; product_name: string; quantity: number; unit_price: number }[]).forEach((item) => {
    const pid = item.product_id || item.product_name;
    if (!products.has(pid)) products.set(pid, { name: item.product_name, totalSold: 0, totalRevenue: 0 });
    const p = products.get(pid)!;
    p.totalSold += item.quantity;
    p.totalRevenue += item.quantity * item.unit_price;
  });

  const sorted = Array.from(products.entries())
    .map(([id, vals]) => ({ id, image_url: null as string | null, ...vals }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);

  if (sorted.length > 0) {
    const ids = sorted.map((p) => p.id).filter((id) => id.length === 36);
    if (ids.length > 0) {
      const { data: prodData } = await supabase
        .from('products')
        .select('id, image_url')
        .in('id', ids);
      (prodData ?? []).forEach((pd: { id: string; image_url: string | null }) => {
        const item = sorted.find((s) => s.id === pd.id);
        if (item) item.image_url = pd.image_url;
      });
    }
  }

  return sorted;
}

export interface TopCustomer {
  id: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
}

export async function getTopCustomers(supabase: SupabaseClient, limit = 5): Promise<TopCustomer[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('customer_id, total, status, customer:customers(id, name)')
    .eq('status', 'delivered');
  if (error) throw error;

  const customers = new Map<string, { name: string; totalOrders: number; totalSpent: number }>();
  ((data ?? []) as unknown as { customer_id: string | null; total: number; customer: { id: string; name: string } | null }[]).forEach((o) => {
    if (!o.customer_id || !o.customer) return;
    if (!customers.has(o.customer_id)) customers.set(o.customer_id, { name: o.customer.name, totalOrders: 0, totalSpent: 0 });
    const c = customers.get(o.customer_id)!;
    c.totalOrders++;
    c.totalSpent += Number(o.total);
  });

  return Array.from(customers.entries())
    .map(([id, vals]) => ({ id, ...vals }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  image_url: string | null;
}

export async function getLowStockProducts(supabase: SupabaseClient, threshold = 10): Promise<LowStockProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, stock, image_url')
    .eq('status', 'active')
    .lte('stock', threshold)
    .order('stock', { ascending: true })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as LowStockProduct[];
}

export async function getOrdersForExport(supabase: SupabaseClient, filters?: { dateFrom?: string; dateTo?: string }) {
  let query = supabase
    .from('orders')
    .select('*, customer:customers(name, phone, email), items:order_items(product_name, quantity, unit_price, subtotal)')
    .order('ordered_at', { ascending: false });

  if (filters?.dateFrom) query = query.gte('ordered_at', filters.dateFrom);
  if (filters?.dateTo) query = query.lte('ordered_at', filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
