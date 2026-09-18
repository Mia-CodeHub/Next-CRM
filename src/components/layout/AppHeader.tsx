'use client';

import { Layout, Space, Button, Dropdown, Avatar, Typography } from 'antd';
import { SunOutlined, MoonOutlined, GlobalOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n';

const { Header } = Layout;
const { Text } = Typography;

export function AppHeader() {
  const { isDark, toggle } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const localeItems = [
    { key: 'vi', label: '🇻🇳 Tiếng Việt' },
    { key: 'en', label: '🇬🇧 English' },
  ];

  const userItems = [
    { key: 'logout', icon: <LogoutOutlined />, label: t('auth.logout'), danger: true },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        background: isDark ? '#1a1a2e' : '#fff',
        borderBottom: isDark ? '1px solid #2a2a3e' : '1px solid #f0f0f0',
      }}
    >
      <Space size="middle">
        <Button
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggle}
        />
        <Dropdown
          menu={{ items: localeItems, onClick: ({ key }) => setLocale(key as Locale) }}
        >
          <Button type="text" icon={<GlobalOutlined />}>
            {locale.toUpperCase()}
          </Button>
        </Dropdown>
        <Dropdown
          menu={{
            items: userItems,
            onClick: async ({ key }) => {
              if (key === 'logout') {
                await signOut();
                router.push('/login');
              }
            },
          }}
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#39FF14', color: '#000' }} />
            <Text>{profile?.full_name || 'User'}</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
}
