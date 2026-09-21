'use client';

import { Card, Table, Button, Space, Input, Tag, Popconfirm, Form, ColorPicker, App, Badge, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined, ShopOutlined, LinkOutlined } from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { useState } from 'react';
import type { ChannelTypeItem, ChannelItem } from '@/hooks/useChannels';

interface Props {
  channelTypes: ChannelTypeItem[];
  channels: ChannelItem[];
  loading: boolean;
  onAddType: (v: { name: string; color?: string }) => Promise<void>;
  onEditType: (id: string, v: { name?: string; color?: string }) => Promise<void>;
  onDeleteType: (id: string) => Promise<void>;
  onAddChannel: (v: { channel_type_id: string; name: string; url?: string }) => Promise<void>;
  onEditChannel: (id: string, v: { name?: string; url?: string; is_active?: boolean }) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<void>;
}

export function ChannelSettings({ channelTypes, channels, loading, onAddType, onEditType, onDeleteType, onAddChannel, onEditChannel, onDeleteChannel }: Props) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [addingType, setAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#10B981');
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState('');
  const [editTypeColor, setEditTypeColor] = useState('');
  const [addingShopFor, setAddingShopFor] = useState<string | null>(null);
  const [newShopName, setNewShopName] = useState('');
  const [newShopUrl, setNewShopUrl] = useState('');

  const handleAddType = async () => {
    if (!newTypeName.trim()) return;
    await onAddType({ name: newTypeName.trim(), color: newTypeColor });
    setNewTypeName('');
    setNewTypeColor('#10B981');
    setAddingType(false);
    message.success(t('common.save'));
  };

  const handleEditType = async (id: string) => {
    await onEditType(id, { name: editTypeName, color: editTypeColor });
    setEditingTypeId(null);
    message.success(t('common.save'));
  };

  const handleAddShop = async (typeId: string) => {
    if (!newShopName.trim()) return;
    await onAddChannel({ channel_type_id: typeId, name: newShopName.trim(), url: newShopUrl.trim() || undefined });
    setNewShopName('');
    setNewShopUrl('');
    setAddingShopFor(null);
    message.success(t('common.save'));
  };

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{t('channels.types')}</h3>
        {!addingType && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddingType(true)}>
            {t('channels.add_type')}
          </Button>
        )}
      </div>

      {addingType && (
        <Card size="small">
          <Space>
            <Input
              placeholder={t('channels.type_name')}
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onPressEnter={handleAddType}
              style={{ width: 200 }}
            />
            <ColorPicker value={newTypeColor} onChange={(_, hex) => setNewTypeColor(hex)} size="small" />
            <Button type="primary" icon={<SaveOutlined />} onClick={handleAddType} />
            <Button icon={<CloseOutlined />} onClick={() => setAddingType(false)} />
          </Space>
        </Card>
      )}

      {channelTypes.map((ct) => {
        const typeChannels = channels.filter((c) => c.channel_type_id === ct.id);
        const isEditing = editingTypeId === ct.id;

        return (
          <Card
            key={ct.id}
            size="small"
            title={
              isEditing ? (
                <Space>
                  <Input
                    value={editTypeName}
                    onChange={(e) => setEditTypeName(e.target.value)}
                    style={{ width: 180 }}
                  />
                  <ColorPicker value={editTypeColor} onChange={(_, hex) => setEditTypeColor(hex)} size="small" />
                  <Button size="small" type="primary" icon={<SaveOutlined />} onClick={() => handleEditType(ct.id)} />
                  <Button size="small" icon={<CloseOutlined />} onClick={() => setEditingTypeId(null)} />
                </Space>
              ) : (
                <Space>
                  <Badge color={ct.color} />
                  <span>{ct.name}</span>
                  <Tag>{typeChannels.length} {t('channels.shops').toLowerCase()}</Tag>
                </Space>
              )
            }
            extra={
              !isEditing && (
                <Space>
                  <Button
                    size="small"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => { setEditingTypeId(ct.id); setEditTypeName(ct.name); setEditTypeColor(ct.color); }}
                  />
                  <Popconfirm title={t('common.confirm_delete')} onConfirm={() => onDeleteType(ct.id)}>
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              )
            }
          >
            <Table
              size="small"
              dataSource={typeChannels}
              rowKey="id"
              loading={loading}
              pagination={false}
              columns={[
                {
                  title: <><ShopOutlined /> {t('channels.shop_name')}</>,
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: <><LinkOutlined /> URL</>,
                  dataIndex: 'url',
                  key: 'url',
                  render: (v: string) => v ? <a href={v} target="_blank" rel="noreferrer">{v}</a> : '-',
                },
                {
                  title: t('common.status'),
                  key: 'active',
                  width: 100,
                  render: (_: unknown, r: ChannelItem) => (
                    <Switch
                      checked={r.is_active}
                      size="small"
                      onChange={(checked) => onEditChannel(r.id, { is_active: checked })}
                    />
                  ),
                },
                {
                  title: t('common.actions'),
                  key: 'actions',
                  width: 80,
                  render: (_: unknown, r: ChannelItem) => (
                    <Popconfirm title={t('common.confirm_delete')} onConfirm={() => onDeleteChannel(r.id)}>
                      <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  ),
                },
              ]}
            />
            {addingShopFor === ct.id ? (
              <Space style={{ marginTop: 8 }}>
                <Input
                  placeholder={t('channels.shop_name')}
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  onPressEnter={() => handleAddShop(ct.id)}
                  style={{ width: 180 }}
                />
                <Input
                  placeholder="URL"
                  value={newShopUrl}
                  onChange={(e) => setNewShopUrl(e.target.value)}
                  style={{ width: 200 }}
                />
                <Button size="small" type="primary" icon={<SaveOutlined />} onClick={() => handleAddShop(ct.id)} />
                <Button size="small" icon={<CloseOutlined />} onClick={() => setAddingShopFor(null)} />
              </Space>
            ) : (
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setAddingShopFor(ct.id)}
                style={{ marginTop: 8 }}
              >
                {t('channels.add_shop')}
              </Button>
            )}
          </Card>
        );
      })}
    </Space>
  );
}
