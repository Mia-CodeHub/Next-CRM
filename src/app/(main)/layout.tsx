'use client';

import { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { GlobalSearch } from '@/components/shared/GlobalSearch';

const { Content } = Layout;

const MOBILE_BREAKPOINT = 768;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Layout>
        <AppHeader
          isMobile={isMobile}
          onMenuClick={() => setMobileOpen(true)}
        />
        <Content
          className="glass-content"
          style={{
            margin: isMobile ? 8 : 24,
            padding: isMobile ? 12 : 24,
            borderRadius: 16,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
      <GlobalSearch />
    </Layout>
  );
}
