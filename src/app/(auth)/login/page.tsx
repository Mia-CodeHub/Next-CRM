'use client';

import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, App } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { signIn } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    const { error } = await signIn(values.email, values.password);
    setLoading(false);
    if (error) {
      message.error(error);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <Card className="glass-auth" style={{ width: 420, maxWidth: '90vw' }} variant="borderless">
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 4 }}>{t('auth.welcome')}</Title>
          <Text type="secondary">{t('auth.welcome_sub')}</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder={t('auth.email')} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('auth.password')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {t('auth.login')}
            </Button>
          </Form.Item>
        </Form>

        <Text style={{ textAlign: 'center', display: 'block' }}>
          {t('auth.no_account')} <Link href="/register">{t('auth.register')}</Link>
        </Text>
      </Space>
    </Card>
  );
}
