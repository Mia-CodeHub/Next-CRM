export type Role = 'admin' | 'staff' | 'viewer';
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
export type ProductStatus = 'active' | 'inactive' | 'draft';
export type ChannelId = 'shopee' | 'tiktok_shop' | 'telesale';

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: { id: string; name: string; slug: string; settings: Record<string, unknown>; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>;
      };
      profiles: {
        Row: { id: string; tenant_id: string; role: Role; full_name: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      channels: {
        Row: { id: ChannelId; name: string; icon: string | null };
        Insert: Database['public']['Tables']['channels']['Row'];
        Update: Partial<Database['public']['Tables']['channels']['Insert']>;
      };
      customers: {
        Row: { id: string; tenant_id: string; name: string; phone: string | null; email: string | null; address: string | null; channel_id: ChannelId | null; notes: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      products: {
        Row: { id: string; tenant_id: string; name: string; sku: string | null; price: number; cost: number; stock: number; channel_id: ChannelId | null; status: ProductStatus; image_url: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      orders: {
        Row: { id: string; tenant_id: string; customer_id: string | null; channel_id: ChannelId; order_code: string | null; status: OrderStatus; total: number; shipping_fee: number; discount: number; notes: string | null; ordered_at: string; created_by: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: { id: string; order_id: string; product_id: string | null; product_name: string; quantity: number; unit_price: number; subtotal: number };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'subtotal'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
