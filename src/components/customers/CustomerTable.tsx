'use client';

import { Table, Input, Select, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ChannelTag } from '@/components/shared/ChannelTag';
import { useLocale } from '@/hooks/useLocale';
import { useRBAC } from '@/hooks/useRBAC';
import { CHANNELS } from '@/lib/constants';
import type { Customer, CustomerFilters, PaginationParams } from '@/lib/types';

interface Props {
  customers: Customer[];
  loading: boolean;
  total: number;
  filters: CustomerFilters;
  setFilters: (f: CustomerFilters) => void;
  pagination: PaginationParams;
  setPagination: (p: PaginationParams) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export function CustomerTable({ customers, loading, total, filters, setFilters, pagination, setPagination, onEdit, onDelete }: Props) {
  const { t } = useLocale();
  const { canEdit, canDelete } = useRBAC();

  const columns = [
    { title: t('customers.name'), dataIndex: 'name', key: 'name' },
    { title: t('customers.phone'), dataIndex: 'phone', key: 'phone' },
    { title: t('customers.email'), dataIndex: 'email', key: 'email' },
    { title: t('customers.channel'), dataIndex: 'channel_id', key: 'channel', render: (v: string) => v ? <ChannelTag channel={v} /> : '-' },
    ...(canEdit || canDelete ? [{
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, record: Customer) => (
        <Space>
          {canEdit && <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />}
          {canDelete && (
            <Popconfirm title={t('common.confirm_delete')} onConfirm={() => onDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    }] : []),
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search placeholder={t('common.search')} onSearch={(v) => setFilters({ ...filters, search: v })} allowClear style={{ width: 250 }} />
        <Select
          options={CHANNELS.map((c) => ({ value: c.value, label: c.label }))}
          onChange={(v) => setFilters({ ...filters, channel: v })}
          allowClear
          placeholder={t('customers.channel')}
          style={{ width: 150 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={customers}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total,
          onChange: (page, pageSize) => setPagination({ page, pageSize }),
          showSizeChanger: true,
        }}
        size="small"
        scroll={{ x: 800 }}
      />
    </>
  );
}
