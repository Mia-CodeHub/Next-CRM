-- HELPER: get team member emails (requires admin role to access auth.users)
create or replace function public.get_team_emails(member_ids uuid[])
returns table(id uuid, email text) as $$
  select au.id, au.email::text
  from auth.users au
  where au.id = any(member_ids)
    and public.get_user_role() = 'admin'
$$ language sql security definer stable;

-- INVITES TABLE
create table invites (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text,
  role text not null default 'staff' check (role in ('admin', 'staff', 'viewer')),
  invite_code text unique not null,
  created_by uuid references profiles(id),
  used_at timestamptz,
  created_at timestamptz default now()
);

create index idx_invites_code on invites(invite_code);
create index idx_invites_tenant on invites(tenant_id);

-- RLS
alter table invites enable row level security;
create policy "admin_manage_invites" on invites for all using (tenant_id = public.get_tenant_id() and public.get_user_role() = 'admin');
create policy "read_invite_by_code" on invites for select using (true);
