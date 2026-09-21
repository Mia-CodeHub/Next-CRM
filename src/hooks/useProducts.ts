'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import * as svc from '@/lib/services/product.service';
import type { Product, ProductFilters } from '@/lib/types';

export function useProducts() {
  const supabase = createBrowserClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, total } = await svc.getProducts(supabase, filters, pagination);
      setProducts(data);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    products, loading, total, filters, setFilters, pagination, setPagination, refetch: fetch,
    create: async (data: Partial<Product>) => { await svc.createProduct(supabase, data); await fetch(); },
    createAndReturn: async (data: Partial<Product>) => { const p = await svc.createProduct(supabase, data); await fetch(); return p; },
    update: async (id: string, data: Partial<Product>) => { await svc.updateProduct(supabase, id, data); await fetch(); },
    remove: async (id: string) => { await svc.deleteProduct(supabase, id); await fetch(); },
  };
}
