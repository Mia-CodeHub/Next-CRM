'use client';

import { useState } from 'react';
import { Table, Card, Space, Tag, Empty } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/shared/PageHeader';
import { WarehouseSettings } from '@/components/settings/WarehouseSettings';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useInventory } from '@/hooks/useInventory';
import type { InventoryItem } from '@/lib/services/inventory.service';

export default function WarehousesPage() {
  const { t } = useLocale();
  const { canManageWarehouse } = useRBAC();
  const wh = useWarehouses();
  const { fetchByWarehouse, inventoryByWarehouse, loading: invLoading } = useInventory();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);

  const handleSelectWarehouse = (warehouseId: string) => {
    setSelectedWarehouse(warehouseId);
    fetchByWarehouse(warehouseId);
  };

  const selectedName = wh.warehouses.find((w) => w.id === selectedWarehouse)?.name;

  const invColumns = [
    {
      title: t('products.name'),
      key: 'name',
      render: (_: unknown, r: InventoryItem) => r.product?.name ?? '-',
    },
    {
      title: t('products.sku'),
      key: 'sku',
      render: (_: unknown, r: InventoryItem) => r.product?.sku ?? '-',
    },
    {
      title: t('products.price'),
      key: 'price',
      render: (_: unknown, r: InventoryItem) => r.product?.price?.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: t('products.stock'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (v: number) => <Tag color={v > 0 ? 'green' : 'red'}>{v}</Tag>,
    },
  ];

  return (
    <>
      <PageHeader title={t('warehouse.title')} />
      {canManageWarehouse ? (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <WarehouseSettings
            warehouses={wh.warehouses}
            loading={wh.loading}
            onAdd={wh.add}
            onEdit={wh.edit}
            onDelete={wh.remove}
            onSelect={handleSelectWarehouse}
            selectedId={selectedWarehouse}
          />

          {selectedWarehouse && (
            <Card
              title={
                <Space>
                  <ShopOutlined />
                  <span>{t('inventory.warehouse_inventory')}: {selectedName}</span>
                </Space>
              }
            >
              {inventoryByWarehouse.length === 0 && !invLoading ? (
                <Empty description={t('inventory.no_products')} />
              ) : (
                <Table
                  columns={invColumns}
                  dataSource={inventoryByWarehouse}
                  rowKey="id"
                  loading={invLoading}
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          )}
        </Space>
      ) : (
        <p>{t('warehouse.no_access')}</p>
      )}
    </>
  );
}
