create table if not exists site_branding (
  id bigserial primary key,
  business_name text default 'Concesionario',
  slogan text,
  whatsapp text,
  email text,
  address text,
  city text,
  primary_color text default '#2563eb',
  secondary_color text default '#16a34a',
  logo_url text,
  hero_title text,
  hero_subtitle text,
  seo_title text,
  seo_description text,
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into site_branding (
  business_name,
  slogan,
  hero_title,
  hero_subtitle,
  seo_title,
  seo_description
)
select
  'Concesionario',
  'Vehículos, financiación y asesoría comercial',
  'Encontrá tu próximo vehículo',
  'Autos, motos y financiación con asesoría personalizada.',
  'Concesionario | Vehículos y financiación',
  'Consulta vehículos disponibles y solicita una evaluación inicial de financiación.'
where not exists (select 1 from site_branding);
