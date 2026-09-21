'use client';

import { useState, useEffect, useMemo } from 'react';
import { Table, Card, Statistic, Row, Col, Empty } from 'antd';
import { ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';
import { StatusTag } from '@/components/shared/StatusTag';
import { useLocale } from '@/hooks/useLocale';
import { useCurrency } from '@/hooks/useCurrency';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Props {
  customerId: string;
  customerName: string;
}

interface OrderRow {
  id: string;
  order_code: string | null;
  status: string;
  total: number;
  ordered_at: string;
}

export function CustomerOrderHistory({ customerId, customerName }: Props) {
  const { t } = useLocale();
  const { format } = useCurrency();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('orders')
      .select('id, order_code, status, total, ordered_at')
      .eq('customer_id', customerId)
      .order('ordered_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setOrders((data ?? []) as OrderRow[]);
        setLoading(false);
      });
  }, [customerId, supabase]);

  const totalSpent = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0);

  return (
    <Card title={`${t('customers.order_history')} — ${customerName}`} size="small" style={{ marginTop: 12 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Statistic
            title={t('dashboard.order_count')}
            value={orders.length}
            prefix={<ShoppingCartOutlined />}
            valueStyle={{ fontSize: 18 }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={t('dashboard.total_spent')}
            value={format(totalSpent)}
            prefix={<DollarOutlined />}
            valueStyle={{ fontSize: 18, color: '#10B981' }}
          />
        </Col>
      </Row>

      {orders.length === 0 && !loading ? (
        <Empty description={t('customers.no_orders')} />
      ) : (
        <Table
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
          columns={[
            {
              title: t('orders.code'),
              dataIndex: 'order_code',
              render: (v: string, r: OrderRow) => (
                <Link href={`/orders/${r.id}`}>{v || r.id.slice(0, 8)}</Link>
              ),
            },
            {
              title: t('orders.status'),
              dataIndex: 'status',
              render: (v: string) => <StatusTag status={v} />,
            },
            {
              title: t('orders.total'),
              dataIndex: 'total',
              align: 'right' as const,
              render: (v: number) => format(Number(v)),
            },
            {
              title: t('orders.date'),
              dataIndex: 'ordered_at',
              render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
            },
          ]}
        />
      )}
    </Card>
  );
}
