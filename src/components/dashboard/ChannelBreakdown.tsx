'use client';

import { Card, Row, Col, Statistic, Progress } from 'antd';
import { useChannels } from '@/hooks/useChannels';
import { useLocale } from '@/hooks/useLocale';

interface Props {
  channelData: Record<string, { total: number; delivered: number; returned: number }>;
}

export function ChannelBreakdown({ channelData }: Props) {
  const { t } = useLocale();
  const { channels } = useChannels();
  const totalAll = Object.values(channelData).reduce((s, c) => s + c.total, 0) || 1;

  const entries = Object.entries(channelData);
  if (entries.length === 0 && channels.length === 0) return null;

  return (
    <Card title={t('dashboard.by_channel')} style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]}>
        {entries.map(([channelId, data]) => {
          const ch = channels.find((c) => c.id === channelId);
          const label = ch ? `${ch.channel_type?.name ?? ''} — ${ch.name}` : channelId;
          const color = ch?.channel_type?.color ?? '#10B981';
          const pct = Math.round((data.total / totalAll) * 100);
          return (
            <Col xs={24} sm={8} key={channelId}>
              <Card size="small">
                <Statistic title={label} value={data.total} suffix={`(${pct}%)`} />
                <Progress percent={pct} strokeColor={color} showInfo={false} size="small" />
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
