'use client';

import { Card, Table, Button, Select, Space, App, Typography, Input, Popconfirm, Tag } from 'antd';
import { PlusOutlined, CopyOutlined, DeleteOutlined, CrownOutlined, UserOutlined, HomeOutlined, EyeOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import type { Invite } from '@/hooks/useTeam';
import type { Role } from '@/lib/supabase/types';
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

interface Props {
  invites: Invite[];
  roles: CustomRole[];
  onCreateInvite: (role: Role, email?: string) => Promise<unknown>;
  onDeleteInvite: (id: string) => Promise<void>;
}

export function InviteSection({ invites, roles, onCreateInvite, onDeleteInvite }: Props) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [role, setRole] = useState<string>('staff');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const invite = await onCreateInvite(role as Role, email || undefined);
      if (invite) {
        const code = (invite as { invite_code: string }).invite_code;
        await navigator.clipboard.writeText(code);
        message.success(t('settings.invite_created'));
      }
      setEmail('');
    } catch {
      message.error('Failed to create invite');
    }
    setCreating(false);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    message.success(t('settings.code_copied'));
  };

  const getRoleDisplay = (roleName: string) => {
    const r = roles.find((role) => role.name === roleName);
    return r ? r.display_name : roleName;
  };

  const columns = [
    {
      title: t('settings.invite_code'),
      dataIndex: 'invite_code',
      key: 'code',
      render: (v: string) => (
        <Space>
          <Text code copyable={false}>{v}</Text>
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => copyCode(v)} />
        </Space>
      ),
    },
    {
      title: t('settings.role'),
      dataIndex: 'role',
      key: 'role',
      render: (v: string) => <Tag>{getRoleDisplay(v)}</Tag>,
    },
    {
      title: t('auth.email'),
      dataIndex: 'email',
      key: 'email',
      render: (v: string | null) => v || '-',
    },
    {
      title: t('settings.created_at'),
      dataIndex: 'created_at',
      key: 'date',
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 80,
      render: (_: unknown, r: Invite) => (
        <Popconfirm title={t('common.confirm_delete')} onConfirm={() => onDeleteInvite(r.id)}>
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card title={t('settings.invites')} style={{ marginTop: 16 }}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder={t('settings.invite_email_placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: 220 }}
        />
        <Select
          value={role}
          onChange={setRole}
          style={{ width: 180 }}
          options={roles.map((r) => ({
            value: r.name,
            label: (
              <Space size={4}>
                {ICON_MAP[r.icon] || <UserOutlined />}
                <span>{r.display_name}</span>
              </Space>
            ),
          }))}
        />
        <Button type="primary" icon={<PlusOutlined />} loading={creating} onClick={handleCreate}>
          {t('settings.create_invite')}
        </Button>
      </Space>
      <Table columns={columns} dataSource={invites} rowKey="id" pagination={false} size="small" />
    </Card>
  );
}
