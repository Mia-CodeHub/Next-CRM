'use client';

import { useState } from 'react';
import { Button, Form, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductForm } from '@/components/products/ProductForm';
import { FormDrawer } from '@/components/shared/FormDrawer';
import { useProducts } from '@/hooks/useProducts';
import { useInventory } from '@/hooks/useInventory';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/lib/types';

interface InventoryEntry {
  warehouse_id: string;
  quantity: number;
}

export default function ProductsPage() {
  const { t } = useLocale();
  const { canCreate } = useRBAC();
  const { profile } = useAuth();
  const productHook = useProducts();
  const { fetchByProduct, saveInventory } = useInventory();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [inventoryEntries, setInventoryEntries] = useState<InventoryEntry[]>([]);
  const [originalWarehouseIds, setOriginalWarehouseIds] = useState<string[]>([]);
  const { message } = App.useApp();

  const handleEdit = async (product: Product) => {
    setEditing(product);
    const inv = await fetchByProduct(product.id);
    const entries = inv.map((i) => ({ warehouse_id: i.warehouse_id, quantity: i.quantity }));
    setInventoryEntries(entries);
    setOriginalWarehouseIds(entries.map((e) => e.warehouse_id));
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setInventoryEntries([]);
    setOriginalWarehouseIds([]);
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const totalStock = inventoryEntries.reduce((sum, e) => sum + (e.quantity || 0), 0);

      if (editing) {
        await productHook.update(editing.id, { ...values, stock: totalStock });
        const currentIds = inventoryEntries.map((e) => e.warehouse_id);
        const removedIds = originalWarehouseIds.filter((id) => !currentIds.includes(id));
        await saveInventory(editing.id, inventoryEntries, removedIds);
      } else {
        const created = await productHook.createAndReturn({ ...values, tenant_id: profile!.tenant_id, stock: totalStock });
        if (created && inventoryEntries.length > 0) {
          await saveInventory(created.id, inventoryEntries);
        }
      }
      setDrawerOpen(false);
      message.success(t('common.save'));
      productHook.refetch();
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
        <ProductForm
          form={form}
          product={editing}
          inventoryEntries={inventoryEntries}
          onInventoryChange={setInventoryEntries}
        />
      </FormDrawer>
    </>
  );
}
