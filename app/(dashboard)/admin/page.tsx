"use client";

import { useEffect, useMemo, useState } from "react";
import { Funnel, MiniBarChart, MiniLineChart } from "@/components/admin/Charts";

type Lead = {
  id: number;
  nombre: string;
  email: string;
  telefono_numero: string;
  created_at: string;
  seguimiento: string | null;
  visto: boolean | null;
  estado?: string | null;
  [key: string]: any;
};

type DashboardMetrics = {
  recent: Lead[];
};

type AdminMetrics = {
  range: string;
  since: string;
  totalEvents: number;
  totalsByType: Record<string, number>;
  totalsByOrigin: Record<string, number>;
  seriesByType: Record<string, { date: string; count: number }[]>;
  funnel: {
    page_views: number;
    modal_opens: number;
    whatsapp_total: number;
    whatsapp_vehicle: number;
    lead_submit: number;
    conv_lead_from_pv: number;
    conv_whatsapp_from_pv: number;
  };
  topVehicles: { vehicle_id: number | null; vehicle_name: string | null; count: number }[];
  devices: Record<string, number>;
  whatsappByOrigin: Record<string, number>;
  topUtmSource: { key: string; count: number }[];
  topUtmCampaign: { key: string; count: number }[];
  topUtmTerm: { key: string; count: number }[];
  topLanding: { key: string; count: number }[];
};

