'use client';

import { useAuth } from './useAuth';
import type { Role } from '@/lib/supabase/types';

export function useRBAC() {
  const { profile } = useAuth();
  const role: Role = profile?.role ?? 'viewer';

  return {
    role,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
    canCreate: role === 'admin' || role === 'staff',
    canEdit: role === 'admin' || role === 'staff',
    canDelete: role === 'admin',
  };
}
