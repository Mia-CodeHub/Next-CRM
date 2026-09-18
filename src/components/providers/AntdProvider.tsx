'use client';

import { ConfigProvider, App } from 'antd';
import { useTheme } from './ThemeProvider';
import { useLocale } from './LocaleProvider';
import { darkTheme, lightTheme } from '@/lib/theme/tokens';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  const { locale } = useLocale();

  return (
    <ConfigProvider theme={isDark ? darkTheme : lightTheme} locale={locale === 'vi' ? viVN : enUS}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
