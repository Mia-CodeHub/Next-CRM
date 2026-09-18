'use client';

import { Flex } from 'antd';
import { useTheme } from '@/hooks/useTheme';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        minHeight: '100vh',
        background: isDark ? '#0f0f1a' : '#f5f5f5',
      }}
    >
      {children}
    </Flex>
  );
}
