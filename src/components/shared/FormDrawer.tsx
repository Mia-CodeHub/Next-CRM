'use client';

import { Drawer, Button, Space } from 'antd';
import { useLocale } from '@/hooks/useLocale';

interface FormDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export function FormDrawer({ open, title, onClose, onSubmit, loading, children }: FormDrawerProps) {
  const { t } = useLocale();

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      size="large"
      extra={
        <Space>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="primary" onClick={onSubmit} loading={loading}>{t('common.save')}</Button>
        </Space>
      }
    >
      {children}
    </Drawer>
  );
}
