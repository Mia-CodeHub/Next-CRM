'use client';

import { Card, Form, Input, Button, Switch, Space, Tag, Typography, Divider, App } from 'antd';
import { ShopOutlined, ApiOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/client';
import { useState, useEffect, useMemo } from 'react';

const { Text, Paragraph } = Typography;

interface ApiConfig {
  shopee?: { app_id: string; app_secret: string; shop_id: string; enabled: boolean };
  tiktok?: { app_key: string; app_secret: string; shop_id: string; enabled: boolean };
}

export function ApiIntegrationSettings() {
  const { t } = useLocale();
  const { profile } = useAuth();
  const { message } = App.useApp();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({});
  const [saving, setSaving] = useState(false);
  const [shopeeForm] = Form.useForm();
  const [tiktokForm] = Form.useForm();

  useEffect(() => {
    if (!profile?.tenant_id) return;
    supabase
      .from('tenants')
      .select('settings')
      .eq('id', profile.tenant_id)
      .single()
      .then(({ data }) => {
        const settings = (data?.settings || {}) as { api_integrations?: ApiConfig };
        const cfg = settings.api_integrations || {};
        setApiConfig(cfg);
        if (cfg.shopee) shopeeForm.setFieldsValue(cfg.shopee);
        if (cfg.tiktok) tiktokForm.setFieldsValue(cfg.tiktok);
      });
  }, [profile?.tenant_id, supabase, shopeeForm, tiktokForm]);

  const saveConfig = async (platform: 'shopee' | 'tiktok', values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const newConfig = { ...apiConfig, [platform]: { ...values } };
      const { data: current } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', profile!.tenant_id)
        .single();

      const currentSettings = (current?.settings || {}) as Record<string, unknown>;
      await supabase
        .from('tenants')
        .update({ settings: { ...currentSettings, api_integrations: newConfig } })
        .eq('id', profile!.tenant_id);

      setApiConfig(newConfig);
      message.success(t('common.save'));
    } catch {
      message.error('Failed to save');
    }
    setSaving(false);
  };

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Card
        title={
          <Space>
            <ShopOutlined style={{ color: '#ee4d2d' }} />
            <span>Shopee API</span>
            {apiConfig.shopee?.enabled
              ? <Tag color="success" icon={<CheckCircleOutlined />}>{t('api.connected')}</Tag>
              : <Tag color="default" icon={<CloseCircleOutlined />}>{t('api.disconnected')}</Tag>}
          </Space>
        }
        size="small"
      >
        <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
          {t('api.shopee_desc')}
        </Paragraph>
        <Form form={shopeeForm} layout="vertical" size="small" onFinish={(v) => saveConfig('shopee', v)}>
          <Form.Item label="App ID" name="app_id" rules={[{ required: true }]}>
            <Input placeholder="Enter Shopee App ID" />
          </Form.Item>
          <Form.Item label="App Secret" name="app_secret" rules={[{ required: true }]}>
            <Input.Password placeholder="Enter Shopee App Secret" />
          </Form.Item>
          <Form.Item label="Shop ID" name="shop_id" rules={[{ required: true }]}>
            <Input placeholder="Enter Shop ID" />
          </Form.Item>
          <Form.Item label={t('api.enable')} name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>{t('common.save')}</Button>
        </Form>
      </Card>

      <Card
        title={
          <Space>
            <ApiOutlined style={{ color: '#000' }} />
            <span>TikTok Shop API</span>
            {apiConfig.tiktok?.enabled
              ? <Tag color="success" icon={<CheckCircleOutlined />}>{t('api.connected')}</Tag>
              : <Tag color="default" icon={<CloseCircleOutlined />}>{t('api.disconnected')}</Tag>}
          </Space>
        }
        size="small"
      >
        <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
          {t('api.tiktok_desc')}
        </Paragraph>
        <Form form={tiktokForm} layout="vertical" size="small" onFinish={(v) => saveConfig('tiktok', v)}>
          <Form.Item label="App Key" name="app_key" rules={[{ required: true }]}>
            <Input placeholder="Enter TikTok App Key" />
          </Form.Item>
          <Form.Item label="App Secret" name="app_secret" rules={[{ required: true }]}>
            <Input.Password placeholder="Enter TikTok App Secret" />
          </Form.Item>
          <Form.Item label="Shop ID" name="shop_id" rules={[{ required: true }]}>
            <Input placeholder="Enter Shop ID" />
          </Form.Item>
          <Form.Item label={t('api.enable')} name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>{t('common.save')}</Button>
        </Form>
      </Card>
    </Space>
  );
}
