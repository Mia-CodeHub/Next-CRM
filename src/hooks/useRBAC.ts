'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { ROLE_PERMISSIONS, type PermissionKey } from '@/lib/constants';
import type { Role } from '@/lib/supabase/types';

export function useRBAC() {
  const { profile } = useAuth();
  const role: Role = profile?.role ?? 'viewer';
  const tenantId = profile?.tenant_id;
  const supabase = useMemo(() => createBrowserClient(), []);
  const [dbPermissions, setDbPermissions] = useState<PermissionKey[] | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!tenantId || !role) return;
    try {
      const { data } = await supabase
        .from('custom_roles')
        .select('permissions')
        .eq('tenant_id', tenantId)
        .eq('name', role)
        .single();
      if (data?.permissions) {
        setDbPermissions(data.permissions as PermissionKey[]);
      }
    } catch {
      // Table may not exist yet — fall back to hardcoded
    }
  }, [tenantId, role, supabase]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const permissions: PermissionKey[] = dbPermissions ?? ROLE_PERMISSIONS[role] ?? [];

  const hasPermission = (perm: PermissionKey) => permissions.includes(perm);

  return {
    role,
    permissions,
    hasPermission,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
    isWarehouse: role === 'warehouse',
    canCreate: hasPermission('orders.create') || hasPermission('products.create') || hasPermission('customers.create'),
    canEdit: hasPermission('orders.edit') || hasPermission('products.edit') || hasPermission('customers.edit'),
    canDelete: hasPermission('orders.delete') || hasPermission('products.delete') || hasPermission('customers.delete'),
    canManageWarehouse: hasPermission('warehouses.manage'),
  };
}
