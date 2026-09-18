'use client';

import { Card, Statistic } from 'antd';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, prefix, suffix, icon }: StatCardProps) {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={prefix || icon}
        suffix={suffix}
      />
    </Card>
  );
}
