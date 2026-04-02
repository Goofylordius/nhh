create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'customer_status') then
    create type customer_status as enum ('lead', 'aktiv', 'inaktiv');
  end if;

  if not exists (select 1 from pg_type where typname = 'opportunity_stage') then
    create type opportunity_stage as enum ('neu', 'kontaktiert', 'angebot', 'verhandlung', 'gewonnen', 'verloren');
  end if;

  if not exists (select 1 from pg_type where typname = 'billing_status') then
    create type billing_status as enum ('entwurf', 'versendet', 'angenommen', 'faellig', 'bezahlt', 'ueberfaellig', 'storniert');
  end if;

  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type project_status as enum ('geplant', 'aktiv', 'pausiert', 'abgeschlossen');
  end if;

  if not exists (select 1 from pg_type where typname = 'priority_level') then
    create type priority_level as enum ('niedrig', 'mittel', 'hoch', 'kritisch');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('offen', 'in_arbeit', 'wartet', 'erledigt');
  end if;

  if not exists (select 1 from pg_type where typname = 'activity_type') then
    create type activity_type as enum ('anruf', 'email', 'meeting', 'notiz');
  end if;

  if not exists (select 1 from pg_type where typname = 'document_category') then
    create type document_category as enum ('vertrag', 'angebot', 'rechnung', 'projekt', 'foto', 'sonstiges');
  end if;
end
$$;

