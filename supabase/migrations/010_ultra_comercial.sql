alter table landing_leads
add column if not exists assigned_at timestamptz;

alter table landing_leads
add column if not exists first_contact_at timestamptz;

alter table landing_leads
add column if not exists last_contact_at timestamptz;

alter table landing_leads
add column if not exists response_time_min integer;

alter table landing_leads
add column if not exists sla_violated boolean default false;

alter table vendedores
add column if not exists is_online boolean default false;

alter table vendedores
add column if not exists total_leads_asignados integer default 0;

alter table vendedores
add column if not exists total_leads_trabajados integer default 0;

alter table vendedores
add column if not exists total_ventas integer default 0;

create table if not exists system_alerts (
  id bigserial primary key,
  vendedor_id uuid,
  type text,
  message text,
  priority text default 'media',
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_system_alerts_vendedor on system_alerts(vendedor_id);

alter table system_alerts disable row level security;
