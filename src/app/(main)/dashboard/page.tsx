'use client';

import { Spin, Row, Col } from 'antd';
import { PageHeader } from '@/components/shared/PageHeader';
import { OverviewStats } from '@/components/dashboard/OverviewStats';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { ChannelBreakdown } from '@/components/dashboard/ChannelBreakdown';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { TopCustomers } from '@/components/dashboard/TopCustomers';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { useDashboard } from '@/hooks/useDashboard';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { t } = useLocale();
  const { profile } = useAuth();
  const {
    stats, recentOrders, channelData,
    revenueData, topProducts, topCustomers, lowStock,
    period, setPeriod, loading,
  } = useDashboard();

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <>
      <PageHeader title={`${t('dashboard.welcome')} — ${profile?.full_name || 'User'}`} />
      <OverviewStats {...stats} />
      <RevenueChart data={revenueData} period={period} onPeriodChange={setPeriod} />
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <TopProducts data={topProducts} />
        </Col>
        <Col xs={24} lg={12}>
          <TopCustomers data={topCustomers} />
        </Col>
      </Row>
      <LowStockAlert data={lowStock} />
      <ChannelBreakdown channelData={channelData} />
      <RecentOrders orders={recentOrders} loading={loading} />
    </>
  );
}
