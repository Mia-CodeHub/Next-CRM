'use client';

import { Table, Space, Tag, Input, Select, DatePicker, Typography, Tooltip } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useLocale } from '@/hooks/useLocale';
import { useState } from 'react';

const { Text } = Typography;

const ACTION_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  create: { color: 'green', icon: <PlusCircleOutlined /> },
  update: { color: 'blue', icon: <EditOutlined /> },
  delete: { color: 'red', icon: <DeleteOutlined /> },
};

const ENTITY_COLORS: Record<string, string> = {
  orders: 'purple',
  products: 'cyan',
  customers: 'orange',
  warehouses: 'geekblue',
};

export function AuditLogTab() {
  const { t } = useLocale();
  const { logs, total, loading, filters, setFilters, page, setPage, pageSize, setPageSize } = useAuditLog();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const columns = [
    {
      title: t('audit.time'),
      dataIndex: 'created_at',
      width: 160,
      render: (v: string) => new Date(v).toLocaleString('vi-VN'),
    },
    {
      title: t('audit.user'),
      dataIndex: 'user_name',
      width: 140,
      render: (v: string | null) => v || <Text type="secondary">System</Text>,
    },
    {
      title: t('audit.action'),
      dataIndex: 'action',
      width: 110,
      render: (v: string) => {
        const cfg = ACTION_CONFIG[v] || ACTION_CONFIG.update;
        return <Tag color={cfg.color} icon={cfg.icon}>{t(`audit.action_${v}`)}</Tag>;
      },
    },
    {
      title: t('audit.entity_type'),
      dataIndex: 'entity_type',
      width: 120,
      render: (v: string) => <Tag color={ENTITY_COLORS[v] || 'default'}>{t(`audit.type_${v}`)}</Tag>,
    },
    {
      title: t('audit.entity'),
      dataIndex: 'entity_label',
      ellipsis: true,
      render: (v: string | null, record: { id: string }) => (
        <Space>
          <Text>{v || '-'}</Text>
          <Tooltip title={t('audit.view_detail')}>
            <EyeOutlined
              style={{ cursor: 'pointer', opacity: 0.5 }}
              onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder={t('common.search')}
          onSearch={(v) => setFilters({ ...filters, search: v })}
          allowClear
          style={{ width: 200 }}
        />
        <Select
          placeholder={t('audit.entity_type')}
          options={[
            { value: 'orders', label: t('audit.type_orders') },
            { value: 'products', label: t('audit.type_products') },
            { value: 'customers', label: t('audit.type_customers') },
            { value: 'warehouses', label: t('audit.type_warehouses') },
          ]}
          onChange={(v) => setFilters({ ...filters, entity_type: v })}
          allowClear
          style={{ width: 150 }}
        />
        <Select
          placeholder={t('audit.action')}
          options={[
            { value: 'create', label: t('audit.action_create') },
            { value: 'update', label: t('audit.action_update') },
            { value: 'delete', label: t('audit.action_delete') },
          ]}
          onChange={(v) => setFilters({ ...filters, action: v })}
          allowClear
          style={{ width: 130 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={logs}
        loading={loading}
        rowKey="id"
        size="small"
        expandable={{
          expandedRowKeys: expandedId ? [expandedId] : [],
          expandedRowRender: (record) => (
            <div style={{ maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
              {record.action === 'update' && record.old_data && record.new_data && (
                <ChangeDiff oldData={record.old_data} newData={record.new_data} />
              )}
              {record.action === 'create' && record.new_data && (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(record.new_data, null, 2)}</pre>
              )}
              {record.action === 'delete' && record.old_data && (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(record.old_data, null, 2)}</pre>
              )}
            </div>
          ),
          showExpandColumn: false,
        }}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          showSizeChanger: true,
          showTotal: (t) => `${t} ${t === 1 ? 'record' : 'records'}`,
        }}
        scroll={{ x: 700 }}
      />
    </>
  );
}

function ChangeDiff({ oldData, newData }: { oldData: Record<string, unknown>; newData: Record<string, unknown> }) {
  const SKIP = ['updated_at', 'created_at', 'tenant_id', 'id'];
  const changes = Object.keys(newData).filter(
    (k) => !SKIP.includes(k) && JSON.stringify(oldData[k]) !== JSON.stringify(newData[k])
  );

  if (changes.length === 0) return <Text type="secondary">No visible changes</Text>;

  return (
    <table style={{ fontSize: 12, width: '100%' }}>
      <thead>
        <tr>
          <th style={{ padding: '2px 8px', textAlign: 'left' }}>Field</th>
          <th style={{ padding: '2px 8px', textAlign: 'left', color: '#ff4d4f' }}>Old</th>
          <th style={{ padding: '2px 8px', textAlign: 'left', color: '#10B981' }}>New</th>
        </tr>
      </thead>
      <tbody>
        {changes.map((k) => (
          <tr key={k}>
            <td style={{ padding: '2px 8px', fontWeight: 600 }}>{k}</td>
            <td style={{ padding: '2px 8px', color: '#ff4d4f' }}>{String(oldData[k] ?? '-')}</td>
            <td style={{ padding: '2px 8px', color: '#10B981' }}>{String(newData[k] ?? '-')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
