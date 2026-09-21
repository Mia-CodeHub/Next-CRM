'use client';

import { useState } from 'react';
import { Upload, Input, Space, Button, Image, App, Segmented } from 'antd';
import { UploadOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { createBrowserClient } from '@/lib/supabase/client';
import { uploadFile, getStoragePath } from '@/lib/services/upload.service';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import type { UploadFile } from 'antd';

interface Props {
  value?: string | null;
  onChange?: (url: string | null) => void;
  bucket: string;
  folder: string;
  shape?: 'square' | 'circle';
  size?: number;
}

export function ImageUploader({ value, onChange, bucket, folder, shape = 'square', size = 120 }: Props) {
  const { t } = useLocale();
  const { profile } = useAuth();
  const { message } = App.useApp();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!profile?.tenant_id) return;
    setUploading(true);
    try {
      const path = getStoragePath(profile.tenant_id, folder, file.name);
      const publicUrl = await uploadFile(supabase, bucket, path, file);
      onChange?.(publicUrl);
      message.success(t('common.save'));
    } catch {
      message.error(t('image.upload_failed'));
    }
    setUploading(false);
  };

  const handleUrlConfirm = () => {
    const url = urlInput.trim();
    if (!url) return;
    onChange?.(url);
    setUrlInput('');
  };

  const handleRemove = () => {
    onChange?.(null);
  };

  if (value) {
    return (
      <Space orientation="vertical" size="small">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Image
            src={value}
            width={size}
            height={size}
            style={{
              objectFit: 'cover',
              borderRadius: shape === 'circle' ? '50%' : 8,
            }}
            preview={{ mask: null }}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI2MCIgeT0iNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
          />
        </div>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={handleRemove}>
          {t('image.remove')}
        </Button>
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size="small" style={{ width: '100%' }}>
      <Segmented
        size="small"
        value={mode}
        onChange={(v) => setMode(v as 'upload' | 'url')}
        options={[
          { value: 'upload', icon: <UploadOutlined />, label: t('image.upload') },
          { value: 'url', icon: <LinkOutlined />, label: t('image.url') },
        ]}
      />

      {mode === 'upload' ? (
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file: UploadFile) => {
            handleUpload(file as unknown as File);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />} loading={uploading} style={{ width: '100%' }}>
            {uploading ? t('image.uploading') : t('image.select_file')}
          </Button>
        </Upload>
      ) : (
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onPressEnter={handleUrlConfirm}
          />
          <Button type="primary" onClick={handleUrlConfirm}>
            OK
          </Button>
        </Space.Compact>
      )}
    </Space>
  );
}
