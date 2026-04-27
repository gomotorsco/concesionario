-- =========================
-- CRM UPGRADE REAL
-- =========================

-- 1. NUEVO: vendedor asignado
alter table landing_leads
add column if not exists vendedor_id uuid;

-- 2. NUEVO: conexión con vehículo
alter table landing_leads
add column if not exists vehicle_id bigint;

alter table landing_leads
add column if not exists vehicle_name text;

-- 3. NUEVO: control de actualización
alter table landing_leads
add column if not exists updated_at timestamptz default now();

-- 4. NORMALIZAR estado
update landing_leads
set estado = 'nuevo'
where estado is null;

-- 5. NORMALIZAR visto
update landing_leads
set visto = false
where visto is null;

-- 6. LIMPIAR estados raros
update landing_leads
set estado = 'perdido'
where estado = 'frenado';

-- 7. ÍNDICES
create index if not exists idx_leads_estado
on landing_leads (estado);

create index if not exists idx_leads_vendedor
on landing_leads (vendedor_id);

create index if not exists idx_leads_created
on landing_leads (created_at desc);

create index if not exists idx_leads_vehicle
on landing_leads (vehicle_id);

