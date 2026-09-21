import type { SupabaseClient } from '@supabase/supabase-js';
import type { PermissionKey } from '@/lib/constants';

export interface CustomRole {
  id: string;
  tenant_id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: PermissionKey[];
  color: string;
  icon: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleInput {
  tenant_id: string;
  name: string;
  display_name: string;
  description?: string;
  permissions: PermissionKey[];
  color?: string;
  icon?: string;
}

export interface UpdateRoleInput {
  display_name?: string;
  description?: string;
  permissions?: PermissionKey[];
  color?: string;
  icon?: string;
}

export async function getRoles(supabase: SupabaseClient, tenantId: string): Promise<CustomRole[]> {
  const { data, error } = await supabase
    .from('custom_roles')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('is_system', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as CustomRole[];
}

export async function createRole(supabase: SupabaseClient, input: CreateRoleInput): Promise<CustomRole> {
  const { data, error } = await supabase
    .from('custom_roles')
    .insert({
      tenant_id: input.tenant_id,
      name: input.name,
      display_name: input.display_name,
      description: input.description || null,
      permissions: input.permissions,
      color: input.color || 'default',
      icon: input.icon || 'user',
      is_system: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as CustomRole;
}

export async function updateRole(supabase: SupabaseClient, roleId: string, input: UpdateRoleInput): Promise<CustomRole> {
  const { data, error } = await supabase
    .from('custom_roles')
    .update(input)
    .eq('id', roleId)
    .select()
    .single();
  if (error) throw error;
  return data as CustomRole;
}

export async function deleteRole(supabase: SupabaseClient, roleId: string): Promise<void> {
  const { error } = await supabase
    .from('custom_roles')
    .delete()
    .eq('id', roleId)
    .eq('is_system', false);
  if (error) throw error;
}

export async function getRoleByName(supabase: SupabaseClient, tenantId: string, roleName: string): Promise<CustomRole | null> {
  const { data, error } = await supabase
    .from('custom_roles')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('name', roleName)
    .single();
  if (error) return null;
  return data as CustomRole;
}
