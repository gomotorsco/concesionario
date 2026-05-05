"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = any;
type Alert = any;
type Vendedor = any;

const estados = ["nuevo", "contactado", "seguimiento", "aprobado", "vendido", "pausado", "perdido"];

export default function VendedorPage() {
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tab, setTab] = useState<"leads" | "perfil">("leads");
  const [showAlerts, setShowAlerts] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  async function load() {
    const res = await fetch("/api/vendedor-leads", { cache: "no-store" });
    const json = await res.json();

    if (!res.ok) {
      setVendedor(null);
      setLeads([]);
      setAlerts([]);
      return;
    }

    setVendedor(json.vendedor ?? null);
    setLeads(json.leads ?? []);
    setAlerts(json.alerts ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const unread = alerts.filter((a) => !a.read && a.estado !== "leida" && a.status !== "leida").length;

  const stats = useMemo(() => ({
    nuevos: leads.filter((l) => (l.estado || l.status) === "nuevo").length,
    seguimiento: leads.filter((l) => (l.estado || l.status) === "seguimiento" || (l.estado || l.status) === "en_seguimiento").length,
    vendidos: leads.filter((l) => (l.estado || l.status) === "vendido").length,
    total: leads.length,
  }), [leads]);

  async function saveLead() {
    if (!editingLead) return;

    const res = await fetch("/api/vendedor-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingLead),
    });

    const json = await res.json();
    if (!res.ok) return alert(json.message || "No se pudo guardar seguimiento.");

    setEditingLead(null);
    load();
  }

  async function markAlert(id: number) {
    await fetch("/api/vendedor-alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <main className="min-h-screen bg-[#05070d] p-4 text-white md:p-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">GoMotorsCo Comercial</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">Panel vendedor</h1>
              <p className="mt-2 text-slate-400">{vendedor?.nombre || "Vendedor"} · Leads, alertas y seguimiento.</p>
            </div>

            <button
              onClick={() => setShowAlerts(true)}
              className="relative rounded-full border border-white/10 bg-white/10 px-5 py-4 text-2xl"
              title="Alertas"
            >
              🔔
              {unread > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-black">
                  {unread}
                </span>
              ) : null}
            </button>
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-4">
          <Card title="Leads asignados" value={stats.total} />
          <Card title="Nuevos" value={stats.nuevos} />
          <Card title="Seguimiento" value={stats.seguimiento} />
          <Card title="Vendidos" value={stats.vendidos} />
        </div>

        <nav className="flex gap-3 overflow-x-auto rounded-[24px] border border-white/10 bg-[#080d18] p-3">
          <button onClick={() => setTab("leads")} className={`rounded-2xl px-5 py-3 font-black ${tab === "leads" ? "bg-blue-600" : "bg-white/10"}`}>
            Leads
          </button>
          <button onClick={() => setTab("perfil")} className={`rounded-2xl px-5 py-3 font-black ${tab === "perfil" ? "bg-blue-600" : "bg-white/10"}`}>
            Perfil
          </button>
        </nav>

        {tab === "perfil" ? (
          <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <h2 className="text-2xl font-black">Perfil</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
              <img
                src={vendedor?.foto_url || "/logo-gomotorsco.png"}
                className="h-28 w-28 rounded-full border border-white/10 bg-white object-cover"
              />
              <div className="grid gap-2">
                <p className="text-3xl font-black">{vendedor?.nombre || "Vendedor"}</p>
                <p className="text-slate-400">{vendedor?.email || "Sin email"}</p>
                <p className="text-slate-400">WhatsApp: {vendedor?.whatsapp || "—"}</p>
                <p className="text-slate-400">Zona: {vendedor?.zona || "—"}</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <h2 className="text-2xl font-black">Mis leads</h2>

            <div className="mt-5 grid gap-4">
              {leads.length === 0 ? (
                <p className="text-slate-400">No tenés leads asignados.</p>
              ) : (
                leads.map((lead) => (
                  <article key={lead.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                          {lead.estado || lead.status || "nuevo"}
                        </p>
                        <h3 className="mt-2 text-xl font-black">{lead.nombre}</h3>
                        <p className="mt-1 text-sm text-slate-400">WhatsApp: {lead.whatsapp || lead.telefono || "—"} · Ciudad: {lead.ciudad || "—"}</p>
                        <p className="mt-1 text-sm text-slate-400">Vehículo: {lead.vehiculo || lead.vehiculo_interes || lead.vehicle_name || "—"}</p>
                        <p className="mt-1 text-sm text-slate-400">Cuota: {lead.cuota_mensual || "—"} · Inicial: {lead.cuota_inicial || "—"}</p>
                        {lead.notas ? <p className="mt-3 rounded-xl bg-black/30 p-3 text-sm text-slate-300">{lead.notas}</p> : null}
                      </div>

                      <div className="flex flex-wrap gap-2 lg:flex-col">
                        <button onClick={() => setEditingLead(lead)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black">
                          Gestionar
                        </button>
                        <a href={`https://wa.me/${lead.whatsapp || lead.telefono || ""}`} target="_blank" className="rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-black">
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
      </section>

      {showAlerts ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">Alertas</h2>
              <button onClick={() => setShowAlerts(false)} className="rounded-xl bg-white/10 px-4 py-2 font-black">Cerrar</button>
            </div>

            <div className="mt-5 space-y-3">
              {alerts.length === 0 ? (
                <p className="text-slate-400">No tenés alertas.</p>
              ) : (
                alerts.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="font-black">{a.titulo || a.title || "Alerta"}</p>
                    <p className="mt-1 text-sm text-slate-400">{a.mensaje || a.message}</p>
                    <button onClick={() => markAlert(a.id)} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black">
                      Marcar leída
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {editingLead ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <h2 className="text-2xl font-black">Gestionar lead</h2>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-bold">
                Estado
                <select
                  value={editingLead.estado || "nuevo"}
                  onChange={(e) => setEditingLead({ ...editingLead, estado: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
                >
                  {estados.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Fecha de seguimiento
                <input
                  type="datetime-local"
                  value={editingLead.seguimiento_fecha ? String(editingLead.seguimiento_fecha).slice(0, 16) : ""}
                  onChange={(e) => setEditingLead({ ...editingLead, seguimiento_fecha: e.target.value, estado: "seguimiento" })}
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Notas
                <textarea
                  rows={5}
                  value={editingLead.notas || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, notas: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={saveLead} className="rounded-2xl bg-emerald-600 px-6 py-3 font-black">Guardar seguimiento</button>
              <button onClick={() => setEditingLead(null)} className="rounded-2xl bg-white/10 px-6 py-3 font-black">Cerrar</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#080d18] p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}
