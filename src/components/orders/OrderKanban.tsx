'use client';

import { Card, Tag, Space, Typography, Badge, Empty } from 'antd';
import { useLocale } from '@/hooks/useLocale';
import { useChannels } from '@/hooks/useChannels';
import { useCurrency } from '@/hooks/useCurrency';
import { ORDER_STATUSES } from '@/lib/constants';
import type { Order } from '@/lib/types';
import Link from 'next/link';

const { Text } = Typography;

interface Props {
  orders: Order[];
  loading: boolean;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#8c8c8c',
  confirmed: '#1890ff',
  shipping: '#faad14',
  delivered: '#10B981',
  cancelled: '#ff4d4f',
  returned: '#eb2f96',
};

export function OrderKanban({ orders, loading, onStatusChange }: Props) {
  const { t } = useLocale();
  const { getChannelLabel } = useChannels();
  const { format } = useCurrency();

  const columns = ORDER_STATUSES.map((s) => ({
    key: s.value,
    label: t(s.label),
    color: STATUS_COLORS[s.value],
    orders: orders.filter((o) => o.status === s.value),
  }));

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (orderId) onStatusChange(orderId, status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="kanban-board" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
      {columns.map((col) => (
        <div
          key={col.key}
          className="kanban-column"
          onDrop={(e) => handleDrop(e, col.key)}
          onDragOver={handleDragOver}
          style={{
            minWidth: 240,
            flex: '1 0 240px',
            background: 'rgba(0,0,0,0.02)',
            borderRadius: 12,
            padding: 8,
          }}
        >
          <div style={{ padding: '8px 8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge color={col.color} />
            <Text strong style={{ fontSize: 13 }}>{col.label}</Text>
            <Tag style={{ marginLeft: 'auto', fontSize: 11 }}>{col.orders.length}</Tag>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100 }}>
            {col.orders.length === 0 && (
              <Empty description={false} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '20px 0' }} />
            )}
            {col.orders.map((order) => (
              <Card
                key={order.id}
                size="small"
                draggable
                onDragStart={(e) => handleDragStart(e, order.id)}
                style={{
                  cursor: 'grab',
                  borderLeft: `3px solid ${col.color}`,
                  borderRadius: 8,
                }}
                styles={{ body: { padding: '8px 12px' } }}
              >
                <Link href={`/orders/${order.id}`} style={{ color: 'inherit' }}>
                  <Text strong style={{ fontSize: 13 }}>
                    {order.order_code || order.id.slice(0, 8)}
                  </Text>
                </Link>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                  {(order.customer as { name?: string })?.name || '-'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(order.ordered_at).toLocaleDateString('vi-VN')}
                  </Text>
                  <Text strong style={{ fontSize: 12, color: '#10B981' }}>
                    {format(Number(order.total))}
                  </Text>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
