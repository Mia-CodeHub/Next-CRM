'use client';

import { Table, Button, Space, Input, Popconfirm, App, Switch, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { useState } from 'react';
import type { Warehouse } from '@/lib/types';

interface Props {
  warehouses: Warehouse[];
  loading: boolean;
  onAdd: (v: { name: string; address?: string; phone?: string }) => Promise<void>;
  onEdit: (id: string, v: { name?: string; address?: string; phone?: string; is_active?: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}

export function WarehouseSettings({ warehouses, loading, onAdd, onEdit, onDelete, onSelect, selectedId }: Props) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) return;
    await onAdd({ name: name.trim(), address: address.trim() || undefined, phone: phone.trim() || undefined });
    setName('');
    setAddress('');
    setPhone('');
    setAdding(false);
    message.success(t('common.save'));
  };

  const startEdit = (r: Warehouse) => {
    setEditingId(r.id);
    setEditName(r.name);
    setEditAddress(r.address || '');
    setEditPhone(r.phone || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await onEdit(editingId, {
      name: editName.trim(),
      address: editAddress.trim() || undefined,
      phone: editPhone.trim() || undefined,
    });
    setEditingId(null);
    message.success(t('common.save'));
  };

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{t('warehouse.list')}</h3>
        {!adding && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAdding(true)}>
            {t('warehouse.add')}
          </Button>
        )}
      </div>

      {adding && (
        <Card size="small">
          <Space wrap>
            <Input placeholder={t('warehouse.name')} value={name} onChange={(e) => setName(e.target.value)} style={{ width: 200 }} />
            <Input placeholder={t('warehouse.address')} value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: 250 }} />
            <Input placeholder={t('warehouse.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: 150 }} />
            <Button type="primary" icon={<SaveOutlined />} onClick={handleAdd} />
            <Button icon={<CloseOutlined />} onClick={() => setAdding(false)} />
          </Space>
        </Card>
      )}

      <Table
        size="small"
        dataSource={warehouses}
        rowKey="id"
        loading={loading}
        pagination={false}
        onRow={(record) => ({
          onClick: () => {
            if (editingId !== record.id) onSelect?.(record.id);
          },
          style: {
            cursor: onSelect ? 'pointer' : undefined,
            background: selectedId === record.id ? 'rgba(16, 185, 129, 0.1)' : undefined,
          },
        })}
        columns={[
          {
            title: t('warehouse.name'),
            dataIndex: 'name',
            key: 'name',
            render: (v: string, r: Warehouse) =>
              editingId === r.id ? (
                <Input size="small" value={editName} onChange={(e) => setEditName(e.target.value)} onClick={(e) => e.stopPropagation()} />
              ) : v,
          },
          {
            title: t('warehouse.address'),
            dataIndex: 'address',
            key: 'address',
            render: (v: string, r: Warehouse) =>
              editingId === r.id ? (
                <Input size="small" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} onClick={(e) => e.stopPropagation()} />
              ) : v || '-',
          },
          {
            title: t('warehouse.phone'),
            dataIndex: 'phone',
            key: 'phone',
            render: (v: string, r: Warehouse) =>
              editingId === r.id ? (
                <Input size="small" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} onClick={(e) => e.stopPropagation()} />
              ) : v || '-',
          },
          {
            title: t('common.status'),
            key: 'active',
            width: 100,
            render: (_: unknown, r: Warehouse) => (
              <Switch checked={r.is_active} size="small" onChange={(checked) => onEdit(r.id, { is_active: checked })} />
            ),
          },
          {
            title: t('common.actions'),
            key: 'actions',
            width: 120,
            render: (_: unknown, r: Warehouse) =>
              editingId === r.id ? (
                <Space>
                  <Button size="small" type="primary" icon={<SaveOutlined />} onClick={(e) => { e.stopPropagation(); saveEdit(); }} />
                  <Button size="small" icon={<CloseOutlined />} onClick={(e) => { e.stopPropagation(); cancelEdit(); }} />
                </Space>
              ) : (
                <Space>
                  <Button size="small" type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); startEdit(r); }} />
                  <Popconfirm title={t('common.confirm_delete')} onConfirm={() => onDelete(r.id)}>
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                  </Popconfirm>
                </Space>
              ),
          },
        ]}
      />
    </Space>
  );
}
