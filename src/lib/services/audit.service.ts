import type { SupabaseClient } from '@supabase/supabase-js';

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string | null;
  user_name: string | null;
  action: 'create' | 'update' | 'delete';
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditFilters {
  entity_type?: string;
  action?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getAuditLogs(
  supabase: SupabaseClient,
  filters: AuditFilters,
  page: number,
  pageSize: number
) {
  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' });

  if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
  if (filters.action) query = query.eq('action', filters.action);
  if (filters.search) query = query.or(`entity_label.ilike.%${filters.search}%,user_name.ilike.%${filters.search}%`);
  if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
  if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: (data ?? []) as AuditLog[], total: count ?? 0 };
}
