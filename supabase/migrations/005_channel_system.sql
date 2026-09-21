-- Phase 2: Flexible channel system
-- channel_types = platform types (Shopee, TikTok Shop, etc.) per tenant
-- channels = individual shops/accounts under each type per tenant

-- 1. Drop old FK constraints
alter table orders drop constraint if exists orders_channel_id_fkey;
alter table products drop constraint if exists products_channel_id_fkey;
alter table customers drop constraint if exists customers_channel_id_fkey;

-- 2. Drop NOT NULL on channel_id before type change
alter table orders alter column channel_id drop not null;

-- 3. Drop old channels table
drop table if exists channels cascade;

-- 4. Create channel_types (platform definitions per tenant)
create table channel_types (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  color text default '#10B981',
  icon text,
  created_at timestamptz default now()
);

create index idx_channel_types_tenant on channel_types(tenant_id);

alter table channel_types enable row level security;
create policy "read_channel_types" on channel_types for select
  using (tenant_id = public.get_tenant_id());
create policy "admin_insert_channel_types" on channel_types for insert
  with check (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');
create policy "admin_update_channel_types" on channel_types for update
  using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');
create policy "admin_delete_channel_types" on channel_types for delete
  using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');

-- 5. Create channels (individual shops per tenant)
create table channels (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  channel_type_id uuid not null references channel_types(id) on delete cascade,
  name text not null,
  url text,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index idx_channels_tenant on channels(tenant_id);
create index idx_channels_type on channels(channel_type_id);

alter table channels enable row level security;
create policy "read_channels" on channels for select
  using (tenant_id = public.get_tenant_id());
create policy "admin_insert_channels" on channels for insert
  with check (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');
create policy "admin_update_channels" on channels for update
  using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');
create policy "admin_delete_channels" on channels for delete
  using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');

-- 6. Update orders/products/customers to use uuid channel reference
alter table orders alter column channel_id type uuid using null;
alter table orders add constraint orders_channel_id_fkey
  foreign key (channel_id) references channels(id) on delete set null;

alter table products alter column channel_id type uuid using null;
alter table products add constraint products_channel_id_fkey
  foreign key (channel_id) references channels(id) on delete set null;

alter table customers alter column channel_id type uuid using null;
alter table customers add constraint customers_channel_id_fkey
  foreign key (channel_id) references channels(id) on delete set null;

-- 7. Seed default channel types for all existing tenants
insert into channel_types (tenant_id, name, color, icon)
select t.id, ct.name, ct.color, ct.icon
from tenants t
cross join (values
  ('Shopee', '#EE4D2D', 'shop'),
  ('TikTok Shop', '#000000', 'video'),
  ('Telesale', '#10B981', 'phone')
) as ct(name, color, icon);

-- 8. Function to seed channel types for new tenants (called on signup)
create or replace function public.seed_channel_types_for_tenant(p_tenant_id uuid)
returns void as $$
begin
  insert into channel_types (tenant_id, name, color, icon) values
    (p_tenant_id, 'Shopee', '#EE4D2D', 'shop'),
    (p_tenant_id, 'TikTok Shop', '#000000', 'video'),
    (p_tenant_id, 'Telesale', '#10B981', 'phone');
end;
$$ language plpgsql security definer;
