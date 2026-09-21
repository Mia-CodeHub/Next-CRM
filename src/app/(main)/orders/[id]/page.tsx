'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, Descriptions, Table, Button, Space, Spin, Select, App } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { printInvoice } from '@/lib/utils/invoice';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusTag } from '@/components/shared/StatusTag';
import { ChannelTag } from '@/components/shared/ChannelTag';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import { useChannels } from '@/hooks/useChannels';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useCurrency } from '@/hooks/useCurrency';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { getOrderById, updateOrder } from '@/lib/services/order.service';
import { ORDER_STATUSES } from '@/lib/constants';
import type { Order } from '@/lib/types';
import Link from 'next/link';

export default function OrderDetailPage() {
  const { t } = useLocale();
  const { isAdmin, canEdit } = useRBAC();
  const { profile } = useAuth();
  const { format } = useCurrency();
  const { channelOptions, getChannelLabel } = useChannels();
  const { warehouseOptions, getWarehouseName } = useWarehouses();
  const params = useParams();
  const { message } = App.useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);

  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    getOrderById(supabase, params.id as string).then((data) => {
      setOrder(data as Order);
      setLoading(false);
    });
  }, [params.id, supabase]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from('customers').select('id, name').then(({ data }) => {
      setCustomers((data ?? []) as { id: string; name: string }[]);
    });
  }, [isAdmin, supabase]);

  const handleUpdate = async (field: string, value: string | null) => {
    await updateOrder(supabase, order!.id, { [field]: value } as Partial<Order>);
    const updated = await getOrderById(supabase, order!.id);
    setOrder(updated as Order);
    message.success(t('common.save'));
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!order) return <div>Not found</div>;

  const itemColumns = [
    { title: t('products.name'), dataIndex: 'product_name' },
    { title: 'Qty', dataIndex: 'quantity' },
    { title: t('products.price'), dataIndex: 'unit_price', render: (v: number) => format(v) },
    { title: t('common.total'), dataIndex: 'subtotal', render: (v: number) => format(v) },
  ];

  return (
    <>
      <PageHeader
        title={`${t('orders.code')}: ${order.order_code || order.id.slice(0, 8)}`}
        actions={
          <Space>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => printInvoice(
                {
                  ...order,
                  order_code: order.order_code ?? undefined,
                  notes: order.notes ?? undefined,
                  customer: order.customer as { name?: string; phone?: string; email?: string; address?: string } | null,
                  warehouse: order.warehouse_id ? { name: getWarehouseName(order.warehouse_id) } : null,
                },
                profile?.tenant_id ? 'Next-CRM' : 'Next-CRM'
              )}
            >
              {t('orders.print_invoice')}
            </Button>
            <Link href="/orders"><Button icon={<ArrowLeftOutlined />}>{t('common.back')}</Button></Link>
          </Space>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label={t('orders.customer')}>
            {isAdmin ? (
              <Select
                value={order.customer_id}
                onChange={(v) => handleUpdate('customer_id', v)}
                options={customers.map((c) => ({ value: c.id, label: c.name }))}
                showSearch
                filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
                allowClear
                style={{ width: 200 }}
              />
            ) : (
              (order.customer as { name?: string })?.name || '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('orders.channel')}>
            {isAdmin ? (
              <Select
                value={order.channel_id}
                onChange={(v) => handleUpdate('channel_id', v)}
                options={channelOptions}
                allowClear
                style={{ width: 220 }}
              />
            ) : (
              order.channel_id ? <ChannelTag channel={order.channel_id} /> : '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('warehouse.title')}>
            {isAdmin ? (
              <Select
                value={order.warehouse_id}
                onChange={(v) => handleUpdate('warehouse_id', v)}
                options={warehouseOptions}
                allowClear
                style={{ width: 200 }}
              />
            ) : (
              order.warehouse_id ? getWarehouseName(order.warehouse_id) : '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('orders.status')}>
            {canEdit ? (
              <Select
                value={order.status}
                onChange={(v) => handleUpdate('status', v)}
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
            {format(Number(order.shipping_fee))}
          </Descriptions.Item>
          <Descriptions.Item label={t('orders.discount')}>
            {format(Number(order.discount))}
          </Descriptions.Item>
          <Descriptions.Item label={t('orders.total')}>
            <strong style={{ color: '#10B981', fontSize: 16 }}>{format(Number(order.total))}</strong>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('orders.items')}>
        <Table columns={itemColumns} dataSource={order.items || []} rowKey="id" pagination={false} size="small" />
      </Card>
    </>
  );
}
