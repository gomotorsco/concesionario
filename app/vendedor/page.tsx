"use client";

import ProfilePanel from "@/components/vendedor/ProfilePanel";
import TechnicalSheetsPanel from "@/components/vendedor/TechnicalSheetsPanel";
import { useEffect, useMemo, useState } from "react";

type Lead = any;
type Alert = any;
type Vendedor = any;

const estados = ["nuevo", "contactado", "seguimiento", "aprobado", "vendido", "pausado", "perdido"];

type Tab = "dashboard" | "leads" | "eliminados" | "seguimientos" | "fichas" | "capacitacion" | "alertas" | "perfil";

const menu: { key: Tab; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "leads", label: "Leads", icon: "👥" },
  { key: "eliminados", label: "Eliminados", icon: "🗑️" },
  { key: "seguimientos", label: "Seguimientos", icon: "📅" },
  { key: "fichas", label: "Fichas técnicas", icon: "📄" },
  { key: "capacitacion", label: "Capacitación", icon: "🎓" },
  { key: "alertas", label: "Alertas", icon: "🔔" },
  { key: "perfil", label: "Perfil", icon: "👤" },
];

export default function VendedorPage() {
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState<any | null>(null);
  const [quote, setQuote] = useState<any>(null);

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

    try {
      const quoteRes = await fetch("/api/vendedor/quote", { cache: "no-store" });
      const quoteJson = await quoteRes.json();
      setQuote(quoteJson.quote ?? null);
    } catch {
      setQuote(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeLeads = leads.filter((l) => (l.estado || l.status) !== "eliminado");
  const deletedLeads = leads.filter((l) => (l.estado || l.status) === "eliminado" || (l.estado || l.status) === "perdido");
  const followups = activeLeads.filter((l) => l.seguimiento_fecha || l.seguimiento || (l.estado || l.status) === "seguimiento" || (l.estado || l.status) === "en_seguimiento");

  const unread = alerts.filter((a) => !a.read && a.estado !== "leida" && a.status !== "leida").length;

  const stats = useMemo(() => ({
    total: activeLeads.length,
    nuevos: activeLeads.filter((l) => (l.estado || l.status) === "nuevo").length,
    seguimiento: followups.length,
    vendidos: activeLeads.filter((l) => (l.estado || l.status) === "vendido").length,
    alertas: unread,
  }), [activeLeads, followups, unread]);

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

  async function createLead() {
    if (!newLead) return;

    const res = await fetch("/api/vendedor-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_lead", ...newLead }),
    });

    const json = await res.json();
    if (!res.ok) return alert(json.message || "No se pudo crear el lead.");

    setNewLead(null);
    load();
  }

  return (
    <main className="min-h-screen bg-[#05070d] text-white">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 overflow-y-auto border-r border-white/10 bg-[#030509] p-5 lg:block">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-blue-300">GoMotorsCo</p>
          <h1 className="mt-2 text-2xl font-black">Panel vendedor</h1>
          <p className="mt-2 text-xs text-slate-500">{vendedor?.nombre || "Comercial"}</p>
        </div>

        <nav className="space-y-1 pb-24">
          {menu.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                tab === item.key
                  ? "bg-blue-600 text-white shadow-[0_18px_50px_rgba(37,99,235,.28)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.key === "alertas" && unread > 0 ? (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">{unread}</span>
              ) : null}
            </button>
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030509]/95 px-3 py-3 backdrop-blur lg:hidden">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-blue-300">GoMotorsCo</p>
            <h1 className="text-lg font-black">Panel vendedor</h1>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-black">{vendedor?.nombre || "Vendedor"}</span>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1">
          {menu.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${
                tab === item.key ? "bg-blue-600 text-white" : "bg-white/10 text-white"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </header>

      <section className="min-h-screen lg:pl-72">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 lg:px-8">
          <TopHeader vendedor={vendedor} unread={unread} setTab={setTab} setNewLead={setNewLead} />

          {quote ? (
            <section className="mb-6 rounded-[32px] border border-white/10 bg-[#081120] p-6 shadow-[0_25px_80px_rgba(37,99,235,.18)]">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
                Mensaje comercial del día
              </p>
              <h3 className="mt-3 text-2xl font-black leading-tight text-white">
                {quote.text}
              </h3>
              <div className="mt-4 flex items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
                  {quote.type || "motivacion"}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  — {quote.author || "GoMotorsCo Sales System"}
                </span>
              </div>
            </section>
          ) : null}

          {tab === "dashboard" ? <Dashboard stats={stats} vendedor={vendedor} leads={activeLeads} alerts={alerts} setTab={setTab} /> : null}
          {tab === "leads" ? <LeadsView leads={activeLeads} title="Leads activos" empty="No tenés leads activos." setEditingLead={setEditingLead} /> : null}
          {tab === "eliminados" ? <LeadsView leads={deletedLeads} title="Leads eliminados / perdidos" empty="No hay leads eliminados." setEditingLead={setEditingLead} /> : null}
          {tab === "seguimientos" ? <LeadsView leads={followups} title="Seguimientos" empty="No tenés seguimientos pendientes." setEditingLead={setEditingLead} /> : null}
          {tab === "alertas" ? <AlertsView alerts={alerts} markAlert={markAlert} /> : null}
          {tab === "perfil" ? <ProfileView vendedor={vendedor} /> : null}
          {tab === "fichas" ? <TechnicalSheetsPanel /> : null}
          {tab === "capacitacion" ? <Placeholder title="Capacitación vendedor" text="Próxima etapa: videos de YouTube, mensajes del supervisor, scripts comerciales y material interno." /> : null}
        </div>
      </section>

      {newLead ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#080d18] p-6 shadow-[0_30px_120px_rgba(0,0,0,.45)]">
            <h2 className="text-2xl font-black">Nuevo lead propio</h2>
            <p className="mt-1 text-sm text-slate-400">Cargá clientes conseguidos por el vendedor.</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InputModal label="Nombre" value={newLead.nombre} onChange={(v: string) => setNewLead({ ...newLead, nombre: v })} />
              <InputModal label="WhatsApp" value={newLead.whatsapp} onChange={(v: string) => setNewLead({ ...newLead, whatsapp: v })} />
              <InputModal label="Ciudad" value={newLead.ciudad} onChange={(v: string) => setNewLead({ ...newLead, ciudad: v })} />
              <InputModal label="Vehículo interés" value={newLead.vehiculo_interes} onChange={(v: string) => setNewLead({ ...newLead, vehiculo_interes: v })} />
              <InputModal label="Cuota mensual deseada" value={newLead.cuota_mensual} onChange={(v: string) => setNewLead({ ...newLead, cuota_mensual: v })} />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={createLead} className="rounded-2xl bg-emerald-600 px-6 py-3 font-black">Crear lead</button>
              <button onClick={() => setNewLead(null)} className="rounded-2xl bg-white/10 px-6 py-3 font-black">Cerrar</button>
            </div>
          </div>
        </div>
      ) : null}

      {editingLead ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#080d18] p-6 shadow-[0_30px_120px_rgba(0,0,0,.45)]">
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

function TopHeader({ vendedor, unread, setTab, setNewLead }: any) {
  return (
    <section className="mb-6 rounded-[30px] border border-white/10 bg-[#080d18]/95 p-5 shadow-[0_24px_90px_rgba(0,0,0,.24)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">CRM comercial</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] md:text-4xl">
            Bienvenido, {vendedor?.nombre || "vendedor"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Gestioná leads, seguimientos, alertas y tu actividad comercial.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTab("alertas")} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black">
            🔔 Alertas {unread > 0 ? `(${unread})` : ""}
          </button>
          <button onClick={() => setNewLead({ nombre: "", whatsapp: "", ciudad: "", vehiculo_interes: "", cuota_mensual: "" })} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black">
            + Nuevo lead
          </button>
          <button onClick={() => setTab("perfil")} className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black">
            Ver perfil
          </button>
        </div>
      </div>
    </section>
  );
}

function Dashboard({ stats, vendedor, leads, alerts, setTab }: any) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card title="Leads activos" value={stats.total} />
        <Card title="Nuevos" value={stats.nuevos} />
        <Card title="Seguimiento" value={stats.seguimiento} />
        <Card title="Vendidos" value={stats.vendidos} />
        <Card title="Alertas" value={stats.alertas} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black">Prioridad comercial</h3>
            <button onClick={() => setTab("leads")} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black">Ver leads</button>
          </div>

          <div className="mt-4 space-y-3">
            {leads.slice(0, 5).map((lead: any) => (
              <div key={lead.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">{lead.estado || "nuevo"}</p>
                <p className="mt-1 font-black">{lead.nombre || "Lead sin nombre"}</p>
                <p className="text-sm text-slate-400">{lead.vehiculo || lead.vehiculo_interes || "Vehículo sin definir"}</p>
              </div>
            ))}
            {leads.length === 0 ? <p className="text-sm text-slate-400">No hay leads asignados.</p> : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-5">
          <h3 className="text-xl font-black">Actividad</h3>
          <div className="mt-4 space-y-3">
            <InfoLine label="Vendedor" value={vendedor?.nombre || "—"} />
            <InfoLine label="Email" value={vendedor?.email || "—"} />
            <InfoLine label="Último login" value={vendedor?.last_login ? new Date(vendedor.last_login).toLocaleString("es-CO") : "—"} />
            <InfoLine label="Alertas recientes" value={String(alerts.length || 0)} />
          </div>
        </section>
      </div>
    </div>
  );
}

function LeadsView({ leads, title, empty, setEditingLead }: any) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-5">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">Gestión comercial</p>
        <h2 className="mt-2 text-2xl font-black">{title}</h2>
      </div>

      <div className="grid gap-4">
        {leads.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-slate-400">{empty}</p>
        ) : (
          leads.map((lead: any) => (
            <article key={lead.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-500/40 hover:bg-white/[0.06]">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                    {lead.estado || lead.status || "nuevo"}
                  </p>
                  <h3 className="mt-2 text-xl font-black">{lead.nombre || "Lead sin nombre"}</h3>
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
  );
}

function AlertsView({ alerts, markAlert }: any) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-5">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">Centro comercial</p>
      <h2 className="mt-2 text-2xl font-black">Alertas</h2>

      <div className="mt-5 space-y-3">
        {alerts.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-slate-400">No tenés alertas.</p>
        ) : (
          alerts.map((a: any) => (
            <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-black">{a.titulo || a.title || "Alerta"}</p>
              <p className="mt-1 text-sm text-slate-400">{a.message || a.mensaje || "Sin mensaje"}</p>
              <button onClick={() => markAlert(a.id)} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black">
                Marcar leída
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ProfileView({ vendedor }: any) {
  return <ProfilePanel vendedor={vendedor} />;
}

function Placeholder({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">Próxima etapa</p>
      <h2 className="mt-2 text-2xl font-black">{title}</h2>
      <p className="mt-3 max-w-2xl text-slate-400">{text}</p>
    </section>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#080d18] p-5 shadow-[0_18px_60px_rgba(0,0,0,.18)]">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}

function InputModal({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white"
      />
    </label>
  );
}
