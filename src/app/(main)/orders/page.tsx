'use client';

import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/shared/PageHeader';
import { OrderTable } from '@/components/orders/OrderTable';
import { useOrders } from '@/hooks/useOrders';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import Link from 'next/link';

export default function OrdersPage() {
  const { t } = useLocale();
  const { canCreate } = useRBAC();
  const orderHook = useOrders();

  return (
    <>
      <PageHeader
        title={t('orders.title')}
        actions={canCreate && <Link href="/orders/new"><Button type="primary" icon={<PlusOutlined />}>{t('orders.new')}</Button></Link>}
      />
      <OrderTable {...orderHook} onDelete={orderHook.remove} />
    </>
  );
}
