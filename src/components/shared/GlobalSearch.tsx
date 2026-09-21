'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, Input, List, Avatar, Tag, Typography, Space, Empty } from 'antd';
import {
  SearchOutlined, ShoppingCartOutlined, AppstoreOutlined,
  TeamOutlined, ShopOutlined,
} from '@ant-design/icons';
import { createBrowserClient } from '@/lib/supabase/client';
import { useLocale } from '@/hooks/useLocale';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

interface SearchResult {
  id: string;
  type: 'order' | 'product' | 'customer';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  href: string;
  tag?: { label: string; color: string };
}

const TYPE_CONFIG = {
  order: { icon: <ShoppingCartOutlined style={{ color: '#10B981' }} />, color: 'green' },
  product: { icon: <AppstoreOutlined style={{ color: '#34D399' }} />, color: 'cyan' },
  customer: { icon: <TeamOutlined style={{ color: '#10B981' }} />, color: 'blue' },
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const supabase = useMemo(() => createBrowserClient(), []);
  const { t } = useLocale();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSelectedIdx(0);
    }
  }, [open]);

  const search = (q: string) => {
    setQuery(q);
    setSelectedIdx(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const term = `%${q.trim()}%`;
      const items: SearchResult[] = [];

      try {
        const [orders, products, customers] = await Promise.all([
          supabase.from('orders').select('id, order_code, status, total').ilike('order_code', term).limit(5),
          supabase.from('products').select('id, name, sku, price, image_url').ilike('name', term).limit(5),
          supabase.from('customers').select('id, name, phone').ilike('name', term).limit(5),
        ]);

        (orders.data ?? []).forEach((o: { id: string; order_code: string; status: string; total: number }) => {
          items.push({
            id: o.id, type: 'order',
            title: o.order_code || o.id.slice(0, 8),
            subtitle: `${Number(o.total).toLocaleString('vi-VN')} đ`,
            icon: TYPE_CONFIG.order.icon,
            href: `/orders/${o.id}`,
            tag: { label: o.status, color: o.status === 'delivered' ? 'green' : 'default' },
          });
        });

        (products.data ?? []).forEach((p: { id: string; name: string; sku: string | null; price: number; image_url: string | null }) => {
          items.push({
            id: p.id, type: 'product',
            title: p.name,
            subtitle: `${p.sku || ''} — ${Number(p.price).toLocaleString('vi-VN')} đ`,
            icon: p.image_url
              ? <Avatar shape="square" size={24} src={p.image_url} />
              : TYPE_CONFIG.product.icon,
            href: `/products`,
          });
        });

        (customers.data ?? []).forEach((c: { id: string; name: string; phone: string | null }) => {
          items.push({
            id: c.id, type: 'customer',
            title: c.name,
            subtitle: c.phone || '',
            icon: TYPE_CONFIG.customer.icon,
            href: `/customers`,
          });
        });
      } catch {
        // silently fail
      }

      setResults(items);
      setLoading(false);
    }, 300);
  };

  const navigate = (result: SearchResult) => {
    setOpen(false);
    router.push(result.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      navigate(results[selectedIdx]);
    }
  };

  const typeLabel = { order: t('sidebar.orders'), product: t('sidebar.products'), customer: t('sidebar.customers') };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      closable={false}
      width={520}
      styles={{ body: { padding: 0 } }}
      style={{ top: 80 }}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Input
          ref={inputRef as React.Ref<never>}
          prefix={<SearchOutlined style={{ color: '#999' }} />}
          placeholder={`${t('search.placeholder')} (Ctrl+K)`}
          value={query}
          onChange={(e) => search(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="borderless"
          size="large"
          autoFocus
        />
      </div>
      <div style={{ maxHeight: 400, overflow: 'auto', padding: query ? '8px 0' : 0 }}>
        {query && results.length === 0 && !loading && (
          <Empty description={t('search.no_results')} style={{ padding: 24 }} />
        )}
        {results.length > 0 && (
          <List
            dataSource={results}
            loading={loading}
            renderItem={(item, idx) => (
              <List.Item
                key={item.id}
                onClick={() => navigate(item)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  background: idx === selectedIdx ? 'rgba(16, 185, 129, 0.08)' : undefined,
                }}
                onMouseEnter={() => setSelectedIdx(idx)}
              >
                <List.Item.Meta
                  avatar={item.icon}
                  title={
                    <Space>
                      <span>{item.title}</span>
                      <Tag color={TYPE_CONFIG[item.type].color} style={{ fontSize: 10 }}>
                        {typeLabel[item.type]}
                      </Tag>
                      {item.tag && <Tag color={item.tag.color} style={{ fontSize: 10 }}>{item.tag.label}</Tag>}
                    </Space>
                  }
                  description={<Text type="secondary" style={{ fontSize: 12 }}>{item.subtitle}</Text>}
                />
              </List.Item>
            )}
          />
        )}
      </div>
      {!query && (
        <div style={{ padding: 16, textAlign: 'center', opacity: 0.5, fontSize: 13 }}>
          {t('search.hint')}
        </div>
      )}
    </Modal>
  );
}
