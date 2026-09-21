'use client';

import { Flex } from 'antd';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      justify="center"
      align="center"
      style={{ minHeight: '100vh' }}
    >
      {children}
    </Flex>
  );
}
