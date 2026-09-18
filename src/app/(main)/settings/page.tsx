'use client';

import { Card, Typography } from 'antd';
import { PageHeader } from '@/components/shared/PageHeader';
import { useLocale } from '@/hooks/useLocale';

export default function SettingsPage() {
  const { t } = useLocale();

  return (
    <>
      <PageHeader title={t('sidebar.settings')} />
      <Card>
        <Typography.Text type="secondary">
          Settings page - Tenant management, team members, roles configuration.
          (Coming soon)
        </Typography.Text>
      </Card>
    </>
  );
}
