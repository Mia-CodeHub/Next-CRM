import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { AntdProvider } from '@/components/providers/AntdProvider';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Next-CRM',
  description: 'Customer Relationship Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.className}>
      <body>
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <AntdProvider>{children}</AntdProvider>
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