function Card({ title, value, hint }: { title: string; value: number | string; hint?: string }) {
  return (
    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="text-3xl font-semibold text-slate-50">{value}</p>
      {hint ? <p className="text-[11px] text-slate-500 mt-1">{hint}</p> : null}
    </div>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState<"7d" | "30d">("7d");

  const [leadsData, setLeadsData] = useState<DashboardMetrics | null>(null);
  const [adminData, setAdminData] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    try {
      // 1) Leads “operativos” (tu API existente)
      const r1 = await fetch("/api/dashboard", { cache: "no-store" });
      const j1 = (await r1.json()) as any;
      setLeadsData({ recent: j1.recent ?? [] });

      // 2) Métricas internas “pro”
      const r2 = await fetch(`/api/admin/metrics?range=${range}`, { cache: "no-store" });
      const j2 = (await r2.json()) as AdminMetrics;
      setAdminData(j2);
    } catch (e) {
      console.error("Error cargando dashboard:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const leadsNuevos = useMemo(() => {
    return leadsData?.recent?.filter((l) => !l.visto)?.length ?? 0;
  }, [leadsData]);

  const leadsEnSeguimiento = useMemo(() => {
    return (
      leadsData?.recent?.filter((l) => (l.seguimiento ?? "").toString().trim() !== "").length ??
      0
    );
  }, [leadsData]);

  const seriesPageViews = adminData?.seriesByType?.page_view ?? [];
  const seriesLeads = adminData?.seriesByType?.lead_submit ?? [];
  const seriesWhatsApp = adminData?.seriesByType?.whatsapp_click ?? [];
  const seriesModal = adminData?.seriesByType?.entry_modal_open ?? [];

  const deviceItems = useMemo(() => {
    const d = adminData?.devices ?? {};
    const items = Object.entries(d).map(([k, v]) => ({ label: k, value: v }));
    return items.sort((a, b) => b.value - a.value).slice(0, 8);
  }, [adminData]);

  const whatsappOriginItems = useMemo(() => {
    const o = adminData?.whatsappByOrigin ?? {};
    const items = Object.entries(o).map(([k, v]) => ({ label: k, value: v }));
    return items.sort((a, b) => b.value - a.value).slice(0, 8);
  }, [adminData]);

  if (loading && (!leadsData || !adminData)) {
    return <p className="text-slate-400">Cargando…</p>;
  }

  return (
    <div className="space-y-6">
      <AdminMetricsPanel />

      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Visión general</h1>
          <p className="text-xs text-slate-400">Leads + métricas internas reales</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRange("7d")}
            className={`px-3 py-1.5 rounded-lg border text-xs ${
              range === "7d"
                ? "border-sky-500 bg-sky-500/20 text-slate-50"
                : "border-slate-700 bg-slate-950/40 text-slate-200 hover:bg-slate-900"
            }`}
          >
            7 días
          </button>
          <button
            type="button"
            onClick={() => setRange("30d")}
            className={`px-3 py-1.5 rounded-lg border text-xs ${
              range === "30d"
                ? "border-sky-500 bg-sky-500/20 text-slate-50"
                : "border-slate-700 bg-slate-950/40 text-slate-200 hover:bg-slate-900"
            }`}
          >
            30 días
          </button>
        </div>
      </div>

      {/* Cards operativas (leads) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Leads nuevos" value={leadsNuevos} />
        <Card title="Leads en seguimiento" value={leadsEnSeguimiento} />
      </section>

      {/* Cards métricas internas */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Page views" value={adminData?.funnel.page_views ?? 0} />
        <Card title="Clicks WhatsApp (total)" value={adminData?.funnel.whatsapp_total ?? 0} />
        <Card title="Clicks WhatsApp (vehículo)" value={adminData?.funnel.whatsapp_vehicle ?? 0} />
        <Card title="Aperturas modal" value={adminData?.funnel.modal_opens ?? 0} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Leads enviados (event)" value={adminData?.funnel.lead_submit ?? 0} />
        <Card title="Total eventos" value={adminData?.totalEvents ?? 0} />
        <Card title="Desde" value={(adminData?.since ?? "").slice(0, 10)} />
        <Card title="Rango" value={adminData?.range ?? range} />
      </section>

      {/* Funnel */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Funnel</h2>
        <Funnel
          pv={adminData?.funnel.page_views ?? 0}
          modal={adminData?.funnel.modal_opens ?? 0}
          wa={adminData?.funnel.whatsapp_total ?? 0}
          lead={adminData?.funnel.lead_submit ?? 0}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card
            title="Conv. Lead / PV"
            value={`${adminData?.funnel.conv_lead_from_pv ?? 0}%`}
            hint="Leads enviados / page views"
          />
          <Card
            title="Conv. WhatsApp / PV"
            value={`${adminData?.funnel.conv_whatsapp_from_pv ?? 0}%`}
            hint="WhatsApp clicks / page views"
          />
        </div>
      </section>

      {/* Charts por evento */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Series por día</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Page views (día)" data={seriesPageViews} />
          <ChartCard title="Aperturas modal (día)" data={seriesModal} />
          <ChartCard title="WhatsApp total (día)" data={seriesWhatsApp} />
          <ChartCard title="Leads enviados (día)" data={seriesLeads} />
        </div>
      </section>

      {/* Top vehículos */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Top vehículos por WhatsApp</h2>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          {(!adminData?.topVehicles || adminData.topVehicles.length === 0) ? (
            <p className="text-xs text-slate-400">Sin datos todavía.</p>
          ) : (
            <div className="space-y-2">
              {adminData.topVehicles.map((v) => (
                <div key={`${v.vehicle_id}-${v.vehicle_name}`} className="flex justify-between text-sm">
                  <span className="text-slate-100">{v.vehicle_name || `ID ${v.vehicle_id}`}</span>
                  <span className="text-slate-300">{v.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Breakdowns */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BreakdownCard title="Dispositivo" items={deviceItems} />
        <BreakdownCard title="WhatsApp por origen" items={whatsappOriginItems} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BreakdownCard
          title="Top UTM Source"
          items={(adminData?.topUtmSource ?? []).map((x) => ({ label: x.key, value: x.count }))}
        />
        <BreakdownCard
          title="Top UTM Campaign"
          items={(adminData?.topUtmCampaign ?? []).map((x) => ({ label: x.key, value: x.count }))}
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BreakdownCard
          title="Top palabras (utm_term)"
          items={(adminData?.topUtmTerm ?? []).map((x) => ({ label: x.key, value: x.count }))}
        />
        <BreakdownCard
          title="Top landing pages"
          items={(adminData?.topLanding ?? []).map((x) => ({ label: x.key, value: x.count }))}
        />
      </section>
    </div>
  );
}

function ChartCard({ title, data }: { title: string; data: { date: string; count: number }[] }) {
  const total = data.reduce((acc, p) => acc + p.count, 0);
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-slate-100">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-slate-400">Total: {total}</p>
      </div>
      <div className="text-slate-200 mt-3">
        <MiniLineChart data={data} />
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number }[];
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <div className="mt-3">
        {(!items || items.length === 0) ? (
          <p className="text-xs text-slate-400">Sin datos.</p>
        ) : (
          <MiniBarChart items={items} />
        )}
      </div>
    </div>
  );
}