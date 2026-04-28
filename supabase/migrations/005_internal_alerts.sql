create table if not exists seller_alerts (
  id bigserial primary key,
  vendedor_id uuid not null,
  title text not null,
  message text not null,
  priority text default 'info',
  read boolean default false,
  created_at timestamptz default now(),
  read_at timestamptz
);

create index if not exists idx_seller_alerts_vendedor
on seller_alerts(vendedor_id);

create index if not exists idx_seller_alerts_read
on seller_alerts(read);

create index if not exists idx_seller_alerts_created
on seller_alerts(created_at desc);
