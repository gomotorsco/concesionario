"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  label: string;
  href: string;
  pro?: boolean;
};

const items: Item[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Vehículos", href: "/admin/vehiculos", pro: true },
  { label: "Equipo", href: "/admin/equipo", pro: true },
  { label: "Vendedores", href: "/admin/vendedores", pro: true },
  { label: "Funnel", href: "/admin/funnel", pro: true },
  { label: "Acciones", href: "/admin/acciones", pro: true },
  { label: "Alertas", href: "/admin/alertas", pro: true },
  { label: "Automatización", href: "/admin/automatizacion", pro: true },
  { label: "IA Créditos", href: "/admin/ia", pro: true },
  { label: "Contenido", href: "/admin/contenido" },
  { label: "Configuración", href: "/admin/configuracion" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-black/80 backdrop-blur-md flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
            PLAN 0KM
          </p>
          <p className="text-xs text-gray-400">
            Sistema comercial
          </p>
        </div>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {items.map((i) => {
            const active = path === i.href;
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  className={`flex items-center justify-between px-5 py-2.5 text-sm rounded-xl mx-2 transition ${
                    active
                      ? "bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.45)]"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
                  }`}
                >
                  <span>{i.label}</span>
                  {i.pro && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-600 text-gray-400">
                      Pro
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-gray-500">
        Control comercial · CRM · IA · vehículos
      </div>
    </aside>
  );
}
