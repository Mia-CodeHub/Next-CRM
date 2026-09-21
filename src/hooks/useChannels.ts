'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import * as svc from '@/lib/services/channel.service';

export interface ChannelTypeItem {
  id: string;
  tenant_id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
}

export interface ChannelItem {
  id: string;
  tenant_id: string;
  channel_type_id: string;
  name: string;
  url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  channel_type?: { id: string; name: string; color: string; icon: string | null } | null;
}

export function useChannels() {
  const { profile } = useAuth();
  const [channelTypes, setChannelTypes] = useState<ChannelTypeItem[]>([]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createBrowserClient(), []);
  const tenantId = profile?.tenant_id;

  const fetchAll = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [types, chs] = await Promise.all([
        svc.getChannelTypes(supabase, tenantId),
        svc.getChannels(supabase, tenantId),
      ]);
      setChannelTypes(types as ChannelTypeItem[]);
      setChannels(chs as ChannelItem[]);
    } catch {
      setChannelTypes([]);
      setChannels([]);
    }
    setLoading(false);
  }, [tenantId, supabase]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addChannelType = async (values: { name: string; color?: string; icon?: string }) => {
    if (!tenantId) return;
    await svc.createChannelType(supabase, tenantId, values);
    await fetchAll();
  };

  const editChannelType = async (id: string, values: { name?: string; color?: string; icon?: string }) => {
    await svc.updateChannelType(supabase, id, values);
    await fetchAll();
  };

  const removeChannelType = async (id: string) => {
    await svc.deleteChannelType(supabase, id);
    await fetchAll();
  };

  const addChannel = async (values: { channel_type_id: string; name: string; url?: string; notes?: string }) => {
    if (!tenantId) return;
    await svc.createChannel(supabase, tenantId, values);
    await fetchAll();
  };

  const editChannel = async (id: string, values: { name?: string; url?: string; notes?: string; is_active?: boolean }) => {
    await svc.updateChannel(supabase, id, values);
    await fetchAll();
  };

  const removeChannel = async (id: string) => {
    await svc.deleteChannel(supabase, id);
    await fetchAll();
  };

  const channelOptions = channels
    .filter((c) => c.is_active)
    .map((c) => ({
      value: c.id,
      label: `${c.channel_type?.name ?? ''} — ${c.name}`,
      color: c.channel_type?.color ?? '#10B981',
    }));

  const getChannelLabel = (channelId: string) => {
    const ch = channels.find((c) => c.id === channelId);
    if (!ch) return channelId;
    return `${ch.channel_type?.name ?? ''} — ${ch.name}`;
  };

  const getChannelColor = (channelId: string) => {
    const ch = channels.find((c) => c.id === channelId);
    return ch?.channel_type?.color ?? '#10B981';
  };

  return {
    channelTypes, channels, loading,
    addChannelType, editChannelType, removeChannelType,
    addChannel, editChannel, removeChannel,
    channelOptions, getChannelLabel, getChannelColor,
    refresh: fetchAll,
  };
}
