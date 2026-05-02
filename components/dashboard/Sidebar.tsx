import Link from "next/link";

const items = [
  { label: "Resumen", href: "/admin" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Vehículos", href: "/admin/vehiculos" },
  { label: "Motos", href: "/admin/motos" },
  { label: "Ciclomotores", href: "/admin/ciclomotores" },
  { label: "Equipo", href: "/admin/equipo" },
  { label: "Vendedores", href: "/admin/vendedores", pro: true },
  { label: "Funnel", href: "/admin/funnel", pro: true },
  { label: "Acciones", href: "/admin/acciones", pro: true },
  { label: "Alertas", href: "/admin/alertas", pro: true },
  { label: "Automatización", href: "/admin/automatizacion", pro: true },
  { label: "IA Créditos", href: "/admin/ia-creditos", pro: true },
  { label: "Branding", href: "/admin/branding", pro: true },
  { label: "Contenido", href: "/admin/contenido" },
  { label: "Configuración", href: "/admin/configuracion" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-white/10 bg-black/95 p-5 text-white lg:block">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
          GoMotorsCo
        </p>
        <h1 className="mt-2 text-2xl font-black">Panel admin</h1>
      </div>

      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-blue-600 hover:text-white"
          >
            <span>{item.label}</span>
            {item.pro ? (
              <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-slate-400">
                Pro
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-5 left-5 right-5 text-xs leading-5 text-slate-500">
        Control comercial · CRM · inventario · marcas
      </div>
    </aside>
  );
}
