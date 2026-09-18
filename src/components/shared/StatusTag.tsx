'use client';

import { Tag } from 'antd';
import { ORDER_STATUSES, PRODUCT_STATUSES } from '@/lib/constants';
import { useLocale } from '@/hooks/useLocale';

export function StatusTag({ status, type = 'order' }: { status: string; type?: 'order' | 'product' }) {
  const { t } = useLocale();
  const list = type === 'order' ? ORDER_STATUSES : PRODUCT_STATUSES;
  const item = list.find((s) => s.value === status);

  return (
    <Tag color={item?.color || 'default'}>
      {item ? t(item.label) : status}
    </Tag>
  );
}
