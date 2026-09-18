'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import * as svc from '@/lib/services/order.service';
import type { Order, OrderItem, OrderFilters } from '@/lib/types';

export function useOrders() {
  const supabase = createBrowserClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, total } = await svc.getOrders(supabase, filters, pagination);
      setOrders(data);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    orders, loading, total, filters, setFilters, pagination, setPagination, refetch: fetch,
    create: async (order: Partial<Order>, items: Partial<OrderItem>[]) => {
      await svc.createOrder(supabase, order, items);
      await fetch();
    },
    update: async (id: string, data: Partial<Order>) => { await svc.updateOrder(supabase, id, data); await fetch(); },
    remove: async (id: string) => { await svc.deleteOrder(supabase, id); await fetch(); },
  };
}
