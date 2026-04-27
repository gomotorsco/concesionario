"use client";

import { useEffect, useMemo, useState } from "react";

type SellerMetric = {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  meta_mensual: number;
  total_leads: number;
  nuevos: number;
  en_seguimiento: number;
  vendidos: number;
  perdidos: number;
  trabajados: number;
  sin_trabajar: number;
  conversion: number;
  progreso_meta: number;
  ratio_trabajo: number;
  ventas_faltantes: number;
  semaforo: "verde" | "amarillo" | "rojo" | "gris";
};

type ApiData = {
  ok: boolean;
  since: string;
  summary: {
    vendedores: number;
    activos: number;
    total_leads: number;
    total_ventas: number;
    total_perdidos: number;
    sin_asignar: number;
    conversion_general: number;
  };
  rows: SellerMetric[];
  ranking: SellerMetric[];
  alerts: string[];
};

function Card({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-50">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

function Semaforo({ value }: { value: SellerMetric["semaforo"] }) {
  const cls =
    value === "verde"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
      : value === "amarillo"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
      : value === "rojo"
      ? "bg-red-500/15 text-red-300 border-red-500/40"
      : "bg-slate-500/15 text-slate-300 border-slate-500/40";

  const label =
    value === "verde"
      ? "Bien"
      : value === "amarillo"
      ? "Atención"
      : value === "rojo"
      ? "Crítico"
      : "Sin datos";

  return (
    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase ${cls}`}>
      {label}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(value, 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div className="h-full rounded-full bg-sky-500" style={{ width: `${width}%` }} />
    </div>
  );
}

export default function VendedoresCommandCenter() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/commercial-metrics", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error cargando métricas comerciales:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateSeller(id: string, payload: Record<string, any>) {
    setSavingId(id);
    try {
      const res = await fetch("/api/vendedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "update", id, ...payload }),
      });

      if (!res.ok) {
        alert("No se pudo actualizar el vendedor.");
        return;
      }

      await load();
    } finally {
      setSavingId(null);
    }
  }

  const rows = data?.rows ?? [];
  const topSeller = useMemo(() => data?.ranking?.[0] ?? null, [data]);

  if (loading && !data) {
    return <p className="text-slate-400">Cargando Command Center Comercial…</p>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Command Center Comercial</h1>
          <p className="text-xs text-slate-400">
            Control de vendedores, metas, conversión y alertas de operación comercial.
          </p>
          {data?.since ? (
            <p className="mt-1 text-[11px] text-slate-500">
              Métricas desde: {new Date(data.since).toLocaleDateString("es-CO")}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-slate-100 hover:bg-slate-800"
        >
          Actualizar
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card title="Vendedores activos" value={data?.summary.activos ?? 0} hint={`Total: ${data?.summary.vendedores ?? 0}`} />
        <Card title="Leads asignados" value={data?.summary.total_leads ?? 0} />
        <Card title="Ventas del mes" value={data?.summary.total_ventas ?? 0} />
        <Card title="Conversión general" value={`${data?.summary.conversion_general ?? 0}%`} />
        <Card title="Leads sin asignar" value={data?.summary.sin_asignar ?? 0} />
      </section>

      {topSeller ? (
        <section className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">Mejor rendimiento</p>
          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-100">{topSeller.nombre}</p>
              <p className="text-xs text-slate-400">
                {topSeller.vendidos} ventas · {topSeller.conversion}% conversión · meta {topSeller.meta_mensual}
              </p>
            </div>
            <Semaforo value={topSeller.semaforo} />
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-4">
        <h2 className="text-sm font-semibold text-amber-100">Alertas de inteligencia comercial</h2>
        {data?.alerts && data.alerts.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {data.alerts.map((a, idx) => (
              <li key={idx} className="text-sm text-amber-50">
                • {a}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-amber-100/70">Sin alertas críticas por ahora.</p>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-100">Ranking y control por vendedor</h2>
          <p className="text-xs text-slate-500">
            Rendimiento mensual, ratio de trabajo y progreso contra meta.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-black/70 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Vendedor</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Leads</th>
                <th className="px-4 py-3 text-right">Nuevos</th>
                <th className="px-4 py-3 text-right">Seguimiento</th>
                <th className="px-4 py-3 text-right">Ventas</th>
                <th className="px-4 py-3 text-right">Perdidos</th>
                <th className="px-4 py-3 text-right">Conversión</th>
                <th className="px-4 py-3 text-left">Meta</th>
                <th className="px-4 py-3 text-left">Trabajo</th>
                <th className="px-4 py-3 text-left">Activo</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-xs text-slate-500">
                    No hay vendedores cargados.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-900">
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-100">{r.nombre}</p>
                      <p className="text-[11px] text-slate-500">{r.email}</p>
                    </td>

                    <td className="px-4 py-4">
                      <Semaforo value={r.semaforo} />
                    </td>

                    <td className="px-4 py-4 text-right text-slate-200">{r.total_leads}</td>
                    <td className="px-4 py-4 text-right text-slate-200">{r.nuevos}</td>
                    <td className="px-4 py-4 text-right text-slate-200">{r.en_seguimiento}</td>
                    <td className="px-4 py-4 text-right text-emerald-300">{r.vendidos}</td>
                    <td className="px-4 py-4 text-right text-red-300">{r.perdidos}</td>
                    <td className="px-4 py-4 text-right text-slate-200">{r.conversion}%</td>

                    <td className="px-4 py-4">
                      <div className="min-w-[150px] space-y-2">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-slate-400">
                            {r.vendidos}/{r.meta_mensual}
                          </span>
                          <span className="text-slate-500">{r.progreso_meta}%</span>
                        </div>
                        <ProgressBar value={r.progreso_meta} />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            defaultValue={r.meta_mensual}
                            onBlur={(e) => {
                              const val = Number(e.target.value || 0);
                              if (val !== r.meta_mensual) {
                                updateSeller(r.id, { meta_mensual: val });
                              }
                            }}
                            className="w-20 rounded border border-slate-700 bg-black px-2 py-1 text-xs text-slate-100"
                          />
                          {savingId === r.id ? (
                            <span className="text-[10px] text-slate-500">Guardando…</span>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="min-w-[130px] space-y-2">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-slate-400">{r.trabajados}/{r.total_leads}</span>
                          <span className="text-slate-500">{r.ratio_trabajo}%</span>
                        </div>
                        <ProgressBar value={r.ratio_trabajo} />
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => updateSeller(r.id, { activo: !r.activo })}
                        className={`rounded-full border px-3 py-1 text-[11px] ${
                          r.activo
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-slate-600 bg-slate-800 text-slate-300"
                        }`}
                      >
                        {r.activo ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
