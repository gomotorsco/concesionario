alter table landing_leads
add column if not exists origen text default 'web';

alter table landing_leads
add column if not exists ciudad text;

alter table landing_leads
add column if not exists vehiculo_interes text;

alter table landing_leads
add column if not exists tipo_ingreso text;

alter table landing_leads
add column if not exists ingresos_mensuales numeric;

alter table landing_leads
add column if not exists tiene_cuota_inicial boolean;

alter table landing_leads
add column if not exists valor_cuota_inicial numeric;

alter table landing_leads
add column if not exists entrega_vehiculo boolean default false;

alter table landing_leads
add column if not exists entrega_marca text;

alter table landing_leads
add column if not exists entrega_modelo text;

alter table landing_leads
add column if not exists entrega_anio integer;

alter table landing_leads
add column if not exists entrega_km integer;

alter table landing_leads
add column if not exists entrega_estado text;

alter table landing_leads
add column if not exists entrega_deuda text;

alter table landing_leads
add column if not exists autorizacion_datos boolean default false;

alter table landing_leads
add column if not exists lead_score integer default 50;

alter table landing_leads
add column if not exists temperatura text default 'tibio';

create index if not exists idx_landing_leads_origen
on landing_leads(origen);

create index if not exists idx_landing_leads_temperatura
on landing_leads(temperatura);

create index if not exists idx_landing_leads_score
on landing_leads(lead_score);
