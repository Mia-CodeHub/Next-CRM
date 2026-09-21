'use client';

import { Card, Segmented, Empty } from 'antd';
import { useLocale } from '@/hooks/useLocale';
import type { Period, RevenuePoint } from '@/lib/services/dashboard.service';
import dynamic from 'next/dynamic';

const DualAxes = dynamic(() => import('@ant-design/charts').then((m) => m.DualAxes), { ssr: false });

interface Props {
  data: RevenuePoint[];
  period: Period;
  onPeriodChange: (p: Period) => void;
}

export function RevenueChart({ data, period, onPeriodChange }: Props) {
  const { t } = useLocale();

  const config = {
    xField: 'date',
    children: [
      {
        data,
        type: 'interval' as const,
        yField: 'revenue',
        style: { fill: 'rgba(16, 185, 129, 0.6)', radius: [4, 4, 0, 0] },
        axis: {
          y: {
            title: t('dashboard.revenue'),
            labelFormatter: (v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`),
          },
        },
      },
      {
        data,
        type: 'line' as const,
        yField: 'orders',
        style: { stroke: '#34D399', lineWidth: 2 },
        axis: {
          y: {
            position: 'right' as const,
            title: t('dashboard.order_count'),
          },
        },
      },
    ],
  };

  return (
    <Card
      title={t('dashboard.revenue_chart')}
      extra={
        <Segmented
          size="small"
          value={period}
          onChange={(v) => onPeriodChange(v as Period)}
          options={[
            { value: 'day', label: t('dashboard.by_day') },
            { value: 'week', label: t('dashboard.by_week') },
            { value: 'month', label: t('dashboard.by_month') },
          ]}
        />
      }
      style={{ marginTop: 16 }}
    >
      {data.length === 0 ? (
        <Empty description={t('dashboard.no_data')} />
      ) : (
        <DualAxes {...config} height={300} />
      )}
    </Card>
  );
}
