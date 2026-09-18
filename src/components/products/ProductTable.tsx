'use client';

import { Table, Input, Select, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { StatusTag } from '@/components/shared/StatusTag';
import { ChannelTag } from '@/components/shared/ChannelTag';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import { CHANNELS, PRODUCT_STATUSES } from '@/lib/constants';
import type { Product, ProductFilters, PaginationParams } from '@/lib/types';

interface Props {
  products: Product[];
  loading: boolean;
  total: number;
  filters: ProductFilters;
  setFilters: (f: ProductFilters) => void;
  pagination: PaginationParams;
  setPagination: (p: PaginationParams) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({ products, loading, total, filters, setFilters, pagination, setPagination, onEdit, onDelete }: Props) {
  const { t } = useLocale();
  const { canEdit, canDelete } = useRBAC();

  const columns = [
    { title: t('products.name'), dataIndex: 'name', key: 'name' },
    { title: t('products.sku'), dataIndex: 'sku', key: 'sku' },
    { title: t('products.price'), dataIndex: 'price', key: 'price', render: (v: number) => v?.toLocaleString('vi-VN') + ' đ' },
    { title: t('products.stock'), dataIndex: 'stock', key: 'stock' },
    { title: t('orders.channel'), dataIndex: 'channel_id', key: 'channel', render: (v: string) => v ? <ChannelTag channel={v} /> : '-' },
    { title: t('products.status'), dataIndex: 'status', key: 'status', render: (v: string) => <StatusTag status={v} type="product" /> },
    ...(canEdit || canDelete ? [{
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, record: Product) => (
        <Space>
          {canEdit && <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />}
          {canDelete && (
            <Popconfirm title={t('common.confirm_delete')} onConfirm={() => onDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    }] : []),
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search placeholder={t('common.search')} onSearch={(v) => setFilters({ ...filters, search: v })} allowClear style={{ width: 250 }} />
        <Select
          options={PRODUCT_STATUSES.map((s) => ({ value: s.value, label: t(s.label) }))}
          onChange={(v) => setFilters({ ...filters, status: v })}
          allowClear
          placeholder={t('products.status')}
          style={{ width: 150 }}
        />
        <Select
          options={CHANNELS.map((c) => ({ value: c.value, label: c.label }))}
          onChange={(v) => setFilters({ ...filters, channel: v })}
          allowClear
          placeholder={t('orders.channel')}
          style={{ width: 150 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total,
          onChange: (page, pageSize) => setPagination({ page, pageSize }),
          showSizeChanger: true,
          showTotal: (t) => `${t} ${t === 1 ? 'item' : 'items'}`,
        }}
        size="small"
        scroll={{ x: 800 }}
      />
    </>
  );
}
