'use client';

import { Button, Space, App, Segmented } from 'antd';
import { PlusOutlined, DownloadOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/shared/PageHeader';
import { OrderTable } from '@/components/orders/OrderTable';
import { OrderKanban } from '@/components/orders/OrderKanban';
import { useOrders } from '@/hooks/useOrders';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import { createBrowserClient } from '@/lib/supabase/client';
import { getOrdersForExport } from '@/lib/services/dashboard.service';
import { exportOrdersToCSV } from '@/lib/utils/export';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function OrdersPage() {
  const { t } = useLocale();
  const { canCreate } = useRBAC();
  const orderHook = useOrders();
  const { message } = App.useApp();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await getOrdersForExport(supabase);
      exportOrdersToCSV(data as Parameters<typeof exportOrdersToCSV>[0], t);
      message.success(t('export.success'));
    } catch {
      message.error(t('export.failed'));
    }
    setExporting(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderHook.update(orderId, { status: newStatus } as Parameters<typeof orderHook.update>[1]);
      message.success(t('common.save'));
    } catch {
      message.error('Failed');
    }
  };

  return (
    <>
      <PageHeader
        title={t('orders.title')}
        actions={
          <Space>
            <Segmented
              size="small"
              value={viewMode}
              onChange={(v) => setViewMode(v as 'table' | 'kanban')}
              options={[
                { value: 'table', icon: <UnorderedListOutlined /> },
                { value: 'kanban', icon: <AppstoreOutlined /> },
              ]}
            />
            <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exporting}>
              {t('export.excel')}
            </Button>
            {canCreate && (
              <Link href="/orders/new">
                <Button type="primary" icon={<PlusOutlined />}>{t('orders.new')}</Button>
              </Link>
            )}
          </Space>
        }
      />
      {viewMode === 'table' ? (
        <OrderTable {...orderHook} onDelete={orderHook.remove} />
      ) : (
        <OrderKanban
          orders={orderHook.orders}
          loading={orderHook.loading}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
