'use client';

import { Layout, Menu, Drawer } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  TeamOutlined,
  SettingOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';

const { Sider } = Layout;

interface Props {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AppSidebar({ collapsed, onCollapse, isMobile, mobileOpen, onMobileClose }: Props) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();

  const items = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('sidebar.dashboard') },
    { key: '/orders', icon: <ShoppingCartOutlined />, label: t('sidebar.orders') },
    { key: '/products', icon: <AppstoreOutlined />, label: t('sidebar.products') },
    { key: '/customers', icon: <TeamOutlined />, label: t('sidebar.customers') },
    { key: '/warehouses', icon: <HomeOutlined />, label: t('sidebar.warehouses') },
    { key: '/settings', icon: <SettingOutlined />, label: t('sidebar.settings') },
  ];

  const selectedKey = '/' + (pathname.split('/')[1] || 'dashboard');

  const handleClick = (key: string) => {
    router.push(key);
    if (isMobile) onMobileClose();
  };

  const logo = (
    <div style={{ padding: '16px', textAlign: 'center', fontWeight: 700, fontSize: 20, color: '#10B981', letterSpacing: 2 }}>
      Next-CRM
    </div>
  );

  const menu = (
    <Menu
      theme={isDark ? 'dark' : 'light'}
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items}
      onClick={({ key }) => handleClick(key)}
      style={{ background: 'transparent', borderInlineEnd: 'none' }}
    />
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        size="default"
        styles={{ body: { padding: 0 }, header: { display: 'none' }, wrapper: { width: 256 } }}
        className="glass-sidebar-drawer"
      >
        {logo}
        {menu}
      </Drawer>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      theme={isDark ? 'dark' : 'light'}
      className="glass-sidebar"
      style={{ minHeight: '100vh' }}
    >
      <div style={{ padding: '16px', textAlign: 'center', fontWeight: 700, fontSize: collapsed ? 16 : 20, color: '#10B981', letterSpacing: 2 }}>
        {collapsed ? 'N' : 'Next-CRM'}
      </div>
      {menu}
    </Sider>
  );
}
