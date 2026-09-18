'use client';

import { Flex, Typography } from 'antd';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
      <Title level={3} style={{ margin: 0 }}>{title}</Title>
      {actions && <Flex gap={8}>{actions}</Flex>}
    </Flex>
  );
}
