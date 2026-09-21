-- Enable Supabase Realtime on orders table
alter publication supabase_realtime add table orders;

-- Notifications table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('order_new', 'order_status', 'low_stock', 'system')),
  title text not null,
  body text,
  metadata jsonb default '{}',
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_tenant on notifications(tenant_id);
create index idx_notifications_user on notifications(user_id);
create index idx_notifications_read on notifications(tenant_id, is_read);

alter table notifications enable row level security;

create policy "Users can view own tenant notifications"
  on notifications for select
  using (
    tenant_id = (select tenant_id from profiles where id = auth.uid())
    and (user_id is null or user_id = auth.uid())
  );

create policy "Users can update own notifications"
  on notifications for update
  using (
    tenant_id = (select tenant_id from profiles where id = auth.uid())
    and (user_id is null or user_id = auth.uid())
  );

create policy "System can insert notifications"
  on notifications for insert
  with check (
    tenant_id = (select tenant_id from profiles where id = auth.uid())
  );

-- Enable Realtime on notifications
alter publication supabase_realtime add table notifications;

-- Function to auto-create notification when order is created
create or replace function notify_new_order()
returns trigger as $$
begin
  insert into notifications (tenant_id, type, title, body, metadata)
  values (
    NEW.tenant_id,
    'order_new',
    'Đơn hàng mới: ' || coalesce(NEW.order_code, NEW.id::text),
    'Tổng: ' || NEW.total || ' đ',
    jsonb_build_object('order_id', NEW.id, 'order_code', NEW.order_code)
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_notify_new_order
  after insert on orders
  for each row execute function notify_new_order();

-- Function to notify when order status changes
create or replace function notify_order_status()
returns trigger as $$
begin
  if OLD.status is distinct from NEW.status then
    insert into notifications (tenant_id, type, title, body, metadata)
    values (
      NEW.tenant_id,
      'order_status',
      'Đơn ' || coalesce(NEW.order_code, NEW.id::text) || ' → ' || NEW.status,
      'Trạng thái: ' || OLD.status || ' → ' || NEW.status,
      jsonb_build_object('order_id', NEW.id, 'order_code', NEW.order_code, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_notify_order_status
  after update on orders
  for each row execute function notify_order_status();
