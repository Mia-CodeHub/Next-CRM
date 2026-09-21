-- Audit log table
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  user_name text,
  action text not null check (action in ('create', 'update', 'delete')),
  entity_type text not null,
  entity_id text,
  entity_label text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

create index idx_audit_tenant on audit_logs(tenant_id);
create index idx_audit_entity on audit_logs(entity_type, entity_id);
create index idx_audit_created on audit_logs(created_at desc);

alter table audit_logs enable row level security;

create policy "Users can view own tenant audit logs"
  on audit_logs for select
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()));

create policy "System can insert audit logs"
  on audit_logs for insert
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));

-- Generic audit trigger function
create or replace function audit_log_trigger()
returns trigger as $$
declare
  _user_id uuid;
  _user_name text;
  _tenant_id uuid;
  _action text;
  _entity_label text;
begin
  _user_id := auth.uid();
  select full_name, tenant_id into _user_name, _tenant_id
    from profiles where id = _user_id;

  if TG_OP = 'INSERT' then
    _action := 'create';
    _entity_label := coalesce(NEW.name, NEW.order_code, NEW.id::text);
    insert into audit_logs (tenant_id, user_id, user_name, action, entity_type, entity_id, entity_label, new_data)
    values (_tenant_id, _user_id, _user_name, _action, TG_TABLE_NAME, NEW.id::text, _entity_label, to_jsonb(NEW));
    return NEW;
  elsif TG_OP = 'UPDATE' then
    _action := 'update';
    _entity_label := coalesce(NEW.name, NEW.order_code, NEW.id::text);
    insert into audit_logs (tenant_id, user_id, user_name, action, entity_type, entity_id, entity_label, old_data, new_data)
    values (_tenant_id, _user_id, _user_name, _action, TG_TABLE_NAME, NEW.id::text, _entity_label, to_jsonb(OLD), to_jsonb(NEW));
    return NEW;
  elsif TG_OP = 'DELETE' then
    _action := 'delete';
    _entity_label := coalesce(OLD.name, OLD.order_code, OLD.id::text);
    insert into audit_logs (tenant_id, user_id, user_name, action, entity_type, entity_id, entity_label, old_data)
    values (_tenant_id, _user_id, _user_name, _action, TG_TABLE_NAME, OLD.id::text, _entity_label, to_jsonb(OLD));
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Attach triggers to main tables
create trigger audit_orders after insert or update or delete on orders
  for each row execute function audit_log_trigger();

create trigger audit_products after insert or update or delete on products
  for each row execute function audit_log_trigger();

create trigger audit_customers after insert or update or delete on customers
  for each row execute function audit_log_trigger();

create trigger audit_warehouses after insert or update or delete on warehouses
  for each row execute function audit_log_trigger();
