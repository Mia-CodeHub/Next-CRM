'use client';

import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';

const { Sider } = Layout;

export function AppSidebar({ collapsed, onCollapse }: { collapsed: boolean; onCollapse: (v: boolean) => void }) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();

  const items = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('sidebar.dashboard') },
    { key: '/orders', icon: <ShoppingCartOutlined />, label: t('sidebar.orders') },
    { key: '/products', icon: <AppstoreOutlined />, label: t('sidebar.products') },
    { key: '/customers', icon: <TeamOutlined />, label: t('sidebar.customers') },
    { key: '/settings', icon: <SettingOutlined />, label: t('sidebar.settings') },
  ];

  const selectedKey = '/' + (pathname.split('/')[1] || 'dashboard');

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      theme={isDark ? 'dark' : 'light'}
      style={{
        minHeight: '100vh',
        background: isDark ? '#0f0f1a' : undefined,
        borderRight: isDark ? '1px solid #2a2a3e' : '1px solid #f0f0f0',
      }}
    >
      <div style={{ padding: '16px', textAlign: 'center', fontWeight: 700, fontSize: collapsed ? 16 : 20, color: '#39FF14', letterSpacing: 2 }}>
        {collapsed ? 'N' : 'Next-CRM'}
      </div>
      <Menu
        theme={isDark ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[selectedKey]}
        items={items}
        onClick={({ key }) => router.push(key)}
        style={{ background: 'transparent', borderInlineEnd: 'none' }}
      />
    </Sider>
  );
}
