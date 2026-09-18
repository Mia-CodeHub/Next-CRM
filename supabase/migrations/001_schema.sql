create extension if not exists "uuid-ossp";

-- TENANTS
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROFILES (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin', 'staff', 'viewer')),
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CHANNELS
create table channels (
  id text primary key,
  name text not null,
  icon text
);

-- CUSTOMERS
create table customers (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  channel_id text references channels(id),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PRODUCTS
create table products (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  sku text,
  price numeric(12,2) not null default 0,
  cost numeric(12,2) default 0,
  stock int default 0,
  channel_id text references channels(id),
  status text default 'active' check (status in ('active', 'inactive', 'draft')),
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDERS
create table orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  channel_id text not null references channels(id),
  order_code text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled', 'returned')),
  total numeric(12,2) default 0,
  shipping_fee numeric(12,2) default 0,
  discount numeric(12,2) default 0,
  notes text,
  ordered_at timestamptz default now(),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDER ITEMS
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity int not null default 1,
  unit_price numeric(12,2) not null,
  subtotal numeric(12,2) generated always as (quantity * unit_price) stored
);

-- INDEXES
create index idx_profiles_tenant on profiles(tenant_id);
create index idx_customers_tenant on customers(tenant_id);
create index idx_products_tenant on products(tenant_id);
create index idx_orders_tenant on orders(tenant_id);
create index idx_orders_status on orders(tenant_id, status);
create index idx_orders_channel on orders(tenant_id, channel_id);
create index idx_orders_date on orders(tenant_id, ordered_at desc);
create index idx_order_items_order on order_items(order_id);

-- UPDATED_AT TRIGGER
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_tenants_updated before update on tenants for each row execute function update_updated_at();
create trigger trg_profiles_updated before update on profiles for each row execute function update_updated_at();
create trigger trg_customers_updated before update on customers for each row execute function update_updated_at();
create trigger trg_products_updated before update on products for each row execute function update_updated_at();
create trigger trg_orders_updated before update on orders for each row execute function update_updated_at();
