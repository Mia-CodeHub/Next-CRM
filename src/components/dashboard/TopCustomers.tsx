'use client';

import { Card, Table } from 'antd';
import { useLocale } from '@/hooks/useLocale';
import { useCurrency } from '@/hooks/useCurrency';
import type { TopCustomer } from '@/lib/services/dashboard.service';

interface Props {
  data: TopCustomer[];
}

export function TopCustomers({ data }: Props) {
  const { t } = useLocale();
  const { format } = useCurrency();

  return (
    <Card title={t('dashboard.top_customers')} style={{ marginTop: 16 }}>
      <Table
        dataSource={data}
        rowKey="id"
        pagination={false}
        size="small"
        columns={[
          {
            title: '#',
            key: 'rank',
            width: 40,
            render: (_: unknown, __: unknown, idx: number) => idx + 1,
          },
          {
            title: t('customers.name'),
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: t('dashboard.order_count'),
            dataIndex: 'totalOrders',
            key: 'orders',
            align: 'right' as const,
          },
          {
            title: t('dashboard.total_spent'),
            dataIndex: 'totalSpent',
            key: 'spent',
            align: 'right' as const,
            render: (v: number) => format(v),
          },
        ]}
      />
    </Card>
  );
}
