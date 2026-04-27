"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: number;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  telefono_numero?: string | null;
  estado: string;
  seguimiento?: string | null;
  created_at: string;
  vehicle_name?: string | null;
};

type ApiData = {
  ok: boolean;
  vendedor?: {
    id: string;
    nombre: string;
    email: string;
    meta_mensual: number;
  };
  leads: Lead[];
  metrics?: {
    total_mes: number;
    nuevos: number;
    en_seguimiento: number;
    vendidos: number;
    perdidos: number;
    meta_mensual: number;
    conversion: number;
    progreso_meta: number;
  };
  inteligencia?: string[];
};

function Card({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
      <p className="text-xs text-zinc-400">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export default function VendedorPanel() {
  const [data, setData] = useState<ApiData | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [seguimiento, setSeguimiento] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/vendedor-leads", { cache: "no-store" });
    const j = await r.json();
    setData(j);
  }

  useEffect(() => {
    load();
  }, []);

  const leads = data?.leads ?? [];
  const metrics = data?.metrics;

  const nuevos = useMemo(() => leads.filter((l) => l.estado === "nuevo"), [leads]);
  const enSeguimiento = useMemo(() => leads.filter((l) => l.estado === "en_seguimiento"), [leads]);
  const vendidos = useMemo(() => leads.filter((l) => l.estado === "vendido"), [leads]);
  const perdidos = useMemo(() => leads.filter((l) => l.estado === "perdido"), [leads]);

  function openLead(l: Lead) {
    setSelected(l);
    setSeguimiento(l.seguimiento ?? "");
  }

  async function updateLead(payload: Record<string, any>) {
    if (!selected) return;
    setSaving(true);

    const r = await fetch("/api/vendedor-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, ...payload }),
    });

    setSaving(false);

    if (r.ok) {
      await load();
      const j = await r.json();
      setSelected({
        ...selected,
        ...j.lead,
        telefono_numero: j.lead.telefono_numero ?? j.lead.telefono ?? "",
      });
    }
  }

  function whatsappUrl(lead: Lead) {
    const phone = (lead.telefono_numero || lead.telefono || "").replace(/\D/g, "");
    return phone ? `https://wa.me/${phone}` : "#";
  }

  if (!data) {
    return <div className="min-h-screen bg-black p-6 text-white">Cargando panel vendedor…</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-zinc-950 px-6 py-4">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Panel comercial</p>
        <h1 className="text-xl font-semibold">
          {data.vendedor?.nombre ?? "Vendedor"}
        </h1>
      </header>

      <main className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card title="Leads del mes" value={metrics?.total_mes ?? 0} />
          <Card title="Nuevos" value={metrics?.nuevos ?? 0} />
          <Card title="En seguimiento" value={metrics?.en_seguimiento ?? 0} />
          <Card title="Ventas" value={metrics?.vendidos ?? 0} hint={`Meta: ${metrics?.meta_mensual ?? 0}`} />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card title="Conversión" value={`${metrics?.conversion ?? 0}%`} />
          <Card title="Progreso meta" value={`${metrics?.progreso_meta ?? 0}%`} />
          <Card title="Perdidos" value={metrics?.perdidos ?? 0} />
        </section>

        <section className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
          <h2 className="mb-3 text-sm font-semibold text-amber-100">
            Inteligencia comercial
          </h2>
          {data.inteligencia && data.inteligencia.length > 0 ? (
            <ul className="space-y-2">
              {data.inteligencia.map((item, idx) => (
                <li key={idx} className="text-sm text-amber-50">
                  • {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-amber-100/70">
              Sin alertas importantes por ahora.
            </p>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <LeadBox title={`Nuevos (${nuevos.length})`} leads={nuevos} onSelect={openLead} />
            <LeadBox title={`En seguimiento (${enSeguimiento.length})`} leads={enSeguimiento} onSelect={openLead} />
            <LeadBox title={`Vendidos (${vendidos.length})`} leads={vendidos} onSelect={openLead} />
            <LeadBox title={`Perdidos (${perdidos.length})`} leads={perdidos} onSelect={openLead} />
          </div>

          <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
            {!selected ? (
              <p className="text-sm text-zinc-400">
                Seleccioná un lead para gestionarlo.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold">{selected.nombre}</p>
                  <p className="text-sm text-zinc-400">
                    {selected.telefono_numero || selected.telefono || "Sin teléfono"}
                  </p>
                  {selected.vehicle_name ? (
                    <p className="mt-1 text-xs text-blue-300">
                      Vehículo: {selected.vehicle_name}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-zinc-500">
                    Estado: {selected.estado}
                  </p>
                </div>

                <a
                  href={whatsappUrl(selected)}
                  target="_blank"
                  className="block rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-medium"
                >
                  Abrir WhatsApp
                </a>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateLead({ estado: "en_seguimiento" })} className="rounded bg-blue-600 px-3 py-1.5 text-xs">
                    En seguimiento
                  </button>
                  <button onClick={() => updateLead({ estado: "vendido" })} className="rounded bg-emerald-600 px-3 py-1.5 text-xs">
                    Vendido
                  </button>
                  <button onClick={() => updateLead({ estado: "perdido" })} className="rounded bg-red-700 px-3 py-1.5 text-xs">
                    Perdido
                  </button>
                </div>

                <div>
                  <p className="mb-1 text-xs text-zinc-400">Seguimiento</p>
                  <textarea
                    value={seguimiento}
                    onChange={(e) => setSeguimiento(e.target.value)}
                    className="min-h-[120px] w-full rounded-lg border border-white/10 bg-black p-3 text-sm"
                    placeholder="Notas de llamada, objeciones, próximo contacto..."
                  />
                  <button
                    onClick={() => updateLead({ seguimiento, estado: "en_seguimiento", visto: true })}
                    disabled={saving}
                    className="mt-2 rounded bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
                  >
                    {saving ? "Guardando…" : "Guardar seguimiento"}
                  </button>
                </div>

                <section className="rounded-lg border border-white/10 bg-black p-3">
                  <p className="mb-2 text-xs font-semibold text-zinc-300">
                    Capacitación rápida
                  </p>
                  <ul className="space-y-1 text-xs text-zinc-400">
                    <li>• Contactá leads nuevos lo antes posible.</li>
                    <li>• Siempre registrá objeciones en seguimiento.</li>
                    <li>• Si el cliente duda, agendá próximo contacto.</li>
                    <li>• Meta: convertir mínimo 1 de cada 10 leads.</li>
                  </ul>
                </section>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function LeadBox({
  title,
  leads,
  onSelect,
}: {
  title: string;
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {leads.length === 0 ? (
        <p className="text-xs text-zinc-500">Sin leads.</p>
      ) : (
        <div className="space-y-2">
          {leads.map((l) => (
            <button
              key={l.id}
              onClick={() => onSelect(l)}
              className="w-full rounded-lg border border-white/10 bg-black p-3 text-left hover:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{l.nombre}</p>
                  <p className="text-xs text-zinc-400">
                    {l.telefono_numero || l.telefono || "Sin teléfono"}
                  </p>
                  {l.vehicle_name ? (
                    <p className="text-[11px] text-blue-300">{l.vehicle_name}</p>
                  ) : null}
                </div>
                <span className="text-[10px] text-zinc-500">
                  {l.created_at ? new Date(l.created_at).toLocaleDateString("es-CO") : ""}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
