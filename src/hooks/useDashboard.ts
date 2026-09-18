'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import * as svc from '@/lib/services/dashboard.service';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
}

export function useDashboard() {
  const supabase = createBrowserClient();
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalCustomers: 0 });
  const [recentOrders, setRecentOrders] = useState<unknown[]>([]);
  const [channelData, setChannelData] = useState<Record<string, { total: number; delivered: number; returned: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, r, c] = await Promise.all([
          svc.getOverviewStats(supabase),
          svc.getRecentOrders(supabase),
          svc.getOrdersByChannel(supabase),
        ]);
        setStats(s);
        setRecentOrders(r);
        setChannelData(c);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { stats, recentOrders, channelData, loading };
}
