create table if not exists lead_events (
  id bigserial primary key,
  lead_id bigint not null,
  vendedor_id uuid,
  type text not null,
  message text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_lead_events_lead_id
on lead_events(lead_id);

create index if not exists idx_lead_events_vendedor_id
on lead_events(vendedor_id);

create index if not exists idx_lead_events_created
on lead_events(created_at desc);
