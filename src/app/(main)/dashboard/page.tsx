'use client';

import { Spin } from 'antd';
import { PageHeader } from '@/components/shared/PageHeader';
import { OverviewStats } from '@/components/dashboard/OverviewStats';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { ChannelBreakdown } from '@/components/dashboard/ChannelBreakdown';
import { useDashboard } from '@/hooks/useDashboard';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { t } = useLocale();
  const { profile } = useAuth();
  const { stats, recentOrders, channelData, loading } = useDashboard();

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <>
      <PageHeader title={`${t('dashboard.welcome')} — ${profile?.full_name || 'User'}`} />
      <OverviewStats {...stats} />
      <RecentOrders orders={recentOrders} loading={loading} />
      <ChannelBreakdown channelData={channelData} />
    </>
  );
}
