'use client';

import { useState } from 'react';
import { Button, Form, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/shared/PageHeader';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { FormDrawer } from '@/components/shared/FormDrawer';
import { useCustomers } from '@/hooks/useCustomers';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/hooks/useAuth';
import type { Customer } from '@/lib/types';

export default function CustomersPage() {
  const { t } = useLocale();
  const { canCreate } = useRBAC();
  const { profile } = useAuth();
  const customerHook = useCustomers();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();

  const handleEdit = (customer: Customer) => {
    setEditing(customer);
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
        await customerHook.update(editing.id, values);
      } else {
        await customerHook.create({ ...values, tenant_id: profile!.tenant_id });
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
        title={t('customers.title')}
        actions={canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>{t('customers.new')}</Button>}
      />
      <CustomerTable
        {...customerHook}
        onEdit={handleEdit}
        onDelete={async (id) => { await customerHook.remove(id); message.success(t('common.delete')); }}
      />
      <FormDrawer
        open={drawerOpen}
        title={editing ? t('common.edit') : t('customers.new')}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <CustomerForm form={form} customer={editing} />
      </FormDrawer>
    </>
  );
}
