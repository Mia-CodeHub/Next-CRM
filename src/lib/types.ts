import type { Tables } from './supabase/types';

export type Order = Tables<'orders'> & {
  customer?: Tables<'customers'> | null;
  items?: Tables<'order_items'>[];
};

export type Product = Tables<'products'>;
export type Customer = Tables<'customers'>;
export type Profile = Tables<'profiles'>;
export type Tenant = Tables<'tenants'>;
export type ChannelType = Tables<'channel_types'>;
export type Channel = Tables<'channels'>;
export type Warehouse = Tables<'warehouses'>;
export type Inventory = Tables<'inventory'>;
export type OrderItem = Tables<'order_items'>;

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  channel?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProductFilters {
  search?: string;
  status?: string;
  channel?: string;
}

export interface CustomerFilters {
  search?: string;
  channel?: string;
}
