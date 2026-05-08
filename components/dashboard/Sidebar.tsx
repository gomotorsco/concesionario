"use client";

import Link from "next/link";
import { useState } from "react";

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
  { label: "Capacitación", href: "/admin/capacitacion" },
  { label: "Branding", href: "/admin/branding" },
  { label: "Configuración", href: "/admin/configuracion" },
];

async function logout() {
  await fetch("/api/admin-logout", { method: "POST" });
  window.location.href = "/admin/login";
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 overflow-y-auto border-r border-white/10 bg-[#030509] p-5 text-white lg:block">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-blue-300">GoMotorsCo</p>
          <h1 className="mt-2 text-2xl font-black">Panel admin</h1>
        </div>

        <nav className="space-y-1 pb-8">
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

        <button
          onClick={logout}
          className="mt-4 flex w-full items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-500 hover:text-white"
        >
          Cerrar sesión
        </button>
      </aside>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030509]/95 px-4 py-3 text-white backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-blue-300">GoMotorsCo</p>
            <h1 className="text-lg font-black">Panel admin</h1>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black"
          >
            ☰ Menú
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          />

          <aside className="absolute left-0 top-0 h-full w-[82vw] max-w-[320px] overflow-y-auto border-r border-white/10 bg-[#030509] p-5 text-white shadow-[0_30px_100px_rgba(0,0,0,.45)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-blue-300">GoMotorsCo</p>
                <h2 className="mt-2 text-2xl font-black">Panel admin</h2>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-1 pb-6">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-blue-600 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={logout}
              className="flex w-full items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300"
            >
              Cerrar sesión
            </button>
          </aside>
        </div>
      ) : null}
    </>
  );
}
