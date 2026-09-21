'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import * as svc from '@/lib/services/warehouse.service';
import type { Warehouse } from '@/lib/types';

export function useWarehouses() {
  const { profile } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createBrowserClient(), []);
  const tenantId = profile?.tenant_id;

  const fetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await svc.getWarehouses(supabase, tenantId);
      setWarehouses(data as Warehouse[]);
    } catch {
      setWarehouses([]);
    }
    setLoading(false);
  }, [tenantId, supabase]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (values: { name: string; address?: string; phone?: string }) => {
    if (!tenantId) return;
    await svc.createWarehouse(supabase, tenantId, values);
    await fetch();
  };

  const edit = async (id: string, values: { name?: string; address?: string; phone?: string; is_active?: boolean }) => {
    await svc.updateWarehouse(supabase, id, values);
    await fetch();
  };

  const remove = async (id: string) => {
    await svc.deleteWarehouse(supabase, id);
    await fetch();
  };

  const warehouseOptions = warehouses
    .filter((w) => w.is_active)
    .map((w) => ({ value: w.id, label: w.name }));

  const getWarehouseName = (id: string) => {
    return warehouses.find((w) => w.id === id)?.name ?? id;
  };

  return { warehouses, loading, add, edit, remove, warehouseOptions, getWarehouseName, refresh: fetch };
}
