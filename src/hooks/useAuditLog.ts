'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { getAuditLogs, type AuditLog, type AuditFilters } from '@/lib/services/audit.service';

export function useAuditLog() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAuditLogs(supabase, filters, page, pageSize);
      setLogs(result.data);
      setTotal(result.total);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [supabase, filters, page, pageSize]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { logs, total, loading, filters, setFilters, page, setPage, pageSize, setPageSize, refresh: fetch };
}
