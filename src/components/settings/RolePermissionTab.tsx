'use client';

import { useState } from 'react';
import { Card, Table, Tag, Typography, Switch, Button, Modal, Input, Select, Space, Popconfirm, App, Tooltip, Checkbox } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CrownOutlined, UserOutlined,
  HomeOutlined, EyeOutlined, SafetyCertificateOutlined, TeamOutlined,
  CheckCircleFilled, CloseCircleFilled,
} from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { useRoles } from '@/hooks/useRoles';
import { PERMISSIONS, type PermissionKey } from '@/lib/constants';
import type { CustomRole } from '@/lib/services/role.service';

const { Text } = Typography;

const ICON_MAP: Record<string, React.ReactNode> = {
  crown: <CrownOutlined />,
  user: <UserOutlined />,
  home: <HomeOutlined />,
  eye: <EyeOutlined />,
  shield: <SafetyCertificateOutlined />,
  team: <TeamOutlined />,
};

const COLOR_OPTIONS = [
  { value: 'red', label: 'Đỏ' },
  { value: 'blue', label: 'Xanh dương' },
  { value: 'orange', label: 'Cam' },
  { value: 'green', label: 'Xanh lá' },
  { value: 'purple', label: 'Tím' },
  { value: 'cyan', label: 'Xanh ngọc' },
  { value: 'magenta', label: 'Hồng' },
  { value: 'default', label: 'Mặc định' },
];

const ICON_OPTIONS = [
  { value: 'crown', label: 'Crown', icon: <CrownOutlined /> },
  { value: 'user', label: 'User', icon: <UserOutlined /> },
  { value: 'home', label: 'Home', icon: <HomeOutlined /> },
  { value: 'eye', label: 'Eye', icon: <EyeOutlined /> },
  { value: 'shield', label: 'Shield', icon: <SafetyCertificateOutlined /> },
  { value: 'team', label: 'Team', icon: <TeamOutlined /> },
];

const MODULE_ORDER = ['dashboard', 'orders', 'products', 'customers', 'warehouses', 'inventory', 'settings', 'audit'];

interface RoleFormData {
  name: string;
  display_name: string;
  description: string;
  color: string;
  icon: string;
  permissions: PermissionKey[];
}

const EMPTY_FORM: RoleFormData = {
  name: '',
  display_name: '',
  description: '',
  color: 'default',
  icon: 'user',
  permissions: [],
};

