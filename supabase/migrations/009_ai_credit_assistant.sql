create table if not exists ai_assistant_settings (
  id bigserial primary key,
  assistant_name text default 'Asistente Comercial',
  tone text default 'profesional',
  main_prompt text,
  fallback_message text default 'Para confirmarte ese dato exacto, te paso con un asesor comercial.',
  whatsapp_number text,
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists ai_assistant_faqs (
  id bigserial primary key,
  question text not null,
  answer text not null,
  category text default 'credito',
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into ai_assistant_settings (assistant_name, tone, main_prompt, fallback_message)
select
  'Asistente Comercial',
  'profesional',
  'Eres el asistente comercial virtual de un concesionario. Responde de forma clara, breve y profesional sobre financiación, requisitos, cuota inicial, horarios, ubicación y vehículos. No prometas aprobación de créditos, tasas exactas ni disponibilidad sin confirmación. Si el cliente muestra intención de compra, pide nombre, WhatsApp y vehículo de interés para derivarlo a un asesor.',
  'Para confirmarte ese dato exacto, te paso con un asesor comercial.'
where not exists (select 1 from ai_assistant_settings);

insert into ai_assistant_faqs (question, answer, category)
select '¿Qué necesito para financiar?', 'Normalmente se revisan ingresos, actividad laboral, cuota inicial y perfil crediticio. Podemos hacer una evaluación inicial con tus datos básicos.', 'credito'
where not exists (select 1 from ai_assistant_faqs where question = '¿Qué necesito para financiar?');

insert into ai_assistant_faqs (question, answer, category)
select '¿Puedo entregar mi vehículo como parte de pago?', 'Sí, podés indicar si tenés vehículo para entregar. Un asesor revisa marca, modelo, año, kilometraje y estado general para una tasación inicial.', 'parte_pago'
where not exists (select 1 from ai_assistant_faqs where question = '¿Puedo entregar mi vehículo como parte de pago?');

insert into ai_assistant_faqs (question, answer, category)
select '¿La preaprobación garantiza el crédito?', 'No. Es una evaluación inicial. La aprobación final depende del análisis financiero y de la entidad correspondiente.', 'credito'
where not exists (select 1 from ai_assistant_faqs where question = '¿La preaprobación garantiza el crédito?');
