"use client";

import { useEffect, useState } from "react";

type FunnelItem = {
  stage: string;
  count: number;
};

type HotLead = {
  id: number;
  nombre: string;
  telefono?: string;
  telefono_numero?: string;
  vehicle_name?: string;
  computed_score: number;
  computed_temperatura: string;
};

type Data = {
  ok: boolean;
  summary: {
    total: number;
    vendidos: number;
    perdidos: number;
    calientes: number;
    sin_tocar: number;
    conversion: number;
  };
  funnel: FunnelItem[];
  hotLeads: HotLead[];
};

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function label(stage: string) {
  const map: Record<string, string> = {
    nuevo: "Nuevo",
    contacto: "Contacto",
    en_seguimiento: "Seguimiento",
    negociacion: "Negociación",
    vendido: "Vendido",
    perdido: "Perdido",
  };
  return map[stage] ?? stage;
}

export default function FunnelPage() {
  const [data, setData] = useState<Data | null>(null);

  async function load() {
    const r = await fetch("/api/admin/funnel", { cache: "no-store" });
    const j = await r.json();
    setData(j);
  }

  useEffect(() => {
    load();
  }, []);

  if (!data) return <p className="text-slate-400">Cargando funnel comercial…</p>;

  const max = Math.max(...(data.funnel ?? []).map((x) => x.count), 1);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-100">Funnel Comercial</h1>
        <p className="text-xs text-slate-400">
          Visualiza el recorrido de los leads desde entrada hasta venta.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card title="Total leads" value={data.summary.total} />
        <Card title="Vendidos" value={data.summary.vendidos} />
        <Card title="Perdidos" value={data.summary.perdidos} />
        <Card title="Leads calientes" value={data.summary.calientes} />
        <Card title="Conversión" value={`${data.summary.conversion}%`} />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-100">Embudo por etapa</h2>

        <div className="space-y-4">
          {data.funnel.map((item) => (
            <div key={item.stage}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-300">{label(item.stage)}</span>
                <span className="text-slate-500">{item.count}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-4">
        <h2 className="text-sm font-semibold text-amber-100">Leads calientes</h2>

        {data.hotLeads.length === 0 ? (
          <p className="mt-2 text-sm text-amber-100/70">No hay leads calientes todavía.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.hotLeads.map((l) => (
              <div key={l.id} className="rounded-lg border border-amber-500/20 bg-black/40 p-3">
                <p className="text-sm font-semibold text-slate-100">{l.nombre}</p>
                <p className="text-xs text-slate-400">
                  {l.telefono_numero || l.telefono || "Sin teléfono"}
                </p>
                {l.vehicle_name ? (
                  <p className="text-xs text-sky-300">{l.vehicle_name}</p>
                ) : null}
                <p className="mt-2 text-xs text-amber-200">
                  Score: {l.computed_score} · {l.computed_temperatura}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
