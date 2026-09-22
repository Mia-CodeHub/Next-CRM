-- Trigger: auto-create profile when a new user signs up
-- This runs as security definer, bypassing RLS, so it works
-- regardless of email confirmation settings.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  invite_record record;
  meta jsonb;
  new_tenant_id uuid;
  slug text;
begin
  meta := new.raw_user_meta_data;

  -- Case 1: User signed up with invite code
  if meta->>'invite_code' is not null then
    select * into invite_record from public.invites
    where invite_code = upper(meta->>'invite_code')
      and used_at is null
    limit 1;

    if invite_record.id is not null then
      insert into public.profiles (id, tenant_id, role, full_name)
      values (new.id, invite_record.tenant_id, invite_record.role, coalesce(meta->>'full_name', ''))
      on conflict (id) do nothing;

      update public.invites set used_at = now() where id = invite_record.id;
    end if;

  -- Case 2: User created a new company
  elsif meta->>'tenant_name' is not null then
    slug := lower(regexp_replace(meta->>'tenant_name', '\s+', '-', 'g'));
    slug := regexp_replace(slug, '[^a-z0-9-]', '', 'g');
    slug := slug || '-' || substr(new.id::text, 1, 8);

    insert into public.tenants (name, slug)
    values (meta->>'tenant_name', slug)
    returning id into new_tenant_id;

    insert into public.profiles (id, tenant_id, role, full_name)
    values (new.id, new_tenant_id, 'admin', coalesce(meta->>'full_name', ''))
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
