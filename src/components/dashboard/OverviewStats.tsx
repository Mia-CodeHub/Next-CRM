'use client';

import { Col, Row } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, TeamOutlined, AppstoreOutlined } from '@ant-design/icons';
import { StatCard } from '@/components/shared/StatCard';
import { useLocale } from '@/hooks/useLocale';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
}

export function OverviewStats({ totalOrders, totalRevenue, totalCustomers, totalProducts }: Props) {
  const { t } = useLocale();
  const { format } = useCurrency();

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title={t('dashboard.total_orders')} value={totalOrders} icon={<ShoppingCartOutlined style={{ color: '#10B981' }} />} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title={t('dashboard.total_revenue')} value={format(totalRevenue)} icon={<DollarOutlined style={{ color: '#34D399' }} />} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title={t('dashboard.total_customers')} value={totalCustomers} icon={<TeamOutlined style={{ color: '#10B981' }} />} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title={t('dashboard.total_products')} value={totalProducts} icon={<AppstoreOutlined style={{ color: '#34D399' }} />} />
      </Col>
    </Row>
  );
}
