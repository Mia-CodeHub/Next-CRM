-- Dynamic Role & Permission System
-- Allows admin to create custom roles and assign permissions

-- 1. Create custom_roles table
create table custom_roles (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  display_name text not null,
  description text,
  permissions jsonb not null default '[]',
  color text default 'default',
  icon text default 'user',
  is_system boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_custom_roles_tenant on custom_roles(tenant_id);
create unique index idx_custom_roles_name on custom_roles(tenant_id, name);
create trigger trg_custom_roles_updated before update on custom_roles for each row execute function update_updated_at();

-- 2. RLS for custom_roles
alter table custom_roles enable row level security;

create policy "read_custom_roles" on custom_roles for select
  using (tenant_id = public.get_tenant_id());

create policy "admin_insert_custom_roles" on custom_roles for insert
  with check (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');

create policy "admin_update_custom_roles" on custom_roles for update
  using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');

create policy "admin_delete_custom_roles" on custom_roles for delete
  using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');

-- 3. Remove hardcoded role CHECK constraints (allow any role name)
alter table profiles drop constraint if exists profiles_role_check;
alter table invites drop constraint if exists invites_role_check;

-- 4. Insert system default roles for each existing tenant
insert into custom_roles (tenant_id, name, display_name, description, permissions, color, icon, is_system)
select
  t.id,
  'admin',
  'Quản Trị',
  'Toàn quyền quản trị hệ thống, quản lý nhóm và cài đặt',
  '["dashboard.view","orders.view","orders.create","orders.edit","orders.delete","orders.export","products.view","products.create","products.edit","products.delete","customers.view","customers.create","customers.edit","customers.delete","warehouses.view","warehouses.manage","inventory.view","inventory.manage","settings.view","settings.team","settings.channels","settings.api","settings.currency","audit.view"]'::jsonb,
  'red',
  'crown',
  true
from tenants t;

insert into custom_roles (tenant_id, name, display_name, description, permissions, color, icon, is_system)
select
  t.id,
  'staff',
  'Nhân Viên',
  'Tạo và chỉnh sửa đơn hàng, sản phẩm, khách hàng',
  '["dashboard.view","orders.view","orders.create","orders.edit","orders.export","products.view","products.create","products.edit","customers.view","customers.create","customers.edit","warehouses.view","inventory.view","settings.view"]'::jsonb,
  'blue',
  'user',
  true
from tenants t;

insert into custom_roles (tenant_id, name, display_name, description, permissions, color, icon, is_system)
select
  t.id,
  'warehouse',
  'Kho Vận',
  'Quản lý kho hàng, tồn kho, xem đơn hàng',
  '["dashboard.view","orders.view","products.view","warehouses.view","warehouses.manage","inventory.view","inventory.manage","settings.view"]'::jsonb,
  'orange',
  'home',
  true
from tenants t;

insert into custom_roles (tenant_id, name, display_name, description, permissions, color, icon, is_system)
select
  t.id,
  'viewer',
  'Xem',
  'Chỉ xem dữ liệu, không thể tạo hoặc sửa',
  '["dashboard.view","orders.view","products.view","customers.view","warehouses.view","inventory.view","settings.view"]'::jsonb,
  'default',
  'eye',
  true
from tenants t;
