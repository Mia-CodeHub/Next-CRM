'use client';

import { Table, Input, Select, Space, Button, Popconfirm, Avatar, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, AppstoreOutlined, QrcodeOutlined, ScanOutlined } from '@ant-design/icons';
import { StatusTag } from '@/components/shared/StatusTag';
import { ChannelTag } from '@/components/shared/ChannelTag';
import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay';
import { BarcodeScanner } from '@/components/shared/BarcodeScanner';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import { useChannels } from '@/hooks/useChannels';
import { useCurrency } from '@/hooks/useCurrency';
import { PRODUCT_STATUSES } from '@/lib/constants';
import type { Product, ProductFilters, PaginationParams } from '@/lib/types';
import { useState } from 'react';

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
  const { channelOptions } = useChannels();
  const { format } = useCurrency();
  const [qrProduct, setQrProduct] = useState<Product | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  const handleScan = (code: string) => {
    setFilters({ ...filters, search: code });
  };

  const columns = [
    {
      title: t('products.name'),
      key: 'name',
      render: (_: unknown, r: Product) => (
        <Space>
          <Avatar
            shape="square"
            size={36}
            src={r.image_url}
            icon={!r.image_url && <AppstoreOutlined />}
            style={{ backgroundColor: r.image_url ? undefined : '#f0f0f0', color: '#999' }}
          />
          {r.name}
        </Space>
      ),
    },
    { title: t('products.sku'), dataIndex: 'sku', key: 'sku' },
    { title: t('products.price'), dataIndex: 'price', key: 'price', render: (v: number) => format(v) },
    { title: t('products.stock'), dataIndex: 'stock', key: 'stock' },
    { title: t('orders.channel'), dataIndex: 'channel_id', key: 'channel', render: (v: string) => v ? <ChannelTag channel={v} /> : '-' },
    { title: t('products.status'), dataIndex: 'status', key: 'status', render: (v: string) => <StatusTag status={v} type="product" /> },
    {
      title: 'QR',
      key: 'qr',
      width: 50,
      render: (_: unknown, record: Product) => (
        <Tooltip title={t('barcode.qr_code')}>
          <Button type="text" size="small" icon={<QrcodeOutlined />} onClick={() => setQrProduct(record)} />
        </Tooltip>
      ),
    },
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
        <Button icon={<ScanOutlined />} onClick={() => setScanOpen(true)}>
          {t('barcode.scan')}
        </Button>
        <Select
          options={PRODUCT_STATUSES.map((s) => ({ value: s.value, label: t(s.label) }))}
          onChange={(v) => setFilters({ ...filters, status: v })}
          allowClear
          placeholder={t('products.status')}
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
      <QRCodeDisplay
        open={!!qrProduct}
        onClose={() => setQrProduct(null)}
        value={qrProduct?.sku || qrProduct?.id || ''}
        label={qrProduct?.name}
        sublabel={qrProduct?.sku ? `SKU: ${qrProduct.sku}` : undefined}
      />
      <BarcodeScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={handleScan}
      />
    </>
  );
}
