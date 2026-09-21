'use client';

import { Tag } from 'antd';
import { useChannels } from '@/hooks/useChannels';

export function ChannelTag({ channel }: { channel: string }) {
  const { getChannelLabel, getChannelColor } = useChannels();
  return (
    <Tag color={getChannelColor(channel)} style={{ borderRadius: 4 }}>
      {getChannelLabel(channel)}
    </Tag>
  );
}
