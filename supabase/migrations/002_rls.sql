-- Enable RLS
alter table tenants enable row level security;
alter table profiles enable row level security;
alter table customers enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Helper functions (public schema — auth schema is restricted)
create or replace function public.get_tenant_id()
returns uuid as $$
  select tenant_id from public.profiles where id = auth.uid()
$$ language sql security definer stable;

create or replace function public.get_user_role()
returns text as $$
  select role from public.profiles where id = auth.uid()
$$ language sql security definer stable;

-- TENANTS
create policy "read_own_tenant" on tenants for select using (id = public.get_tenant_id());
create policy "admin_update_tenant" on tenants for update using (id = public.get_tenant_id() and public.get_user_role() = 'admin');

-- PROFILES
create policy "read_tenant_profiles" on profiles for select using (tenant_id = public.get_tenant_id());
create policy "update_own_profile" on profiles for update using (id = auth.uid());
create policy "admin_manage_profiles" on profiles for all using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');
create policy "insert_own_profile" on profiles for insert with check (id = auth.uid());

-- CUSTOMERS
create policy "read_customers" on customers for select using (tenant_id = public.get_tenant_id());
create policy "staff_insert_customers" on customers for insert with check (tenant_id = public.get_tenant_id() and public.get_user_role() in ('admin', 'staff'));
create policy "staff_update_customers" on customers for update using (tenant_id = public.get_tenant_id() and public.get_user_role() in ('admin', 'staff'));
create policy "admin_delete_customers" on customers for delete using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');

-- PRODUCTS
create policy "read_products" on products for select using (tenant_id = public.get_tenant_id());
create policy "staff_insert_products" on products for insert with check (tenant_id = public.get_tenant_id() and public.get_user_role() in ('admin', 'staff'));
create policy "staff_update_products" on products for update using (tenant_id = public.get_tenant_id() and public.get_user_role() in ('admin', 'staff'));
create policy "admin_delete_products" on products for delete using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');

-- ORDERS
create policy "read_orders" on orders for select using (tenant_id = public.get_tenant_id());
create policy "staff_insert_orders" on orders for insert with check (tenant_id = public.get_tenant_id() and public.get_user_role() in ('admin', 'staff'));
create policy "staff_update_orders" on orders for update using (tenant_id = public.get_tenant_id() and public.get_user_role() in ('admin', 'staff'));
create policy "admin_delete_orders" on orders for delete using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');

-- ORDER_ITEMS
create policy "read_order_items" on order_items for select
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.tenant_id = public.get_tenant_id()));
create policy "staff_insert_order_items" on order_items for insert
  with check (exists (select 1 from orders where orders.id = order_items.order_id and orders.tenant_id = public.get_tenant_id()) and public.get_user_role() in ('admin', 'staff'));
create policy "staff_update_order_items" on order_items for update
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.tenant_id = public.get_tenant_id()) and public.get_user_role() in ('admin', 'staff'));
create policy "admin_delete_order_items" on order_items for delete
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.tenant_id = public.get_tenant_id()) and public.get_user_role() = 'admin');

-- CHANNELS (public read for authenticated)
alter table channels enable row level security;
create policy "read_channels" on channels for select using (auth.uid() is not null);

-- Allow new users to create tenants during signup
create policy "authenticated_insert_tenant" on tenants for insert with check (auth.uid() is not null);
