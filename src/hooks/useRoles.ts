'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { ROLES, ROLE_PERMISSIONS } from '@/lib/constants';
import type { CustomRole, CreateRoleInput, UpdateRoleInput } from '@/lib/services/role.service';
import * as roleService from '@/lib/services/role.service';

const FALLBACK_META: Record<string, { display_name: string; description: string; color: string; icon: string }> = {
  admin: { display_name: 'Quản Trị', description: 'Toàn quyền quản trị hệ thống', color: 'red', icon: 'crown' },
  staff: { display_name: 'Nhân Viên', description: 'Tạo và chỉnh sửa đơn hàng, sản phẩm', color: 'blue', icon: 'user' },
  warehouse: { display_name: 'Kho Vận', description: 'Quản lý kho hàng, tồn kho', color: 'orange', icon: 'home' },
  viewer: { display_name: 'Xem', description: 'Chỉ xem dữ liệu', color: 'default', icon: 'eye' },
};

function buildFallbackRoles(tenantId: string): CustomRole[] {
  return ROLES.map((name) => {
    const meta = FALLBACK_META[name];
    return {
      id: `fallback-${name}`,
      tenant_id: tenantId,
      name,
      display_name: meta.display_name,
      description: meta.description,
      permissions: ROLE_PERMISSIONS[name] || [],
      color: meta.color,
      icon: meta.icon,
      is_system: true,
      created_at: '',
      updated_at: '',
    };
  });
}

export function useRoles() {
  const { profile } = useAuth();
  const [dbRoles, setDbRoles] = useState<CustomRole[] | null>(null);
  const [localRoles, setLocalRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createBrowserClient(), []);
  const tenantId = profile?.tenant_id;

  const fetchRoles = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await roleService.getRoles(supabase, tenantId);
      if (data.length > 0) {
        setDbRoles(data);
        setLocalRoles(data);
      } else {
        setDbRoles(null);
        setLocalRoles(buildFallbackRoles(tenantId));
      }
    } catch {
      setDbRoles(null);
      if (tenantId) setLocalRoles(buildFallbackRoles(tenantId));
    }
    setLoading(false);
  }, [tenantId, supabase]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const usingFallback = dbRoles === null;
  const roles = localRoles;

  const create = async (input: Omit<CreateRoleInput, 'tenant_id'>) => {
    if (!tenantId) return null;
    if (usingFallback) {
      const newRole: CustomRole = {
        id: `local-${Date.now()}`,
        tenant_id: tenantId,
        name: input.name,
        display_name: input.display_name,
        description: input.description || null,
        permissions: input.permissions,
        color: input.color || 'default',
        icon: input.icon || 'user',
        is_system: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocalRoles((prev) => [...prev, newRole]);
      return newRole;
    }
    const role = await roleService.createRole(supabase, { ...input, tenant_id: tenantId });
    await fetchRoles();
    return role;
  };

  const update = async (roleId: string, input: UpdateRoleInput) => {
    if (usingFallback) {
      setLocalRoles((prev) =>
        prev.map((r) => r.id === roleId ? { ...r, ...input } as CustomRole : r)
      );
      return null;
    }
    const role = await roleService.updateRole(supabase, roleId, input);
    await fetchRoles();
    return role;
  };

  const remove = async (roleId: string) => {
    if (usingFallback) {
      setLocalRoles((prev) => prev.filter((r) => r.id !== roleId));
      return;
    }
    await roleService.deleteRole(supabase, roleId);
    await fetchRoles();
  };

  const getRolePermissions = (roleName: string) => {
    const role = roles.find((r) => r.name === roleName);
    return role?.permissions || [];
  };

  return { roles, loading, usingFallback, create, update, remove, refresh: fetchRoles, getRolePermissions };
}
