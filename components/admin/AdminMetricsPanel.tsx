"use client";

import { useEffect, useMemo, useState } from "react";

type Summary = {
  range: string;
  since: string;
  totalsByType: Record<string, number>;
  totalsByOrigin: Record<string, number>;
  totalsByDevice: Record<string, number>;
  series: { date: string; total: number; byType: Record<string, number> }[];
  topVehicles: { vehicle_id: number | null; vehicle_name: string | null; count: number }[];
  totalEvents: number;
};

const ranges = [
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" },
  { key: "90d", label: "90 días" },
];

function num(v?: number) {
  return typeof v === "number" ? v : 0;
}

export default function AdminMetricsPanel() {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/events/summary?range=${range}`, { cache: "no-store" });
      const json = (await r.json()) as Summary;
      setData(json);
    } catch (e) {
      console.error("Error cargando summary:", e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 12000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const cards = useMemo(() => {
    const t = data?.totalsByType || {};
    const pageViews = num(t.page_view);
    const waTotal = num(t.whatsapp_click) + num(t.whatsapp_click_vehicle);
    const modalOpens = num(t.entry_modal_open) + num(t.cta_open_modal_vehicle);
    const leadSubmit = num(t.lead_submit);

    return { pageViews, waTotal, modalOpens, leadSubmit };
  }, [data]);

  if (loading && !data) {
    return <p className="text-slate-400">Cargando métricas…</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Métricas internas</h2>
          <p className="text-xs text-slate-400">
            Basado en la tabla <code className="text-slate-300">events</code> (tracking interno).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {ranges.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium border transition ${
                range === r.key
                  ? "border-sky-500 bg-sky-500/10 text-sky-200"
                  : "border-slate-700 bg-slate-950/40 text-slate-200 hover:bg-slate-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card title="Page views" value={cards.pageViews} />
        <Card title="Clicks WhatsApp" value={cards.waTotal} />
        <Card title="Aperturas modal" value={cards.modalOpens} />
        <Card title="Leads enviados" value={cards.leadSubmit} />
      </div>

      {/* Series (simple bars) */}
      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-300 font-semibold">Eventos por día</p>
          <p className="text-[10px] text-slate-500">
            total: {data?.totalEvents ?? 0}
          </p>
        </div>

        {!data?.series || data.series.length === 0 ? (
          <p className="text-xs text-slate-400 mt-2">Sin datos en el rango.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {data.series.map((p) => (
              <div key={p.date} className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 w-20">{p.date}</span>
                <div className="flex-1 h-2 rounded bg-slate-800 overflow-hidden">
                  <div
                    className="h-2 bg-sky-500/70"
                    style={{
                      width: `${Math.min(100, (p.total / maxSeries(data.series)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-300 w-10 text-right">{p.total}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top vehicles */}
      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
        <p className="text-xs text-slate-300 font-semibold mb-2">
          Top vehículos por WhatsApp
        </p>

        {!data?.topVehicles || data.topVehicles.length === 0 ? (
          <p className="text-xs text-slate-400">Todavía no hay clicks por vehículo.</p>
        ) : (
          <div className="space-y-1">
            {data.topVehicles.slice(0, 10).map((v, idx) => (
              <div key={`${v.vehicle_id}-${idx}`} className="flex items-center justify-between text-xs">
                <span className="text-slate-200">
                  {v.vehicle_name || `Vehículo ${v.vehicle_id ?? "N/A"}`}
                </span>
                <span className="text-slate-300 font-semibold">{v.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Devices */}
      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
        <p className="text-xs text-slate-300 font-semibold mb-2">Dispositivos</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(data?.totalsByDevice || {}).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-[10px] text-slate-400">{k}</p>
              <p className="text-lg font-semibold text-slate-50">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function maxSeries(s: { total: number }[]) {
  return Math.max(1, ...s.map((x) => x.total || 0));
}

function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="text-2xl font-semibold text-slate-50">{value}</p>
    </div>
  );
}
