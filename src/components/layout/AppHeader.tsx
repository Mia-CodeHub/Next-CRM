'use client';

import { Layout, Space, Button, Dropdown, Avatar, Typography, Tag } from 'antd';
import { SunOutlined, MoonOutlined, GlobalOutlined, UserOutlined, LogoutOutlined, SettingOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n';

const { Header } = Layout;
const { Text } = Typography;

const ROLE_COLORS: Record<string, string> = { admin: 'red', staff: 'blue', warehouse: 'orange', viewer: 'default' };

interface Props {
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export function AppHeader({ isMobile, onMenuClick }: Props) {
  const { isDark, toggle } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const localeItems = [
    { key: 'vi', label: '🇻🇳 Tiếng Việt' },
    { key: 'en', label: '🇬🇧 English' },
  ];

  const userItems = [
    { key: 'settings', icon: <SettingOutlined />, label: t('sidebar.settings') },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: t('auth.logout'), danger: true },
  ];

  return (
    <Header
      className="glass-header"
      style={{
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {isMobile && (
          <Button type="text" icon={<MenuOutlined />} onClick={onMenuClick} />
        )}
      </div>
      <Space size={isMobile ? 'small' : 'middle'}>
        <Button
          type="text"
          icon={<SearchOutlined />}
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
          }}
        />
        <NotificationBell />
        <Button
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggle}
        />
        {!isMobile && (
          <Dropdown
            menu={{ items: localeItems, onClick: ({ key }) => setLocale(key as Locale) }}
          >
            <Button type="text" icon={<GlobalOutlined />}>
              {locale.toUpperCase()}
            </Button>
          </Dropdown>
        )}
        <Dropdown
          menu={{
            items: isMobile
              ? [...localeItems.map((l) => ({ ...l, onClick: () => setLocale(l.key as Locale) })), { type: 'divider' as const }, ...userItems]
              : userItems,
            onClick: async ({ key }) => {
              if (key === 'logout') {
                await signOut();
                router.push('/login');
              } else if (key === 'settings') {
                router.push('/settings');
              }
            },
          }}
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              src={profile?.avatar_url}
              icon={!profile?.avatar_url && <UserOutlined />}
              style={{ backgroundColor: profile?.avatar_url ? undefined : '#10B981', color: '#fff' }}
            />
            {!isMobile && (
              <>
                <Text>{profile?.full_name || 'User'}</Text>
                <Tag color={ROLE_COLORS[profile?.role || 'viewer']} style={{ marginInlineStart: 0 }}>
                  {profile?.role?.toUpperCase()}
                </Tag>
              </>
            )}
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
}
