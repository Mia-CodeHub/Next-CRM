'use client';

import { useEffect, useState } from 'react';
import { Card, Descriptions, Table, Tag, Button, Space, Spin, Select, App } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusTag } from '@/components/shared/StatusTag';
import { ChannelTag } from '@/components/shared/ChannelTag';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { getOrderById, updateOrder } from '@/lib/services/order.service';
import { ORDER_STATUSES } from '@/lib/constants';
import type { Order } from '@/lib/types';
import Link from 'next/link';

export default function OrderDetailPage() {
  const { t } = useLocale();
  const { canEdit } = useRBAC();
  const params = useParams();
  const { message } = App.useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient();

  useEffect(() => {
    getOrderById(supabase, params.id as string).then((data) => {
      setOrder(data as Order);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleStatusChange = async (status: string) => {
    await updateOrder(supabase, order!.id, { status: status as Order['status'] });
    setOrder({ ...order!, status: status as Order['status'] });
    message.success(t('common.save'));
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!order) return <div>Not found</div>;

  const itemColumns = [
    { title: t('products.name'), dataIndex: 'product_name' },
    { title: 'Qty', dataIndex: 'quantity' },
    { title: t('products.price'), dataIndex: 'unit_price', render: (v: number) => v?.toLocaleString('vi-VN') + ' đ' },
    { title: t('common.total'), dataIndex: 'subtotal', render: (v: number) => v?.toLocaleString('vi-VN') + ' đ' },
  ];

  return (
    <>
      <PageHeader
        title={`${t('orders.code')}: ${order.order_code || order.id.slice(0, 8)}`}
        actions={<Link href="/orders"><Button icon={<ArrowLeftOutlined />}>{t('common.back')}</Button></Link>}
      />

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label={t('orders.customer')}>
            {(order.customer as { name?: string })?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('orders.channel')}>
            <ChannelTag channel={order.channel_id} />
          </Descriptions.Item>
          <Descriptions.Item label={t('orders.status')}>
            {canEdit ? (
              <Select
                value={order.status}
                onChange={handleStatusChange}
                options={ORDER_STATUSES.map((s) => ({ value: s.value, label: t(s.label) }))}
                style={{ width: 150 }}
              />
            ) : (
              <StatusTag status={order.status} />
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('orders.date')}>
            {new Date(order.ordered_at).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label={t('orders.shipping_fee')}>
            {Number(order.shipping_fee).toLocaleString('vi-VN')} đ
          </Descriptions.Item>
          <Descriptions.Item label={t('orders.discount')}>
            {Number(order.discount).toLocaleString('vi-VN')} đ
          </Descriptions.Item>
          <Descriptions.Item label={t('orders.total')}>
            <strong style={{ color: '#39FF14', fontSize: 16 }}>{Number(order.total).toLocaleString('vi-VN')} đ</strong>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('orders.items')}>
        <Table columns={itemColumns} dataSource={order.items || []} rowKey="id" pagination={false} size="small" />
      </Card>
    </>
  );
}
