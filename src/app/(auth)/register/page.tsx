'use client';

import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, App } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, BankOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const { signUp } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string; full_name: string; tenant_name: string }) => {
    setLoading(true);
    const { error } = await signUp(values.email, values.password, values.full_name, values.tenant_name);
    setLoading(false);
    if (error) {
      message.error(error);
    } else {
      message.success('Registration successful! Please check your email.');
      router.push('/login');
    }
  };

  return (
    <Card style={{ width: 420, maxWidth: '90vw' }} variant="borderless">
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 4 }}>{t('auth.register')}</Title>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="full_name" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder={t('auth.full_name')} />
          </Form.Item>
          <Form.Item name="tenant_name" rules={[{ required: true }]}>
            <Input prefix={<BankOutlined />} placeholder={t('auth.tenant_name')} />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder={t('auth.email')} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('auth.password')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {t('auth.register')}
            </Button>
          </Form.Item>
        </Form>

        <Text style={{ textAlign: 'center', display: 'block' }}>
          {t('auth.has_account')} <Link href="/login">{t('auth.login')}</Link>
        </Text>
      </Space>
    </Card>
  );
}
