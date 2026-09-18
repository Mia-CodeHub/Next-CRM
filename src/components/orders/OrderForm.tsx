'use client';

import { Form, Input, Select, InputNumber, Button, Space, Card, Typography } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { CHANNELS, ORDER_STATUSES } from '@/lib/constants';

const { Text } = Typography;

interface Props {
  form: ReturnType<typeof Form.useForm>[0];
  customers: { id: string; name: string }[];
  products: { id: string; name: string; price: number }[];
}

export function OrderForm({ form, customers, products }: Props) {
  const { t } = useLocale();

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="customer_id" label={t('orders.customer')}>
        <Select
          showSearch
          options={customers.map((c) => ({ value: c.id, label: c.name }))}
          filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
          allowClear
        />
      </Form.Item>
      <Form.Item name="channel_id" label={t('orders.channel')} rules={[{ required: true }]}>
        <Select options={CHANNELS.map((c) => ({ value: c.value, label: c.label }))} />
      </Form.Item>
      <Form.Item name="order_code" label={t('orders.code')}>
        <Input />
      </Form.Item>
      <Form.Item name="status" label={t('orders.status')} initialValue="pending">
        <Select options={ORDER_STATUSES.map((s) => ({ value: s.value, label: t(s.label) }))} />
      </Form.Item>

      <Card size="small" title={t('orders.items')} style={{ marginBottom: 16 }}>
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <Space key={key} align="start" style={{ display: 'flex', marginBottom: 8 }}>
                  <Form.Item {...rest} name={[name, 'product_id']} rules={[{ required: true }]} style={{ width: 200 }}>
                    <Select
                      placeholder={t('products.name')}
                      options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.price.toLocaleString('vi-VN')}đ)` }))}
                      onChange={(val) => {
                        const p = products.find((x) => x.id === val);
                        if (p) {
                          const items = form.getFieldValue('items');
                          items[name] = { ...items[name], product_name: p.name, unit_price: p.price };
                          form.setFieldsValue({ items });
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item {...rest} name={[name, 'quantity']} initialValue={1}>
                    <InputNumber min={1} placeholder="Qty" style={{ width: 80 }} />
                  </Form.Item>
                  <Form.Item {...rest} name={[name, 'unit_price']}>
                    <InputNumber min={0} placeholder={t('products.price')} style={{ width: 120 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f', marginTop: 8 }} />
                </Space>
              ))}
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                {t('common.create')}
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      <Form.Item name="shipping_fee" label={t('orders.shipping_fee')}>
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item name="discount" label={t('orders.discount')}>
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item name="notes" label={t('orders.notes')}>
        <Input.TextArea rows={3} />
      </Form.Item>
    </Form>
  );
}
