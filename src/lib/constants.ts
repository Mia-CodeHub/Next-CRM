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

export const ROLES = ['admin', 'staff', 'warehouse', 'viewer'] as const;

export const PERMISSIONS = [
  { key: 'dashboard.view', module: 'dashboard' },
  { key: 'orders.view', module: 'orders' },
  { key: 'orders.create', module: 'orders' },
  { key: 'orders.edit', module: 'orders' },
  { key: 'orders.delete', module: 'orders' },
  { key: 'orders.export', module: 'orders' },
  { key: 'products.view', module: 'products' },
  { key: 'products.create', module: 'products' },
  { key: 'products.edit', module: 'products' },
  { key: 'products.delete', module: 'products' },
  { key: 'customers.view', module: 'customers' },
  { key: 'customers.create', module: 'customers' },
  { key: 'customers.edit', module: 'customers' },
  { key: 'customers.delete', module: 'customers' },
  { key: 'warehouses.view', module: 'warehouses' },
  { key: 'warehouses.manage', module: 'warehouses' },
  { key: 'inventory.view', module: 'inventory' },
  { key: 'inventory.manage', module: 'inventory' },
  { key: 'settings.view', module: 'settings' },
  { key: 'settings.team', module: 'settings' },
  { key: 'settings.channels', module: 'settings' },
  { key: 'settings.api', module: 'settings' },
  { key: 'settings.currency', module: 'settings' },
  { key: 'audit.view', module: 'audit' },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];

export const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  admin: PERMISSIONS.map((p) => p.key),
  staff: [
    'dashboard.view',
    'orders.view', 'orders.create', 'orders.edit', 'orders.export',
    'products.view', 'products.create', 'products.edit',
    'customers.view', 'customers.create', 'customers.edit',
    'warehouses.view',
    'inventory.view',
    'settings.view',
  ],
  warehouse: [
    'dashboard.view',
    'orders.view',
    'products.view',
    'warehouses.view', 'warehouses.manage',
    'inventory.view', 'inventory.manage',
    'settings.view',
  ],
  viewer: [
    'dashboard.view',
    'orders.view',
    'products.view',
    'customers.view',
    'warehouses.view',
    'inventory.view',
    'settings.view',
  ],
};
