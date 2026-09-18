'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import * as svc from '@/lib/services/customer.service';
import type { Customer, CustomerFilters } from '@/lib/types';

export function useCustomers() {
  const supabase = createBrowserClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, total } = await svc.getCustomers(supabase, filters, pagination);
      setCustomers(data);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    customers, loading, total, filters, setFilters, pagination, setPagination, refetch: fetch,
    create: async (data: Partial<Customer>) => { await svc.createCustomer(supabase, data); await fetch(); },
    update: async (id: string, data: Partial<Customer>) => { await svc.updateCustomer(supabase, id, data); await fetch(); },
    remove: async (id: string) => { await svc.deleteCustomer(supabase, id); await fetch(); },
  };
}
