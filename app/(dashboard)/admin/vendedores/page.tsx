"use client";

import { useEffect, useMemo, useState } from "react";

type SellerMetric = {
  id: string;
  nombre: string;
  email?: string;
  activo?: boolean;
  meta_mensual: number;
  total_leads: number;
  nuevos: number;
  vendidos: number;
  perdidos: number;
  ritmo_actual: number;
  ritmo_necesario: number;
  proyeccion_final: number;
  probabilidad: "alta" | "media" | "baja";
  semaforo: "verde" | "amarillo" | "rojo" | "gris";
};

type ApiData = {
  ok: boolean;
  month?: {
    totalDays: number;
    currentDay: number;
    remainingDays: number;
  };
  rows: SellerMetric[];
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

function Badge({ value }: { value: SellerMetric["probabilidad"] }) {
  const cls =
    value === "alta"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : value === "media"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
      : "border-red-500/40 bg-red-500/10 text-red-300";

  return (
    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase ${cls}`}>
      {value}
    </span>
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
      ? "Va bien"
      : value === "amarillo"
      ? "Riesgo"
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

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/commercial-metrics", { cache: "no-store" });
      const json = await res.json();
      setData({
        ok: Boolean(json.ok),
        month: json.month,
        rows: json.rows ?? [],
      });
    } catch (err) {
      console.error("Error cargando Command Center:", err);
      setData({ ok: false, rows: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows = data?.rows ?? [];

  const totalLeads = useMemo(
    () => rows.reduce((acc, r) => acc + (r.total_leads ?? 0), 0),
    [rows]
  );

  const totalVentas = useMemo(
    () => rows.reduce((acc, r) => acc + (r.vendidos ?? 0), 0),
    [rows]
  );

  const metaGlobal = useMemo(
    () => rows.reduce((acc, r) => acc + (r.meta_mensual ?? 0), 0),
    [rows]
  );

  const proyeccionGlobal = useMemo(
    () => rows.reduce((acc, r) => acc + (r.proyeccion_final ?? 0), 0),
    [rows]
  );

  const mejor = useMemo(() => {
    return [...rows].sort((a, b) => (b.vendidos ?? 0) - (a.vendidos ?? 0))[0] ?? null;
  }, [rows]);

  const alertas = useMemo(() => {
    const items: string[] = [];

    rows.forEach((r) => {
      if (r.probabilidad === "baja") {
        items.push(`${r.nombre} tiene baja probabilidad de cumplir la meta mensual.`);
      }

      if ((r.total_leads ?? 0) >= 10 && (r.vendidos ?? 0) === 0) {
        items.push(`${r.nombre} tiene muchos leads y todavía no registra ventas.`);
      }

      if ((r.proyeccion_final ?? 0) < (r.meta_mensual ?? 0)) {
        const faltan = (r.meta_mensual ?? 0) - (r.proyeccion_final ?? 0);
        items.push(`${r.nombre} proyecta cerrar ${r.proyeccion_final} ventas. Le faltarían ${faltan} para la meta.`);
      }
    });

    return items;
  }, [rows]);

  if (loading && !data) {
    return <p className="text-slate-400">Cargando Command Center Comercial…</p>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Command Center Comercial
          </h1>
          <p className="text-xs text-slate-400">
            Control de vendedores, metas, ritmo de ventas y probabilidad de cumplimiento.
          </p>

          {data?.month ? (
            <p className="mt-1 text-[11px] text-slate-500">
              Día {data.month.currentDay} de {data.month.totalDays} · quedan{" "}
              {data.month.remainingDays} días del mes
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
        <Card title="Vendedores" value={rows.length} />
        <Card title="Leads asignados" value={totalLeads} />
        <Card title="Ventas actuales" value={totalVentas} />
        <Card title="Meta global" value={metaGlobal} />
        <Card title="Proyección global" value={proyeccionGlobal} />
      </section>

      {mejor ? (
        <section className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">
            Mejor vendedor actual
          </p>
          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-100">{mejor.nombre}</p>
              <p className="text-xs text-slate-400">
                {mejor.vendidos} ventas · meta {mejor.meta_mensual} · proyección {mejor.proyeccion_final}
              </p>
            </div>
            <Semaforo value={mejor.semaforo} />
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-4">
        <h2 className="text-sm font-semibold text-amber-100">
          Inteligencia predictiva
        </h2>

        {alertas.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {alertas.map((a, idx) => (
              <li key={idx} className="text-sm text-amber-50">
                • {a}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-amber-100/70">
            Sin alertas críticas. El equipo está dentro de parámetros normales.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Proyección por vendedor
          </h2>
          <p className="text-xs text-slate-500">
            Calcula si cada vendedor llegará a su meta según el ritmo actual del mes.
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
                <th className="px-4 py-3 text-right">Ventas</th>
                <th className="px-4 py-3 text-right">Perdidos</th>
                <th className="px-4 py-3 text-left">Meta</th>
                <th className="px-4 py-3 text-right">Ritmo actual</th>
                <th className="px-4 py-3 text-right">Ritmo necesario</th>
                <th className="px-4 py-3 text-right">Proyección</th>
                <th className="px-4 py-3 text-left">Probabilidad</th>
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
                rows.map((r) => {
                  const avanceMeta =
                    r.meta_mensual > 0
                      ? Math.round(((r.vendidos ?? 0) / r.meta_mensual) * 1000) / 10
                      : 0;

                  return (
                    <tr key={r.id} className="border-t border-slate-900">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-100">{r.nombre}</p>
                        {r.email ? (
                          <p className="text-[11px] text-slate-500">{r.email}</p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <Semaforo value={r.semaforo} />
                      </td>

                      <td className="px-4 py-4 text-right text-slate-200">{r.total_leads}</td>
                      <td className="px-4 py-4 text-right text-slate-200">{r.nuevos}</td>
                      <td className="px-4 py-4 text-right text-emerald-300">{r.vendidos}</td>
                      <td className="px-4 py-4 text-right text-red-300">{r.perdidos}</td>

                      <td className="px-4 py-4">
                        <div className="min-w-[150px] space-y-2">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-slate-400">
                              {r.vendidos}/{r.meta_mensual}
                            </span>
                            <span className="text-slate-500">{avanceMeta}%</span>
                          </div>
                          <ProgressBar value={avanceMeta} />
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right text-slate-200">
                        {r.ritmo_actual} ventas/día
                      </td>

                      <td className="px-4 py-4 text-right text-slate-200">
                        {r.ritmo_necesario} ventas/día
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="font-semibold text-sky-300">
                          {r.proyeccion_final}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <Badge value={r.probabilidad} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
