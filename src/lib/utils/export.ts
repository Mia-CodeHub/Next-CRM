export function exportToCSV(data: Record<string, unknown>[], filename: string, headers: { key: string; label: string }[]) {
  const BOM = '﻿';
  const headerRow = headers.map((h) => `"${h.label}"`).join(',');
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h.key];
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );

  const csv = BOM + [headerRow, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportOrdersToCSV(
  orders: {
    order_code?: string;
    customer?: { name?: string; phone?: string; email?: string } | null;
    channel_id?: string;
    status?: string;
    total?: number;
    shipping_fee?: number;
    discount?: number;
    ordered_at?: string;
    notes?: string;
    items?: { product_name: string; quantity: number; unit_price: number; subtotal: number }[];
  }[],
  t: (key: string) => string
) {
  const flat = orders.flatMap((o) => {
    const items = o.items || [];
    if (items.length === 0) {
      return [{
        order_code: o.order_code || '',
        customer_name: o.customer?.name || '',
        customer_phone: o.customer?.phone || '',
        status: o.status || '',
        product_name: '',
        quantity: 0 as number | string,
        unit_price: 0 as number | string,
        subtotal: 0 as number | string,
        shipping_fee: o.shipping_fee || 0,
        discount: o.discount || 0,
        total: o.total || 0,
        ordered_at: o.ordered_at ? new Date(o.ordered_at).toLocaleDateString('vi-VN') : '',
        notes: o.notes || '',
      }];
    }
    return items.map((item, idx) => ({
      order_code: idx === 0 ? (o.order_code || '') : '',
      customer_name: idx === 0 ? (o.customer?.name || '') : '',
      customer_phone: idx === 0 ? (o.customer?.phone || '') : '',
      status: idx === 0 ? (o.status || '') : '',
      product_name: item.product_name,
      quantity: item.quantity as number | string,
      unit_price: item.unit_price as number | string,
      subtotal: item.subtotal as number | string,
      shipping_fee: idx === 0 ? (o.shipping_fee || 0) : '' as number | string,
      discount: idx === 0 ? (o.discount || 0) : '' as number | string,
      total: idx === 0 ? (o.total || 0) : '' as number | string,
      ordered_at: idx === 0 ? (o.ordered_at ? new Date(o.ordered_at).toLocaleDateString('vi-VN') : '') : '',
      notes: idx === 0 ? (o.notes || '') : '',
    }));
  });

  const headers = [
    { key: 'order_code', label: t('orders.code') },
    { key: 'customer_name', label: t('orders.customer') },
    { key: 'customer_phone', label: t('customers.phone') },
    { key: 'status', label: t('orders.status') },
    { key: 'product_name', label: t('products.name') },
    { key: 'quantity', label: t('dashboard.qty_sold') },
    { key: 'unit_price', label: t('products.price') },
    { key: 'subtotal', label: t('common.total') },
    { key: 'shipping_fee', label: t('orders.shipping_fee') },
    { key: 'discount', label: t('orders.discount') },
    { key: 'total', label: t('orders.total') },
    { key: 'ordered_at', label: t('orders.date') },
    { key: 'notes', label: t('orders.notes') },
  ];

  exportToCSV(flat as Record<string, unknown>[], 'orders', headers);
}
