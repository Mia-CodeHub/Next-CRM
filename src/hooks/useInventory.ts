'use client';

import { useState, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import * as svc from '@/lib/services/inventory.service';
import type { InventoryItem } from '@/lib/services/inventory.service';

export function useInventory() {
  const { profile } = useAuth();
  const supabase = useMemo(() => createBrowserClient(), []);
  const tenantId = profile?.tenant_id;
  const [inventoryByWarehouse, setInventoryByWarehouse] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchByProduct = useCallback(async (productId: string) => {
    try {
      return await svc.getInventoryByProduct(supabase, productId);
    } catch {
      return [];
    }
  }, [supabase]);

  const fetchByWarehouse = useCallback(async (warehouseId: string) => {
    setLoading(true);
    try {
      const data = await svc.getInventoryByWarehouse(supabase, warehouseId);
      setInventoryByWarehouse(data);
    } catch {
      setInventoryByWarehouse([]);
    }
    setLoading(false);
  }, [supabase]);

  const saveInventory = useCallback(async (
    productId: string,
    entries: { warehouse_id: string; quantity: number }[],
    removedWarehouseIds: string[] = []
  ) => {
    if (!tenantId) return;
    if (removedWarehouseIds.length > 0) {
      await svc.deleteInventoryForProduct(supabase, productId, removedWarehouseIds);
    }
    if (entries.length > 0) {
      await svc.upsertInventory(supabase, tenantId, productId, entries);
    }
  }, [tenantId, supabase]);

  return {
    fetchByProduct,
    fetchByWarehouse,
    saveInventory,
    inventoryByWarehouse,
    loading,
  };
}
