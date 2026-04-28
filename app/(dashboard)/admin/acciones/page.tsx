"use client";

import { useEffect, useState } from "react";

type ActionItem = {
  lead_id: number;
  nombre: string;
  telefono?: string;
  vehicle_name?: string;
  priority: "alta" | "media" | "baja";
  action: string;
  reason: string;
};

export default function AccionesComercialesPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);

  async function load() {
    const r = await fetch("/api/admin/action-engine", { cache: "no-store" });
    const j = await r.json();
    setActions(j.actions ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-100">Motor de Acciones</h1>
        <p className="text-xs text-slate-400">
          El sistema detecta oportunidades y recomienda qué hacer con cada lead.
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        {actions.length === 0 ? (
          <p className="text-sm text-slate-400">No hay acciones pendientes.</p>
        ) : (
          <div className="space-y-3">
            {actions.map((a, idx) => (
              <div key={`${a.lead_id}-${idx}`} className="rounded-lg border border-slate-800 bg-black/40 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{a.action}</p>
                    <p className="text-xs text-slate-400">{a.reason}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {a.nombre} · {a.telefono || "sin teléfono"}
                    </p>
                    {a.vehicle_name ? (
                      <p className="text-xs text-sky-300">{a.vehicle_name}</p>
                    ) : null}
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] uppercase ${
                      a.priority === "alta"
                        ? "border-red-500/40 bg-red-500/10 text-red-300"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {a.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
