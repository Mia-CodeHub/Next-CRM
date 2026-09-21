'use client';

import { Table, Input, Select, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { StatusTag } from '@/components/shared/StatusTag';
import { ChannelTag } from '@/components/shared/ChannelTag';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import { useChannels } from '@/hooks/useChannels';
import { useCurrency } from '@/hooks/useCurrency';
import { ORDER_STATUSES } from '@/lib/constants';
import type { Order, OrderFilters, PaginationParams } from '@/lib/types';
import Link from 'next/link';

interface Props {
  orders: Order[];
  loading: boolean;
  total: number;
  filters: OrderFilters;
  setFilters: (f: OrderFilters) => void;
  pagination: PaginationParams;
  setPagination: (p: PaginationParams) => void;
  onDelete: (id: string) => void;
}

export function OrderTable({ orders, loading, total, filters, setFilters, pagination, setPagination, onDelete }: Props) {
  const { t } = useLocale();
  const { canDelete } = useRBAC();
  const { channelOptions } = useChannels();
  const { format } = useCurrency();

  const columns = [
    { title: t('orders.code'), dataIndex: 'order_code', key: 'code', render: (v: string, r: Order) => <Link href={`/orders/${r.id}`}>{v || r.id.slice(0, 8)}</Link> },
    { title: t('orders.customer'), key: 'customer', render: (_: unknown, r: Order) => (r.customer as { name?: string })?.name || '-' },
    { title: t('orders.channel'), dataIndex: 'channel_id', key: 'channel', render: (v: string) => <ChannelTag channel={v} /> },
    { title: t('orders.status'), dataIndex: 'status', key: 'status', render: (v: string) => <StatusTag status={v} /> },
    { title: t('orders.total'), dataIndex: 'total', key: 'total', render: (v: number) => format(v) },
    { title: t('orders.date'), dataIndex: 'ordered_at', key: 'date', render: (v: string) => new Date(v).toLocaleDateString('vi-VN') },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, record: Order) => (
        <Space>
          <Link href={`/orders/${record.id}`}><Button type="link" icon={<EyeOutlined />} /></Link>
          {canDelete && (
            <Popconfirm title={t('common.confirm_delete')} onConfirm={() => onDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search placeholder={t('common.search')} onSearch={(v) => setFilters({ ...filters, search: v })} allowClear style={{ width: 250 }} />
        <Select
          options={ORDER_STATUSES.map((s) => ({ value: s.value, label: t(s.label) }))}
          onChange={(v) => setFilters({ ...filters, status: v })}
          allowClear
          placeholder={t('orders.status')}
          style={{ width: 150 }}
        />
        <Select
          options={channelOptions}
          onChange={(v) => setFilters({ ...filters, channel: v })}
          allowClear
          placeholder={t('orders.channel')}
          style={{ width: 200 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total,
          onChange: (page, pageSize) => setPagination({ page, pageSize }),
          showSizeChanger: true,
        }}
        size="small"
        scroll={{ x: 900 }}
      />
    </>
  );
}
