'use client';

import { Tag } from 'antd';
import { CHANNELS } from '@/lib/constants';

export function ChannelTag({ channel }: { channel: string }) {
  const item = CHANNELS.find((c) => c.value === channel);
  return (
    <Tag color={item?.color || 'default'} style={{ borderRadius: 4 }}>
      {item?.label || channel}
    </Tag>
  );
}
