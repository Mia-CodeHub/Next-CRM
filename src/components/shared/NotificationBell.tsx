'use client';

import { Badge, Button, Popover, List, Typography, Space, Tag, Empty } from 'antd';
import { BellOutlined, CheckOutlined, ShoppingCartOutlined, SwapOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNotifications } from '@/hooks/useNotifications';
import { useLocale } from '@/hooks/useLocale';
import { useRouter } from 'next/navigation';
import type { Notification } from '@/lib/services/notification.service';

const { Text } = Typography;

const TYPE_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  order_new: { color: 'green', icon: <ShoppingCartOutlined /> },
  order_status: { color: 'blue', icon: <SwapOutlined /> },
  low_stock: { color: 'orange', icon: <WarningOutlined /> },
  system: { color: 'default', icon: <InfoCircleOutlined /> },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ`;
  return `${Math.floor(hours / 24)} ngày`;
}

export function NotificationBell() {
  const { notifications, unreadCount, read, readAll } = useNotifications();
  const { t } = useLocale();
  const router = useRouter();

  const handleClick = (item: Notification) => {
    if (!item.is_read) read(item.id);
    if (item.metadata?.order_id) {
      router.push(`/orders/${item.metadata.order_id}`);
    }
  };

  const content = (
    <div style={{ width: 340, maxHeight: 400, overflow: 'auto' }}>
      {unreadCount > 0 && (
        <div style={{ padding: '4px 12px', textAlign: 'right' }}>
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={readAll}>
            {t('notification.mark_all_read')}
          </Button>
        </div>
      )}
      {notifications.length === 0 ? (
        <Empty description={t('notification.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 24 }} />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
            return (
              <List.Item
                onClick={() => handleClick(item)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  background: item.is_read ? undefined : 'var(--ant-color-primary-bg)',
                  borderRadius: 8,
                  margin: '2px 4px',
                }}
              >
                <List.Item.Meta
                  avatar={<Tag color={cfg.color} icon={cfg.icon} style={{ margin: 0 }} />}
                  title={
                    <Space>
                      <Text strong={!item.is_read} style={{ fontSize: 13 }}>{item.title}</Text>
                    </Space>
                  }
                  description={
                    <Space orientation="vertical" size={0}>
                      {item.body && <Text type="secondary" style={{ fontSize: 12 }}>{item.body}</Text>}
                      <Text type="secondary" style={{ fontSize: 11 }}>{timeAgo(item.created_at)}</Text>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title={t('notification.title')}
      trigger="click"
      placement="bottomRight"
      overlayStyle={{ padding: 0 }}
    >
      <Badge count={unreadCount} size="small" offset={[-4, 4]}>
        <Button type="text" icon={<BellOutlined />} />
      </Badge>
    </Popover>
  );
}
