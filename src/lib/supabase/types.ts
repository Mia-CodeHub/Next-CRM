export type Role = 'admin' | 'staff' | 'viewer' | 'warehouse';
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
export type ProductStatus = 'active' | 'inactive' | 'draft';

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
      channel_types: {
        Row: { id: string; tenant_id: string; name: string; color: string; icon: string | null; created_at: string };
        Insert: Omit<Database['public']['Tables']['channel_types']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['channel_types']['Insert']>;
      };
      channels: {
        Row: { id: string; tenant_id: string; channel_type_id: string; name: string; url: string | null; notes: string | null; is_active: boolean; created_at: string };
        Insert: Omit<Database['public']['Tables']['channels']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['channels']['Insert']>;
      };
      customers: {
        Row: { id: string; tenant_id: string; name: string; phone: string | null; email: string | null; address: string | null; channel_id: string | null; notes: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      products: {
        Row: { id: string; tenant_id: string; name: string; sku: string | null; price: number; cost: number; stock: number; channel_id: string | null; status: ProductStatus; image_url: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      orders: {
        Row: { id: string; tenant_id: string; customer_id: string | null; channel_id: string | null; warehouse_id: string | null; order_code: string | null; status: OrderStatus; total: number; shipping_fee: number; discount: number; notes: string | null; ordered_at: string; created_by: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: { id: string; order_id: string; product_id: string | null; product_name: string; quantity: number; unit_price: number; subtotal: number };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'subtotal'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      warehouses: {
        Row: { id: string; tenant_id: string; name: string; address: string | null; phone: string | null; is_active: boolean; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['warehouses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['warehouses']['Insert']>;
      };
      invites: {
        Row: { id: string; tenant_id: string; email: string | null; role: Role; invite_code: string; created_by: string | null; used_at: string | null; created_at: string };
        Insert: Omit<Database['public']['Tables']['invites']['Row'], 'id' | 'created_at' | 'used_at'>;
        Update: Partial<Database['public']['Tables']['invites']['Insert']>;
      };
      inventory: {
        Row: { id: string; tenant_id: string; product_id: string; warehouse_id: string; quantity: number; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['inventory']['Insert']>;
      };
      notifications: {
        Row: { id: string; tenant_id: string; user_id: string | null; type: string; title: string; body: string | null; metadata: Record<string, unknown>; is_read: boolean; created_at: string };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      audit_logs: {
        Row: { id: string; tenant_id: string; user_id: string | null; user_name: string | null; action: string; entity_type: string; entity_id: string | null; entity_label: string | null; old_data: Record<string, unknown> | null; new_data: Record<string, unknown> | null; created_at: string };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
      custom_roles: {
        Row: { id: string; tenant_id: string; name: string; display_name: string; description: string | null; permissions: string[]; color: string; icon: string; is_system: boolean; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['custom_roles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['custom_roles']['Insert']>;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