export function RolePermissionTab(): React.ReactNode {
  const { t } = useLocale();
  const { roles, loading, create, update, remove } = useRoles();
  const { message } = App.useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [form, setForm] = useState<RoleFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setEditingRole(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (role: CustomRole) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      color: role.color,
      icon: role.icon,
      permissions: [...role.permissions],
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.display_name.trim()) return;
    setSaving(true);
    try {
      if (editingRole) {
        await update(editingRole.id, {
          display_name: form.display_name,
          description: form.description || undefined,
          color: form.color,
          icon: form.icon,
          permissions: form.permissions,
        });
      } else {
        const name = form.name.trim().toLowerCase().replace(/\s+/g, '_');
        if (!name) { setSaving(false); return; }
        await create({
          name,
          display_name: form.display_name,
          description: form.description || undefined,
          color: form.color,
          icon: form.icon,
          permissions: form.permissions,
        });
      }
      message.success(t('role.save_success'));
      setModalOpen(false);
    } catch (err) {
      message.error(String(err));
    }
    setSaving(false);
  };

  const handleDelete = async (role: CustomRole) => {
    if (role.is_system) {
      message.warning(t('role.cannot_delete_system'));
      return;
    }
    try {
      await remove(role.id);
      message.success(t('role.delete_success'));
    } catch (err) {
      message.error(String(err));
    }
  };

  const handlePermissionToggle = async (role: CustomRole, permKey: PermissionKey, checked: boolean) => {
    const newPerms = checked
      ? [...role.permissions, permKey]
      : role.permissions.filter((p) => p !== permKey);
    try {
      await update(role.id, { permissions: newPerms });
    } catch (err) {
      message.error(String(err));
    }
  };

  const toggleFormPermission = (permKey: PermissionKey) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter((p) => p !== permKey)
        : [...prev.permissions, permKey],
    }));
  };

  const toggleModuleInForm = (module: string) => {
    const modulePerms = PERMISSIONS.filter((p) => p.module === module).map((p) => p.key);
    const allSelected = modulePerms.every((p) => form.permissions.includes(p));
    setForm((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !modulePerms.includes(p))
        : [...new Set([...prev.permissions, ...modulePerms])],
    }));
  };

  const grouped = MODULE_ORDER.map((mod) => ({
    module: mod,
    permissions: PERMISSIONS.filter((p) => p.module === mod),
  }));

  const dataSource = grouped.flatMap((g) =>
    g.permissions.map((p) => ({ key: p.key, module: p.module }))
  );

  const columns = [
    {
      title: t('role.permission'),
      key: 'permission',
      fixed: 'left' as const,
      width: 200,
      render: (_: unknown, record: { key: string }) => (
        <Text style={{ fontSize: 13 }}>{t(`perm.${record.key}`)}</Text>
      ),
    },
    ...roles.map((role) => ({
      title: (
        <Space size={4} style={{ flexDirection: 'column', alignItems: 'center' }}>
          <Tag color={role.color} icon={ICON_MAP[role.icon]}>
            {role.display_name}
          </Tag>
          {role.name !== 'admin' && (
            <Space size={2}>
              <Tooltip title={t('role.edit')}>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(role)} style={{ padding: 0, fontSize: 11 }} />
              </Tooltip>
              {!role.is_system && (
                <Popconfirm title={t('role.confirm_delete')} onConfirm={() => handleDelete(role)}>
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} style={{ padding: 0, fontSize: 11 }} />
                </Popconfirm>
              )}
            </Space>
          )}
        </Space>
      ),
      key: role.name,
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: { key: PermissionKey }) => {
        const has = role.permissions.includes(record.key);
        if (role.name === 'admin') {
          return <CheckCircleFilled style={{ color: '#10B981', fontSize: 16 }} />;
        }
        return (
          <Switch
            size="small"
            checked={has}
            onChange={(checked) => handlePermissionToggle(role, record.key, checked)}
          />
        );
      },
    })),
  ];

  return (
    <>
      {/* Role cards */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'stretch' }}>
          {roles.map((role) => (
            <div
              key={role.id}
              style={{
                flex: '1 1 180px',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Tag color={role.color} icon={ICON_MAP[role.icon]}>{role.display_name}</Tag>
                {role.is_system ? (
                  <Tag style={{ fontSize: 10 }}>{t('role.system_role')}</Tag>
                ) : (
                  <Tag color="blue" style={{ fontSize: 10 }}>{t('role.custom_role')}</Tag>
                )}
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{role.description}</div>
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
                {role.permissions.length} {t('role.permissions').toLowerCase()}
              </div>
              {role.name !== 'admin' && (
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditModal(role)} />
                </div>
              )}
            </div>
          ))}
          {/* Create new role button */}
          <div
            onClick={openCreateModal}
            style={{
              flex: '1 1 180px',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px dashed rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              minHeight: 80,
              opacity: 0.6,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
          >
            <Space>
              <PlusOutlined />
              <span>{t('role.create')}</span>
            </Space>
          </div>
        </div>
      </Card>

      {/* Permission matrix */}
      <Card title={t('role.permission_matrix')} size="small">
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="key"
          pagination={false}
          size="small"
          loading={loading}
          scroll={{ x: 200 + roles.length * 120 }}
          rowClassName={(record, index) => {
            const prevModule = index > 0 ? dataSource[index - 1].module : null;
            return record.module !== prevModule ? 'module-first-row' : '';
          }}
        />
      </Card>

      {/* Create/Edit Role Modal */}
      <Modal
        open={modalOpen}
        title={editingRole ? t('role.edit') : t('role.create')}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        width={600}
        destroyOnHidden
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!editingRole && (
            <div>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>{t('role.name')}</Text>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t('role.name_placeholder')}
                size="large"
              />
            </div>
          )}
          <div>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>{t('role.display_name')}</Text>
            <Input
              value={form.display_name}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              placeholder={t('role.display_name_placeholder')}
              size="large"
            />
          </div>
          <div>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>{t('role.description')}</Text>
            <Input.TextArea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t('role.desc_placeholder')}
              rows={2}
            />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>{t('role.color')}</Text>
              <Select
                value={form.color}
                onChange={(v) => setForm((f) => ({ ...f, color: v }))}
                style={{ width: '100%' }}
                size="large"
                options={COLOR_OPTIONS}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>{t('role.icon')}</Text>
              <Select
                value={form.icon}
                onChange={(v) => setForm((f) => ({ ...f, icon: v }))}
                style={{ width: '100%' }}
                size="large"
                options={ICON_OPTIONS.map((o) => ({
                  value: o.value,
                  label: <Space size={4}>{o.icon}<span>{o.label}</span></Space>,
                }))}
              />
            </div>
          </div>
          <div>
            <Text style={{ fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>{t('role.select_permissions')}</Text>
            <div className="role-perm-list" style={{ maxHeight: 320, overflow: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12 }}>
              {grouped.map((g) => {
                const modulePerms = g.permissions.map((p) => p.key);
                const allChecked = modulePerms.every((p) => form.permissions.includes(p));
                const someChecked = modulePerms.some((p) => form.permissions.includes(p));
                return (
                  <div key={g.module} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked && !allChecked}
                      onChange={() => toggleModuleInForm(g.module)}
                    >
                      <span className="role-perm-module" style={{ textTransform: 'capitalize', fontSize: 13 }}>
                        {g.module}
                      </span>
                    </Checkbox>
                    <div style={{ marginLeft: 24, marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                      {g.permissions.map((p) => (
                        <Checkbox
                          key={p.key}
                          checked={form.permissions.includes(p.key)}
                          onChange={() => toggleFormPermission(p.key)}
                          style={{ fontSize: 13, minWidth: 140 }}
                        >
                          {t(`perm.${p.key}`)}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
