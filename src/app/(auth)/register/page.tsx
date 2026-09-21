'use client';

import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, App, Divider } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, BankOutlined, KeyOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const { signUp, signUpWithInvite } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [hasInvite, setHasInvite] = useState(false);

  const onFinish = async (values: { email: string; password: string; full_name: string; tenant_name?: string; invite_code?: string }) => {
    setLoading(true);
    let result: { error?: string };

    if (hasInvite && values.invite_code) {
      result = await signUpWithInvite(values.email, values.password, values.full_name, values.invite_code);
    } else {
      result = await signUp(values.email, values.password, values.full_name, values.tenant_name!);
    }

    setLoading(false);
    if (result.error) {
      message.error(result.error);
    } else {
      message.success(t('auth.register_success'));
      router.push('/login');
    }
  };

  return (
    <Card className="glass-auth" style={{ width: 420, maxWidth: '90vw' }} variant="borderless">
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 4 }}>{t('auth.register')}</Title>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="full_name" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder={t('auth.full_name')} />
          </Form.Item>

          {hasInvite ? (
            <Form.Item name="invite_code" rules={[{ required: true }]}>
              <Input prefix={<KeyOutlined />} placeholder={t('auth.invite_code')} />
            </Form.Item>
          ) : (
            <Form.Item name="tenant_name" rules={[{ required: true }]}>
              <Input prefix={<BankOutlined />} placeholder={t('auth.tenant_name')} />
            </Form.Item>
          )}

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

        <Divider style={{ margin: 0 }} />

        <div style={{ textAlign: 'center' }}>
          <Button type="link" onClick={() => setHasInvite(!hasInvite)}>
            {hasInvite ? t('auth.create_new_company') : t('auth.have_invite')}
          </Button>
        </div>

        <Text style={{ textAlign: 'center', display: 'block' }}>
          {t('auth.has_account')} <Link href="/login">{t('auth.login')}</Link>
        </Text>
      </Space>
    </Card>
  );
}
