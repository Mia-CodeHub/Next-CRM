export const CHANNELS = [
  { value: 'shopee', label: 'Shopee', color: '#EE4D2D' },
  { value: 'tiktok_shop', label: 'TikTok Shop', color: '#000000' },
  { value: 'telesale', label: 'Telesale', color: '#39FF14' },
] as const;

export const ORDER_STATUSES = [
  { value: 'pending', label: 'orders.status_pending', color: 'default' },
  { value: 'confirmed', label: 'orders.status_confirmed', color: 'processing' },
  { value: 'shipping', label: 'orders.status_shipping', color: 'warning' },
  { value: 'delivered', label: 'orders.status_delivered', color: 'success' },
  { value: 'cancelled', label: 'orders.status_cancelled', color: 'error' },
  { value: 'returned', label: 'orders.status_returned', color: 'magenta' },
] as const;

export const PRODUCT_STATUSES = [
  { value: 'active', label: 'products.status_active', color: 'success' },
  { value: 'inactive', label: 'products.status_inactive', color: 'default' },
  { value: 'draft', label: 'products.status_draft', color: 'warning' },
] as const;

export const ROLES = ['admin', 'staff', 'viewer'] as const;
