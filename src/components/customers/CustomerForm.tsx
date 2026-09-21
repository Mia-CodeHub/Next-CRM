'use client';

import { Form, Input, Select } from 'antd';
import { useLocale } from '@/hooks/useLocale';
import { useChannels } from '@/hooks/useChannels';
import type { Customer } from '@/lib/types';
import { useEffect } from 'react';

interface Props {
  form: ReturnType<typeof Form.useForm>[0];
  customer?: Customer | null;
}

export function CustomerForm({ form, customer }: Props) {
  const { t } = useLocale();
  const { channelOptions } = useChannels();

  useEffect(() => {
    if (customer) form.setFieldsValue(customer);
    else form.resetFields();
  }, [customer, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="name" label={t('customers.name')} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="phone" label={t('customers.phone')}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label={t('customers.email')}>
        <Input type="email" />
      </Form.Item>
      <Form.Item name="address" label={t('customers.address')}>
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="channel_id" label={t('customers.channel')}>
        <Select options={channelOptions} allowClear />
      </Form.Item>
      <Form.Item name="notes" label={t('customers.notes')}>
        <Input.TextArea rows={3} />
      </Form.Item>
    </Form>
  );
}
