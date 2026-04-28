alter table vendedores
add column if not exists whatsapp text;

alter table vendedores
add column if not exists zona text;

alter table vendedores
add column if not exists rol text default 'vendedor';

alter table vendedores
add column if not exists fecha_ingreso date;

alter table vendedores
add column if not exists meta_conversion numeric default 10;

alter table vendedores
add column if not exists meta_leads_trabajados integer default 50;

alter table vendedores
add column if not exists notas text;

alter table vendedores
add column if not exists last_login timestamptz;

alter table vendedores
add column if not exists last_activity timestamptz;

alter table vendedores
add column if not exists updated_at timestamptz default now();

create index if not exists idx_vendedores_last_login
on vendedores(last_login desc);

create index if not exists idx_vendedores_last_activity
on vendedores(last_activity desc);
