'use client';

import { Card, Table, Tag, Avatar, Space } from 'antd';
import { WarningOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import type { LowStockProduct } from '@/lib/services/dashboard.service';

interface Props {
  data: LowStockProduct[];
}

export function LowStockAlert({ data }: Props) {
  const { t } = useLocale();

  if (data.length === 0) return null;

  return (
    <Card
      title={
        <Space>
          <WarningOutlined style={{ color: '#f59e0b' }} />
          {t('dashboard.low_stock')}
        </Space>
      }
      style={{ marginTop: 16 }}
    >
      <Table
        dataSource={data}
        rowKey="id"
        pagination={false}
        size="small"
        columns={[
          {
            title: t('products.name'),
            key: 'name',
            render: (_: unknown, r: LowStockProduct) => (
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
            title: t('products.sku'),
            dataIndex: 'sku',
            key: 'sku',
            render: (v: string) => v || '-',
          },
          {
            title: t('products.stock'),
            dataIndex: 'stock',
            key: 'stock',
            align: 'right' as const,
            render: (v: number) => (
              <Tag color={v === 0 ? 'red' : 'orange'}>{v}</Tag>
            ),
          },
        ]}
      />
    </Card>
  );
}
