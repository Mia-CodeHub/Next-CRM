'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import * as svc from '@/lib/services/dashboard.service';
import type { Period, RevenuePoint, TopProduct, TopCustomer, LowStockProduct } from '@/lib/services/dashboard.service';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
}

export function useDashboard() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalCustomers: 0 });
  const [recentOrders, setRecentOrders] = useState<unknown[]>([]);
  const [channelData, setChannelData] = useState<Record<string, { total: number; delivered: number; returned: number }>>({});
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [period, setPeriod] = useState<Period>('day');
  const [loading, setLoading] = useState(true);

  const periodDays: Record<Period, number> = { day: 30, week: 90, month: 365 };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, r, c, rev, tp, tc, ls] = await Promise.all([
          svc.getOverviewStats(supabase),
          svc.getRecentOrders(supabase),
          svc.getOrdersByChannel(supabase),
          svc.getRevenueByPeriod(supabase, period, periodDays[period]),
          svc.getTopProducts(supabase),
          svc.getTopCustomers(supabase),
          svc.getLowStockProducts(supabase),
        ]);
        setStats(s);
        setRecentOrders(r);
        setChannelData(c);
        setRevenueData(rev);
        setTopProducts(tp);
        setTopCustomers(tc);
        setLowStock(ls);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period, supabase]);

  return {
    stats, recentOrders, channelData,
    revenueData, topProducts, topCustomers, lowStock,
    period, setPeriod, loading,
  };
}
