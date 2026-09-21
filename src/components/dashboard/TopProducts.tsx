'use client';

import { Card, Table, Avatar, Space } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { useCurrency } from '@/hooks/useCurrency';
import type { TopProduct } from '@/lib/services/dashboard.service';

interface Props {
  data: TopProduct[];
}

export function TopProducts({ data }: Props) {
  const { t } = useLocale();
  const { format } = useCurrency();

  return (
    <Card title={t('dashboard.top_products')} style={{ marginTop: 16 }}>
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
            title: t('products.name'),
            key: 'name',
            render: (_: unknown, r: TopProduct) => (
              <Space>
                <Avatar
                  shape="square"
                  size={28}
                  src={r.image_url}
                  icon={!r.image_url && <AppstoreOutlined />}
                  style={{ backgroundColor: r.image_url ? undefined : '#f0f0f0', color: '#999' }}
                />
                {r.name}
              </Space>
            ),
          },
          {
            title: t('dashboard.qty_sold'),
            dataIndex: 'totalSold',
            key: 'sold',
            align: 'right' as const,
          },
          {
            title: t('dashboard.revenue'),
            dataIndex: 'totalRevenue',
            key: 'revenue',
            align: 'right' as const,
            render: (v: number) => format(v),
          },
        ]}
      />
    </Card>
  );
}
