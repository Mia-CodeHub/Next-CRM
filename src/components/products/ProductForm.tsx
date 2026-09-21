'use client';

import { Form, Input, InputNumber, Select, Card, Space, Button, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { useChannels } from '@/hooks/useChannels';
import { useWarehouses } from '@/hooks/useWarehouses';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { PRODUCT_STATUSES } from '@/lib/constants';
import type { Product } from '@/lib/types';
import { useEffect } from 'react';

const { Text } = Typography;

interface InventoryEntry {
  warehouse_id: string;
  quantity: number;
}

interface Props {
  form: ReturnType<typeof Form.useForm>[0];
  product?: Product | null;
  inventoryEntries: InventoryEntry[];
  onInventoryChange: (entries: InventoryEntry[]) => void;
}

export function ProductForm({ form, product, inventoryEntries, onInventoryChange }: Props) {
  const { t } = useLocale();
  const { channelOptions } = useChannels();
  const { warehouseOptions } = useWarehouses();

  useEffect(() => {
    if (product) form.setFieldsValue(product);
    else form.resetFields();
  }, [product, form]);

  const addEntry = () => {
    const usedIds = inventoryEntries.map((e) => e.warehouse_id);
    const available = warehouseOptions.find((w) => !usedIds.includes(w.value));
    if (!available) return;
    onInventoryChange([...inventoryEntries, { warehouse_id: available.value, quantity: 0 }]);
  };

  const removeEntry = (idx: number) => {
    onInventoryChange(inventoryEntries.filter((_, i) => i !== idx));
  };

  const updateEntry = (idx: number, field: 'warehouse_id' | 'quantity', value: string | number) => {
    const next = [...inventoryEntries];
    next[idx] = { ...next[idx], [field]: value };
    onInventoryChange(next);
  };

  const totalStock = inventoryEntries.reduce((sum, e) => sum + (e.quantity || 0), 0);

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="image_url" label={t('image.product_image')}>
        <ImageUploader bucket="products" folder="images" />
      </Form.Item>
      <Form.Item name="name" label={t('products.name')} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="sku" label={t('products.sku')}>
        <Input />
      </Form.Item>
      <Form.Item name="price" label={t('products.price')} rules={[{ required: true }]}>
        <InputNumber style={{ width: '100%' }} min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
      </Form.Item>
      <Form.Item name="cost" label={t('products.cost')}>
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item name="channel_id" label={t('orders.channel')}>
        <Select options={channelOptions} allowClear />
      </Form.Item>
      <Form.Item name="status" label={t('products.status')} initialValue="active">
        <Select options={PRODUCT_STATUSES.map((s) => ({ value: s.value, label: t(s.label) }))} />
      </Form.Item>

      <Card
        size="small"
        title={
          <Space>
            <span>{t('inventory.warehouse_stock')}</span>
            <Text type="secondary">({t('common.total')}: {totalStock})</Text>
          </Space>
        }
        extra={
          warehouseOptions.length > inventoryEntries.length && (
            <Button type="link" size="small" icon={<PlusOutlined />} onClick={addEntry}>
              {t('inventory.add_warehouse')}
            </Button>
          )
        }
      >
        {inventoryEntries.length === 0 && (
          <Text type="secondary">{t('inventory.no_stock')}</Text>
        )}
        {inventoryEntries.map((entry, idx) => {
          const usedIds = inventoryEntries.filter((_, i) => i !== idx).map((e) => e.warehouse_id);
          const options = warehouseOptions.filter((w) => !usedIds.includes(w.value));
          return (
            <Space key={idx} style={{ display: 'flex', marginBottom: 8 }} align="center">
              <Select
                value={entry.warehouse_id}
                onChange={(v) => updateEntry(idx, 'warehouse_id', v)}
                options={options}
                style={{ width: 180 }}
                size="small"
              />
              <InputNumber
                value={entry.quantity}
                onChange={(v) => updateEntry(idx, 'quantity', v ?? 0)}
                min={0}
                style={{ width: 100 }}
                size="small"
              />
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => removeEntry(idx)}
              />
            </Space>
          );
        })}
      </Card>
    </Form>
  );
}
