'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import type { Role } from '@/lib/supabase/types';
import * as teamService from '@/lib/services/team.service';

export interface TeamMember {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface Invite {
  id: string;
  tenant_id: string;
  email: string | null;
  role: Role;
  invite_code: string;
  created_at: string;
}

export function useTeam() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createBrowserClient(), []);
  const tenantId = profile?.tenant_id;

  const fetchMembers = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await teamService.getTeamMembers(supabase, tenantId);
      setMembers(data as TeamMember[]);
    } catch {
      setMembers([]);
    }
    setLoading(false);
  }, [tenantId, supabase]);

  const fetchInvites = useCallback(async () => {
    if (!tenantId) return;
    try {
      const data = await teamService.getInvites(supabase, tenantId);
      setInvites(data as Invite[]);
    } catch {
      setInvites([]);
    }
  }, [tenantId, supabase]);

  useEffect(() => {
    fetchMembers();
    fetchInvites();
  }, [fetchMembers, fetchInvites]);

  const changeRole = async (memberId: string, role: Role) => {
    await teamService.updateMemberRole(supabase, memberId, role);
    await fetchMembers();
  };

  const remove = async (memberId: string) => {
    await teamService.removeMember(supabase, memberId);
    await fetchMembers();
  };

  const createInvite = async (role: Role, email?: string) => {
    if (!profile) return null;
    const invite = await teamService.createInvite(supabase, profile.tenant_id, role, profile.id, email);
    await fetchInvites();
    return invite;
  };

  const removeInvite = async (inviteId: string) => {
    await teamService.deleteInvite(supabase, inviteId);
    await fetchInvites();
  };

  return { members, invites, loading, changeRole, remove, createInvite, removeInvite, refresh: fetchMembers };
}
