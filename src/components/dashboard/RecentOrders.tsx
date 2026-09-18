'use client';

import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { StatusTag } from '@/components/shared/StatusTag';
import { ChannelTag } from '@/components/shared/ChannelTag';
import { useLocale } from '@/hooks/useLocale';
import Link from 'next/link';

interface OrderRow {
  id: string;
  order_code?: string;
  channel_id: string;
  status: string;
  total: number;
  customer?: { name?: string } | null;
}

interface Props {
  orders: unknown[];
  loading: boolean;
}

export function RecentOrders({ orders, loading }: Props) {
  const { t } = useLocale();

  const columns: ColumnsType<OrderRow> = [
    { title: t('orders.code'), dataIndex: 'order_code', render: (v, r) => <Link href={`/orders/${r.id}`}>{v || r.id.slice(0, 8)}</Link> },
    { title: t('orders.customer'), key: 'customer', render: (_, r) => r.customer?.name || '-' },
    { title: t('orders.channel'), dataIndex: 'channel_id', render: (v) => <ChannelTag channel={v} /> },
    { title: t('orders.status'), dataIndex: 'status', render: (v) => <StatusTag status={v} /> },
    { title: t('orders.total'), dataIndex: 'total', render: (v) => v?.toLocaleString('vi-VN') + ' đ' },
  ];

  return (
    <Card title={t('dashboard.recent_orders')} style={{ marginTop: 16 }}>
      <Table columns={columns} dataSource={orders as OrderRow[]} rowKey="id" loading={loading} pagination={false} size="small" />
    </Card>
  );
}
