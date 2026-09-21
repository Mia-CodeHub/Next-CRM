import type { SupabaseClient } from '@supabase/supabase-js';
import type { Role } from '@/lib/supabase/types';

export async function getTeamMembers(supabase: SupabaseClient, tenantId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const memberIds = (data || []).map((m) => m.id);
  let users: { id: string; email: string }[] | null = null;
  try {
    const rpcResult = await supabase.rpc('get_team_emails', { member_ids: memberIds });
    users = rpcResult.data;
  } catch {
    // RPC function may not exist yet
  }

  return (data || []).map((m) => ({
    ...m,
    email: users?.find((u: { id: string; email: string }) => u.id === m.id)?.email || null,
  }));
}

export async function updateMemberRole(supabase: SupabaseClient, memberId: string, role: Role) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', memberId);
  if (error) throw error;
}

export async function removeMember(supabase: SupabaseClient, memberId: string) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', memberId);
  if (error) throw error;
}

export async function createInvite(supabase: SupabaseClient, tenantId: string, role: Role, createdBy: string, email?: string) {
  const code = crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
  const { data, error } = await supabase
    .from('invites')
    .insert({ tenant_id: tenantId, role, invite_code: code, created_by: createdBy, email })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getInvites(supabase: SupabaseClient, tenantId: string) {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('used_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteInvite(supabase: SupabaseClient, inviteId: string) {
  const { error } = await supabase
    .from('invites')
    .delete()
    .eq('id', inviteId);
  if (error) throw error;
}

export async function getInviteByCode(supabase: SupabaseClient, code: string) {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .is('used_at', null)
    .single();
  if (error) return null;
  return data;
}

export async function markInviteUsed(supabase: SupabaseClient, inviteId: string) {
  const { error } = await supabase
    .from('invites')
    .update({ used_at: new Date().toISOString() })
    .eq('id', inviteId);
  if (error) throw error;
}

export async function updateProfile(supabase: SupabaseClient, userId: string, data: { full_name?: string }) {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);
  if (error) throw error;
}
