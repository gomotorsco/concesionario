alter table landing_leads
add column if not exists origen text default 'web';

alter table landing_leads
add column if not exists tipo_documento text;

alter table landing_leads
add column if not exists documento text;

alter table landing_leads
add column if not exists ciudad text;

alter table landing_leads
add column if not exists tipo_ingreso text;

alter table landing_leads
add column if not exists ingresos_mensuales numeric;

alter table landing_leads
add column if not exists antiguedad_laboral text;

alter table landing_leads
add column if not exists tiene_cuota_inicial boolean;

alter table landing_leads
add column if not exists valor_cuota_inicial numeric;

alter table landing_leads
add column if not exists experiencia_crediticia text;

alter table landing_leads
add column if not exists reportado_centrales text;

alter table landing_leads
add column if not exists autorizacion_datos boolean default false;

create index if not exists idx_landing_leads_origen
on landing_leads(origen);

create index if not exists idx_landing_leads_documento
on landing_leads(documento);
