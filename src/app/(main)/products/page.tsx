'use client';

import { useState } from 'react';
import { Button, Form, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductForm } from '@/components/products/ProductForm';
import { FormDrawer } from '@/components/shared/FormDrawer';
import { useProducts } from '@/hooks/useProducts';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/lib/types';

export default function ProductsPage() {
  const { t } = useLocale();
  const { canCreate } = useRBAC();
  const { profile } = useAuth();
  const productHook = useProducts();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();

  const handleEdit = (product: Product) => {
    setEditing(product);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await productHook.update(editing.id, values);
      } else {
        await productHook.create({ ...values, tenant_id: profile!.tenant_id });
      }
      setDrawerOpen(false);
      message.success(t('common.save'));
    } catch {
      // validation error
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title={t('products.title')}
        actions={canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>{t('products.new')}</Button>}
      />
      <ProductTable
        {...productHook}
        onEdit={handleEdit}
        onDelete={async (id) => { await productHook.remove(id); message.success(t('common.delete')); }}
      />
      <FormDrawer
        open={drawerOpen}
        title={editing ? t('common.edit') : t('products.new')}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <ProductForm form={form} product={editing} />
      </FormDrawer>
    </>
  );
}
