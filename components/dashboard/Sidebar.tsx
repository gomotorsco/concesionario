import Link from "next/link";

const items = [
  { label: "Resumen", href: "/admin" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Automóviles", href: "/admin/automoviles" },
  { label: "Motos", href: "/admin/motos" },
  { label: "Ciclomotores", href: "/admin/ciclomotores" },
  { label: "Crear vendedores", href: "/admin/equipo" },
  { label: "Panel vendedores", href: "/admin/vendedores" },
  { label: "Alertas", href: "/admin/alertas" },
  { label: "Fichas técnicas", href: "/admin/fichas-tecnicas" },
  { label: "Branding", href: "/admin/branding" },
  { label: "Configuración", href: "/admin/configuracion" },
];

export function Sidebar() {
  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 overflow-y-auto border-r border-white/10 bg-[#030509] p-5 text-white lg:block">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-blue-300">GoMotorsCo</p>
          <h1 className="mt-2 text-2xl font-black">Panel admin</h1>
        </div>

        <nav className="space-y-1 pb-24">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-blue-600 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030509]/95 px-3 py-3 text-white backdrop-blur lg:hidden">
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-blue-300">GoMotorsCo</p>
          <h1 className="text-lg font-black">Panel admin</h1>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
