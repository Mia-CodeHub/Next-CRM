'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CURRENCIES, formatCurrency, type CurrencyConfig } from '@/lib/utils/currency';

export function useCurrency() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const { profile } = useAuth();
  const [currencyCode, setCurrencyCode] = useState('VND');

  useEffect(() => {
    if (!profile?.tenant_id) return;
    supabase
      .from('tenants')
      .select('settings')
      .eq('id', profile.tenant_id)
      .single()
      .then(({ data }) => {
        const settings = (data?.settings || {}) as { currency?: string };
        if (settings.currency) setCurrencyCode(settings.currency);
      });
  }, [profile?.tenant_id, supabase]);

  const saveCurrency = useCallback(async (code: string) => {
    if (!profile?.tenant_id) return;
    const { data: current } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', profile.tenant_id)
      .single();

    const currentSettings = (current?.settings || {}) as Record<string, unknown>;
    await supabase
      .from('tenants')
      .update({ settings: { ...currentSettings, currency: code } })
      .eq('id', profile.tenant_id);

    setCurrencyCode(code);
  }, [profile?.tenant_id, supabase]);

  const format = useCallback((amount: number) => {
    return formatCurrency(amount, currencyCode);
  }, [currencyCode]);

  const currentCurrency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  return {
    currencyCode,
    currentCurrency,
    currencies: CURRENCIES,
    setCurrency: saveCurrency,
    format,
  };
}
