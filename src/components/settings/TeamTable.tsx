'use client';

import { Table, Tag, Select, Button, Popconfirm, Space, Card, Empty, App, Tooltip, Typography } from 'antd';
import { DeleteOutlined, CrownOutlined, UserOutlined, HomeOutlined, EyeOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import type { TeamMember } from '@/hooks/useTeam';
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
  members: TeamMember[];
  loading: boolean;
  roles: CustomRole[];
  onChangeRole: (memberId: string, role: Role) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}

export function TeamTable({ members, loading, roles, onChangeRole, onRemove }: Props) {
  const { t } = useLocale();
  const { user } = useAuth();
  const { message } = App.useApp();

  const getRoleMeta = (roleName: string) => {
    const r = roles.find((role) => role.name === roleName);
    return r ? { color: r.color, icon: ICON_MAP[r.icon] || <UserOutlined />, displayName: r.display_name, desc: r.description }
      : { color: 'default', icon: <UserOutlined />, displayName: roleName, desc: '' };
  };

  const handleRoleChange = async (memberId: string, role: Role) => {
    try {
      await onChangeRole(memberId, role);
      message.success(t('common.save'));
    } catch {
      message.error('Failed to change role');
    }
  };

  const columns = [
    {
      title: t('settings.member_name'),
      key: 'name',
      render: (_: unknown, r: TeamMember) => (
        <Space>
          {r.full_name || '-'}
          {r.id === user?.id && <Tag color="green">{t('settings.you')}</Tag>}
        </Space>
      ),
    },
    {
      title: t('auth.email'),
      dataIndex: 'email',
      key: 'email',
      render: (v: string | null) => v || '-',
    },
    {
      title: t('settings.role'),
      key: 'role',
      width: 200,
      render: (_: unknown, r: TeamMember) => {
        const meta = getRoleMeta(r.role);
        if (r.id === user?.id) {
          return (
            <Tooltip title={meta.desc}>
              <Tag color={meta.color} icon={meta.icon}>{meta.displayName}</Tag>
            </Tooltip>
          );
        }
        return (
          <Select
            value={r.role}
            onChange={(v) => handleRoleChange(r.id, v)}
            style={{ width: 180 }}
            size="small"
            options={roles.map((role) => ({
              value: role.name,
              label: (
                <Space size={4}>
                  {ICON_MAP[role.icon] || <UserOutlined />}
                  <span>{role.display_name}</span>
                </Space>
              ),
            }))}
          />
        );
      },
    },
    {
      title: t('settings.joined'),
      dataIndex: 'created_at',
      key: 'joined',
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 80,
      render: (_: unknown, r: TeamMember) => {
        if (r.id === user?.id) return null;
        return (
          <Popconfirm title={t('settings.confirm_remove')} onConfirm={() => onRemove(r.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Card title={t('settings.team')} style={{ marginTop: 16 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
        {t('role.team_hint')}
      </Text>
      {members.length === 0 && !loading ? (
        <Empty description={t('settings.no_members')} />
      ) : (
        <Table
          columns={columns}
          dataSource={members}
          loading={loading}
          rowKey="id"
          pagination={false}
          size="small"
        />
      )}
    </Card>
  );
}
