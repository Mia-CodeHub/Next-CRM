'use client';

import { Card, Select, Space, Typography, Table, App } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useCurrency } from '@/hooks/useCurrency';
import { useLocale } from '@/hooks/useLocale';
import { formatCurrency, CURRENCIES } from '@/lib/utils/currency';

const { Text, Paragraph } = Typography;

export function CurrencySettings() {
  const { t } = useLocale();
  const { currencyCode, setCurrency } = useCurrency();
  const { message } = App.useApp();

  const handleChange = async (code: string) => {
    await setCurrency(code);
    message.success(t('common.save'));
  };

  const columns = [
    { title: t('currency.code'), dataIndex: 'code', width: 80, render: (v: string) => <Text strong>{v}</Text> },
    { title: t('currency.symbol'), dataIndex: 'symbol', width: 60 },
    { title: t('currency.name'), dataIndex: 'name' },
    {
      title: t('currency.example'),
      key: 'example',
      render: (_: unknown, record: { code: string }) => formatCurrency(1000000, record.code),
    },
  ];

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Card size="small">
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Space>
            <DollarOutlined style={{ fontSize: 18, color: '#10B981' }} />
            <Text strong>{t('currency.select')}</Text>
          </Space>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
            {t('currency.desc')}
          </Paragraph>
          <Select
            value={currencyCode}
            onChange={handleChange}
            options={CURRENCIES.map((c) => ({
              value: c.code,
              label: `${c.symbol} ${c.code} — ${c.name}`,
            }))}
            style={{ width: 300 }}
          />
        </Space>
      </Card>

      <Card title={t('currency.rates')} size="small">
        <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
          {t('currency.rates_desc')}
        </Paragraph>
        <Table
          columns={columns}
          dataSource={CURRENCIES}
          rowKey="code"
          pagination={false}
          size="small"
        />
      </Card>
    </Space>
  );
}
