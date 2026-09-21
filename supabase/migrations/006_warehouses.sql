-- Phase 3: Multi-warehouse system + warehouse role

-- 1. Create warehouses table
create table warehouses (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_warehouses_tenant on warehouses(tenant_id);
create trigger trg_warehouses_updated before update on warehouses for each row execute function update_updated_at();

alter table warehouses enable row level security;
create policy "read_warehouses" on warehouses for select
  using (tenant_id = public.get_tenant_id());
create policy "admin_insert_warehouses" on warehouses for insert
  with check (tenant_id = public.get_tenant_id() and public.get_user_role() in ('admin', 'warehouse'));
create policy "admin_update_warehouses" on warehouses for update
  using (tenant_id = public.get_tenant_id() and public.get_user_role() in ('admin', 'warehouse'));
create policy "admin_delete_warehouses" on warehouses for delete
  using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');

-- 2. Add warehouse_id to orders
alter table orders add column warehouse_id uuid references warehouses(id) on delete set null;
create index idx_orders_warehouse on orders(warehouse_id);

-- 3. Update role constraint to include 'warehouse'
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('admin', 'staff', 'viewer', 'warehouse'));

-- 4. Update invites role constraint
alter table invites drop constraint if exists invites_role_check;
alter table invites add constraint invites_role_check
  check (role in ('admin', 'staff', 'viewer', 'warehouse'));
