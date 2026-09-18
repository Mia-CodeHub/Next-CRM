'use client';

import { Card, Row, Col, Statistic, Progress } from 'antd';
import { CHANNELS } from '@/lib/constants';
import { useLocale } from '@/hooks/useLocale';

interface Props {
  channelData: Record<string, { total: number; delivered: number; returned: number }>;
}

export function ChannelBreakdown({ channelData }: Props) {
  const { t } = useLocale();
  const totalAll = Object.values(channelData).reduce((s, c) => s + c.total, 0) || 1;

  return (
    <Card title={t('dashboard.by_channel')} style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]}>
        {CHANNELS.map((ch) => {
          const data = channelData[ch.value] || { total: 0, delivered: 0, returned: 0 };
          const pct = Math.round((data.total / totalAll) * 100);
          return (
            <Col xs={24} sm={8} key={ch.value}>
              <Card size="small">
                <Statistic title={ch.label} value={data.total} suffix={`(${pct}%)`} />
                <Progress percent={pct} strokeColor={ch.color} showInfo={false} size="small" />
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                  Delivered: {data.delivered} | Returned: {data.returned}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
}