create table if not exists number_counters (
  scope text not null,
  year integer not null,
  last_value integer not null default 0,
  primary key (scope, year)
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  customer_number text not null,
  company_name text not null,
  contact_name text,
  address_line1 text,
  address_line2 text,
  postal_code text,
  city text,
  state text,
  country text default 'Deutschland',
  email text,
  phone text,
  website text,
  industry text,
  status customer_status not null default 'lead',
  notes text,
  tags text[] not null default '{}',
  duplicate_hash text,
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  first_name text not null,
  last_name text not null,
  role_title text,
  email text,
  phone text,
  mobile text,
  birth_date date,
  notes text,
  is_primary boolean not null default false,
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  title text not null,
  description text,
  stage opportunity_stage not null default 'neu',
  probability integer not null default 0 check (probability between 0 and 100),
  expected_value numeric(12,2) not null default 0 check (expected_value >= 0),
  actual_value numeric(12,2) not null default 0 check (actual_value >= 0),
  owner_name text,
  expected_close_date date,
  closed_at timestamptz,
  tags text[] not null default '{}',
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  quote_number text not null,
  title text not null,
  status billing_status not null default 'entwurf',
  issue_date date not null,
  valid_until date,
  payment_terms text,
  currency text not null default 'EUR',
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  tax_rate numeric(5,2) not null default 19 check (tax_rate >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  notes text,
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint quotes_valid_until_check check (valid_until is null or valid_until >= issue_date)
);

create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  position_no integer not null check (position_no > 0),
  description text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  tax_rate numeric(5,2) not null default 19 check (tax_rate >= 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  source_quote_id uuid references quotes(id),
  invoice_number text not null,
  title text not null,
  status billing_status not null default 'entwurf',
  issue_date date not null,
  due_date date,
  paid_at timestamptz,
  payment_terms text,
  currency text not null default 'EUR',
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  tax_rate numeric(5,2) not null default 19 check (tax_rate >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  notes text,
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint invoices_due_date_check check (due_date is null or due_date >= issue_date)
);

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  position_no integer not null check (position_no > 0),
  description text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  tax_rate numeric(5,2) not null default 19 check (tax_rate >= 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  title text not null,
  description text,
  status project_status not null default 'geplant',
  priority priority_level not null default 'mittel',
  start_date date,
  end_date date,
  owner_name text,
  budget numeric(12,2) not null default 0 check (budget >= 0),
  progress integer not null default 0 check (progress between 0 and 100),
  phase text,
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  project_id uuid references projects(id),
  title text not null,
  description text,
  priority priority_level not null default 'mittel',
  status task_status not null default 'offen',
  due_date timestamptz,
  owner_name text,
  reminder_at timestamptz,
  recurrence_rule text,
  recurrence_interval integer check (recurrence_interval is null or recurrence_interval >= 1),
  completed_at timestamptz,
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  project_id uuid references projects(id),
  title text not null,
  description text,
  event_type text not null default 'Termin',
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  participants text[] not null default '{}',
  reminder_minutes integer,
  recurrence_rule text,
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint calendar_events_range_check check (ends_at > starts_at)
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  project_id uuid references projects(id),
  title text not null,
  file_name text not null,
  mime_type text,
  category document_category not null default 'sonstiges',
  bucket_name text not null default 'crm-documents',
  storage_path text not null,
  file_size bigint not null default 0 check (file_size >= 0),
  version_no integer not null default 1 check (version_no >= 1),
  checksum text,
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  project_id uuid references projects(id),
  opportunity_id uuid references opportunities(id),
  task_id uuid references tasks(id),
  activity_type activity_type not null default 'notiz',
  title text not null,
  description text,
  starts_at timestamptz not null default timezone('utc', now()),
  duration_minutes integer,
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  setting_group text not null,
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  description text,
  modified_by_label text not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid not null,
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  actor_label text not null default 'public-demo',
  actor_id uuid,
  before_data jsonb,
  after_data jsonb,
  changed_fields text[] not null default '{}',
  request_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists customers_customer_number_idx on customers(customer_number) where deleted_at is null;
create unique index if not exists quotes_quote_number_idx on quotes(quote_number) where deleted_at is null;
create unique index if not exists invoices_invoice_number_idx on invoices(invoice_number) where deleted_at is null;
create unique index if not exists settings_group_key_idx on settings(setting_group, setting_key) where deleted_at is null;
create index if not exists customers_status_idx on customers(status) where deleted_at is null;
create index if not exists customers_duplicate_idx on customers(duplicate_hash) where deleted_at is null;
create index if not exists contacts_customer_idx on contacts(customer_id) where deleted_at is null;
create index if not exists opportunities_customer_stage_idx on opportunities(customer_id, stage) where deleted_at is null;
create index if not exists quotes_customer_idx on quotes(customer_id) where deleted_at is null;
create index if not exists invoices_customer_idx on invoices(customer_id) where deleted_at is null;
create index if not exists quote_items_quote_idx on quote_items(quote_id) where deleted_at is null;
create index if not exists invoice_items_invoice_idx on invoice_items(invoice_id) where deleted_at is null;
create index if not exists projects_customer_idx on projects(customer_id) where deleted_at is null;
create index if not exists tasks_project_idx on tasks(project_id) where deleted_at is null;
create index if not exists tasks_due_idx on tasks(due_date) where deleted_at is null;
create index if not exists calendar_events_time_idx on calendar_events(starts_at, ends_at) where deleted_at is null;
create index if not exists documents_customer_idx on documents(customer_id) where deleted_at is null;
create index if not exists activities_customer_idx on activities(customer_id) where deleted_at is null;
create index if not exists audit_logs_table_record_idx on audit_logs(table_name, record_id, created_at desc);

create or replace function crm_next_scoped_number(p_scope text, p_prefix text)
returns text
language plpgsql
security definer
as $$
declare
  v_year integer := extract(year from timezone('utc', now()));
  v_next integer;
begin
  insert into number_counters (scope, year, last_value)
  values (p_scope, v_year, 1)
  on conflict (scope, year)
  do update set last_value = number_counters.last_value + 1
  returning last_value into v_next;

  return format('%s-%s-%s', p_prefix, v_year, lpad(v_next::text, 5, '0'));
end;
$$;

create or replace function crm_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create or replace function crm_assign_customer_number()
returns trigger
language plpgsql
as $$
begin
  if new.customer_number is null or new.customer_number = '' then
    new.customer_number := crm_next_scoped_number('customers', 'KND');
  end if;
  return new;
end;
$$;

create or replace function crm_assign_quote_number()
returns trigger
language plpgsql
as $$
begin
  if new.quote_number is null or new.quote_number = '' then
    new.quote_number := crm_next_scoped_number('quotes', 'ANG');
  end if;
  return new;
end;
$$;

create or replace function crm_assign_invoice_number()
returns trigger
language plpgsql
as $$
begin
  if new.invoice_number is null or new.invoice_number = '' then
    new.invoice_number := crm_next_scoped_number('invoices', 'RE');
  end if;
  return new;
end;
$$;

create or replace function crm_audit_row_change()
returns trigger
language plpgsql
security definer
as $$
declare
  v_before jsonb;
  v_after jsonb;
  v_record_id uuid;
  v_actor_label text;
  v_changed_fields text[];
begin
  if tg_op = 'DELETE' then
    v_before := to_jsonb(old);
    v_after := null;
    v_record_id := old.id;
    v_actor_label := coalesce(old.modified_by_label, 'public-demo');
  else
    v_before := case when tg_op = 'UPDATE' then to_jsonb(old) else null end;
    v_after := to_jsonb(new);
    v_record_id := new.id;
    v_actor_label := coalesce(new.modified_by_label, 'public-demo');
  end if;

  if tg_op = 'UPDATE' then
    select coalesce(array_agg(key order by key), '{}')
      into v_changed_fields
    from (
      select key
      from (
        select key from jsonb_object_keys(coalesce(v_before, '{}'::jsonb)) as before_keys(key)
        union
        select key from jsonb_object_keys(coalesce(v_after, '{}'::jsonb)) as after_keys(key)
      ) keys
      where coalesce(v_before -> key, 'null'::jsonb) is distinct from coalesce(v_after -> key, 'null'::jsonb)
    ) changed;
  else
    v_changed_fields := '{}';
  end if;

  insert into audit_logs (
    table_name,
    record_id,
    operation,
    actor_label,
    before_data,
    after_data,
    changed_fields
  )
  values (
    tg_table_name,
    v_record_id,
    tg_op,
    v_actor_label,
    v_before,
    v_after,
    v_changed_fields
  );

  return coalesce(new, old);
end;
$$;

create or replace function crm_prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs sind unveraenderbar';
end;
$$;

drop trigger if exists trg_customers_number on customers;
create trigger trg_customers_number before insert on customers for each row execute function crm_assign_customer_number();
drop trigger if exists trg_quotes_number on quotes;
create trigger trg_quotes_number before insert on quotes for each row execute function crm_assign_quote_number();
drop trigger if exists trg_invoices_number on invoices;
create trigger trg_invoices_number before insert on invoices for each row execute function crm_assign_invoice_number();

drop trigger if exists trg_customers_updated_at on customers;
create trigger trg_customers_updated_at before update on customers for each row execute function crm_set_updated_at();
drop trigger if exists trg_contacts_updated_at on contacts;
create trigger trg_contacts_updated_at before update on contacts for each row execute function crm_set_updated_at();
drop trigger if exists trg_opportunities_updated_at on opportunities;
create trigger trg_opportunities_updated_at before update on opportunities for each row execute function crm_set_updated_at();
drop trigger if exists trg_quotes_updated_at on quotes;
create trigger trg_quotes_updated_at before update on quotes for each row execute function crm_set_updated_at();
drop trigger if exists trg_quote_items_updated_at on quote_items;
create trigger trg_quote_items_updated_at before update on quote_items for each row execute function crm_set_updated_at();
drop trigger if exists trg_invoices_updated_at on invoices;
create trigger trg_invoices_updated_at before update on invoices for each row execute function crm_set_updated_at();
drop trigger if exists trg_invoice_items_updated_at on invoice_items;
create trigger trg_invoice_items_updated_at before update on invoice_items for each row execute function crm_set_updated_at();
drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at before update on projects for each row execute function crm_set_updated_at();
drop trigger if exists trg_tasks_updated_at on tasks;
create trigger trg_tasks_updated_at before update on tasks for each row execute function crm_set_updated_at();
drop trigger if exists trg_calendar_events_updated_at on calendar_events;
create trigger trg_calendar_events_updated_at before update on calendar_events for each row execute function crm_set_updated_at();
drop trigger if exists trg_documents_updated_at on documents;
create trigger trg_documents_updated_at before update on documents for each row execute function crm_set_updated_at();
drop trigger if exists trg_activities_updated_at on activities;
create trigger trg_activities_updated_at before update on activities for each row execute function crm_set_updated_at();
drop trigger if exists trg_settings_updated_at on settings;
create trigger trg_settings_updated_at before update on settings for each row execute function crm_set_updated_at();

drop trigger if exists trg_customers_audit on customers;
create trigger trg_customers_audit after insert or update or delete on customers for each row execute function crm_audit_row_change();
drop trigger if exists trg_contacts_audit on contacts;
create trigger trg_contacts_audit after insert or update or delete on contacts for each row execute function crm_audit_row_change();
drop trigger if exists trg_opportunities_audit on opportunities;
create trigger trg_opportunities_audit after insert or update or delete on opportunities for each row execute function crm_audit_row_change();
drop trigger if exists trg_quotes_audit on quotes;
create trigger trg_quotes_audit after insert or update or delete on quotes for each row execute function crm_audit_row_change();
drop trigger if exists trg_quote_items_audit on quote_items;
create trigger trg_quote_items_audit after insert or update or delete on quote_items for each row execute function crm_audit_row_change();
drop trigger if exists trg_invoices_audit on invoices;
create trigger trg_invoices_audit after insert or update or delete on invoices for each row execute function crm_audit_row_change();
drop trigger if exists trg_invoice_items_audit on invoice_items;
create trigger trg_invoice_items_audit after insert or update or delete on invoice_items for each row execute function crm_audit_row_change();
drop trigger if exists trg_projects_audit on projects;
create trigger trg_projects_audit after insert or update or delete on projects for each row execute function crm_audit_row_change();
drop trigger if exists trg_tasks_audit on tasks;
create trigger trg_tasks_audit after insert or update or delete on tasks for each row execute function crm_audit_row_change();
drop trigger if exists trg_calendar_events_audit on calendar_events;
create trigger trg_calendar_events_audit after insert or update or delete on calendar_events for each row execute function crm_audit_row_change();
drop trigger if exists trg_documents_audit on documents;
create trigger trg_documents_audit after insert or update or delete on documents for each row execute function crm_audit_row_change();
drop trigger if exists trg_activities_audit on activities;
create trigger trg_activities_audit after insert or update or delete on activities for each row execute function crm_audit_row_change();
drop trigger if exists trg_settings_audit on settings;
create trigger trg_settings_audit after insert or update or delete on settings for each row execute function crm_audit_row_change();

drop trigger if exists trg_audit_logs_lock on audit_logs;
create trigger trg_audit_logs_lock before update or delete on audit_logs for each row execute function crm_prevent_audit_log_mutation();

alter table customers enable row level security;
alter table contacts enable row level security;
alter table opportunities enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table calendar_events enable row level security;
alter table documents enable row level security;
alter table activities enable row level security;
alter table settings enable row level security;
alter table audit_logs enable row level security;

drop policy if exists customers_demo_select on customers;
create policy customers_demo_select on customers for select using (deleted_at is null);
drop policy if exists customers_demo_write on customers;
create policy customers_demo_write on customers for all using (true) with check (true);

drop policy if exists contacts_demo_select on contacts;
create policy contacts_demo_select on contacts for select using (deleted_at is null);
drop policy if exists contacts_demo_write on contacts;
create policy contacts_demo_write on contacts for all using (true) with check (true);

drop policy if exists opportunities_demo_select on opportunities;
create policy opportunities_demo_select on opportunities for select using (deleted_at is null);
drop policy if exists opportunities_demo_write on opportunities;
create policy opportunities_demo_write on opportunities for all using (true) with check (true);

drop policy if exists quotes_demo_select on quotes;
create policy quotes_demo_select on quotes for select using (deleted_at is null);
drop policy if exists quotes_demo_write on quotes;
create policy quotes_demo_write on quotes for all using (true) with check (true);

drop policy if exists quote_items_demo_select on quote_items;
create policy quote_items_demo_select on quote_items for select using (deleted_at is null);
drop policy if exists quote_items_demo_write on quote_items;
create policy quote_items_demo_write on quote_items for all using (true) with check (true);

drop policy if exists invoices_demo_select on invoices;
create policy invoices_demo_select on invoices for select using (deleted_at is null);
drop policy if exists invoices_demo_write on invoices;
create policy invoices_demo_write on invoices for all using (true) with check (true);

drop policy if exists invoice_items_demo_select on invoice_items;
create policy invoice_items_demo_select on invoice_items for select using (deleted_at is null);
drop policy if exists invoice_items_demo_write on invoice_items;
create policy invoice_items_demo_write on invoice_items for all using (true) with check (true);

drop policy if exists projects_demo_select on projects;
create policy projects_demo_select on projects for select using (deleted_at is null);
drop policy if exists projects_demo_write on projects;
create policy projects_demo_write on projects for all using (true) with check (true);

drop policy if exists tasks_demo_select on tasks;
create policy tasks_demo_select on tasks for select using (deleted_at is null);
drop policy if exists tasks_demo_write on tasks;
create policy tasks_demo_write on tasks for all using (true) with check (true);

drop policy if exists calendar_events_demo_select on calendar_events;
create policy calendar_events_demo_select on calendar_events for select using (deleted_at is null);
drop policy if exists calendar_events_demo_write on calendar_events;
create policy calendar_events_demo_write on calendar_events for all using (true) with check (true);

drop policy if exists documents_demo_select on documents;
create policy documents_demo_select on documents for select using (deleted_at is null);
drop policy if exists documents_demo_write on documents;
create policy documents_demo_write on documents for all using (true) with check (true);

drop policy if exists activities_demo_select on activities;
create policy activities_demo_select on activities for select using (deleted_at is null);
drop policy if exists activities_demo_write on activities;
create policy activities_demo_write on activities for all using (true) with check (true);

drop policy if exists settings_demo_select on settings;
create policy settings_demo_select on settings for select using (deleted_at is null);
drop policy if exists settings_demo_write on settings;
create policy settings_demo_write on settings for all using (true) with check (true);

drop policy if exists audit_logs_service_select on audit_logs;
create policy audit_logs_service_select on audit_logs for select using (auth.role() = 'service_role');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'crm-documents',
  'crm-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

drop policy if exists storage_demo_select on storage.objects;
create policy storage_demo_select
on storage.objects
for select
using (bucket_id = 'crm-documents');

drop policy if exists storage_demo_insert on storage.objects;
create policy storage_demo_insert
on storage.objects
for insert
with check (bucket_id = 'crm-documents');

drop policy if exists storage_demo_update on storage.objects;
create policy storage_demo_update
on storage.objects
for update
using (bucket_id = 'crm-documents')
with check (bucket_id = 'crm-documents');
