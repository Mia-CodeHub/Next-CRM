'use client';

import { Form, Input, InputNumber, Select } from 'antd';
import { useLocale } from '@/hooks/useLocale';
import { CHANNELS, PRODUCT_STATUSES } from '@/lib/constants';
import type { Product } from '@/lib/types';
import { useEffect } from 'react';

interface Props {
  form: ReturnType<typeof Form.useForm>[0];
  product?: Product | null;
}

export function ProductForm({ form, product }: Props) {
  const { t } = useLocale();

  useEffect(() => {
    if (product) form.setFieldsValue(product);
    else form.resetFields();
  }, [product, form]);

  return (
    <Form form={form} layout="vertical">
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
      <Form.Item name="stock" label={t('products.stock')}>
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item name="channel_id" label={t('orders.channel')}>
        <Select options={CHANNELS.map((c) => ({ value: c.value, label: c.label }))} allowClear />
      </Form.Item>
      <Form.Item name="status" label={t('products.status')} initialValue="active">
        <Select options={PRODUCT_STATUSES.map((s) => ({ value: s.value, label: t(s.label) }))} />
      </Form.Item>
    </Form>
  );
}
