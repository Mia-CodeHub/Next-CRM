'use client';

import { Card, Form, Input, Button, Avatar, Space, Tag, App } from 'antd';
import { UserOutlined, SaveOutlined, CameraOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { createBrowserClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/services/team.service';
import { uploadFile, getStoragePath } from '@/lib/services/upload.service';
import { useState, useEffect, useMemo, useRef } from 'react';

const ROLE_COLORS: Record<string, string> = { admin: 'red', staff: 'blue', warehouse: 'orange', viewer: 'default' };

export function ProfileCard() {
  const { user, profile } = useAuth();
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({ full_name: profile.full_name });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, form]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.tenant_id) return;
    setUploading(true);
    try {
      const path = getStoragePath(profile.tenant_id, 'avatars', file.name);
      const publicUrl = await uploadFile(supabase, 'avatars', path, file);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      setAvatarUrl(publicUrl);
      message.success(t('common.save'));
    } catch {
      message.error(t('image.upload_failed'));
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await updateProfile(supabase, profile!.id, { full_name: values.full_name });
      message.success(t('common.save'));
      window.location.reload();
    } catch {
      message.error('Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <Card title={t('settings.profile')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Space size="large" align="start">
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar
              size={72}
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              style={{ backgroundColor: avatarUrl ? undefined : '#10B981', color: '#fff' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#10B981',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
              }}
            >
              <CameraOutlined style={{ color: '#fff', fontSize: 12 }} />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{profile?.full_name || 'User'}</div>
            <div style={{ opacity: 0.6, marginBottom: 8 }}>{user?.email}</div>
            <Tag color={ROLE_COLORS[profile?.role || 'viewer']}>
              {t(`settings.role_${profile?.role || 'viewer'}`)}
            </Tag>
          </div>
        </Space>

        <Form form={form} layout="vertical" style={{ maxWidth: 400 }}>
          <Form.Item label={t('auth.full_name')} name="full_name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t('auth.email')}>
            <Input value={user?.email || ''} disabled />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={saving || uploading} onClick={handleSave}>
              {t('common.save')}
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
}
