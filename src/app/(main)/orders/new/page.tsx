'use client';

import { useState, useEffect } from 'react';
import { Button, Form, App, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/shared/PageHeader';
import { OrderForm } from '@/components/orders/OrderForm';
import { useOrders } from '@/hooks/useOrders';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function NewOrderPage() {
  const { t } = useLocale();
  const { profile } = useAuth();
  const { create } = useOrders();
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient();
    Promise.all([
      supabase.from('customers').select('id, name'),
      supabase.from('products').select('id, name, price').eq('status', 'active'),
    ]).then(([c, p]) => {
      setCustomers((c.data ?? []) as { id: string; name: string }[]);
      setProducts((p.data ?? []).map((x: Record<string, unknown>) => ({ id: x.id as string, name: x.name as string, price: Number(x.price) })));
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const { items = [], ...orderData } = values;
      const total = items.reduce((s: number, i: { quantity: number; unit_price: number }) => s + i.quantity * i.unit_price, 0)
        + (orderData.shipping_fee || 0) - (orderData.discount || 0);

      await create(
        { ...orderData, total, tenant_id: profile!.tenant_id, created_by: profile!.id },
        items.map((i: { product_id: string; quantity: number; unit_price: number }) => ({
          product_name: products.find((p) => p.id === i.product_id)?.name || '',
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          order_id: '',
        }))
      );
      message.success(t('common.save'));
      router.push('/orders');
    } catch {
      // validation
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title={t('orders.new')}
        actions={
          <Space>
            <Link href="/orders"><Button icon={<ArrowLeftOutlined />}>{t('common.back')}</Button></Link>
            <Button type="primary" onClick={handleSubmit} loading={saving}>{t('common.save')}</Button>
          </Space>
        }
      />
      <OrderForm form={form} customers={customers} products={products} />
    </>
  );
}
