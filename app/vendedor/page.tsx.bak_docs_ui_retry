
"use client";

import TechnicalSheetsPanel from "@/components/vendedor/TechnicalSheetsPanel";

import TrainingPanel from "@/components/vendedor/TrainingPanel";

import { useEffect, useMemo, useState } from "react";
import ProfilePanel from "@/components/vendedor/ProfilePanel";

type Lead = any;

type Alert = any;

type Vendedor = any;

const estados = ["nuevo", "contactado", "en_seguimiento", "documentos_enviados", "documentos_aprobados", "visita_agendada", "vendido", "perdido", "eliminado"];

const prioridades = ["baja", "normal", "alta", "caliente"];

type Tab = "dashboard" | "leads" | "eliminados" | "seguimientos" | "fichas" | "capacitacion" | "alertas" | "perfil";

const menu: { key: Tab; label: string; icon: string }[] = [

  { key: "dashboard", label: "Dashboard", icon: "📊" },

  { key: "leads", label: "Leads", icon: "👥" },

  { key: "seguimientos", label: "Seguimientos", icon: "📅" },

  { key: "alertas", label: "Alertas", icon: "🔔" },

  { key: "fichas", label: "Fichas técnicas", icon: "📄" },

  { key: "capacitacion", label: "Capacitación", icon: "🎓" },

  { key: "eliminados", label: "Eliminados", icon: "🗑️" },

  { key: "perfil", label: "Perfil", icon: "👤" },

];

function isPast(date?: string | null) {

  if (!date) return false;

  return new Date(date).getTime() < Date.now();

}

function fmt(date?: string | null) {

  if (!date) return "—";

  return new Date(date).toLocaleString("es-CO", {

    dateStyle: "medium",

    timeStyle: "short",

  });

}

export default function VendedorPage() {

  const [vendedor, setVendedor] = useState<Vendedor | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);

  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [tab, setTab] = useState<Tab>("dashboard");

  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [newLead, setNewLead] = useState<any | null>(null);

  const [inteligencia, setInteligencia] = useState<string[]>([]);

  const [leadFilter, setLeadFilter] = useState<string>("all");

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

    setInteligencia(json.inteligencia ?? []);

  }

  useEffect(() => {

    load();

  }, []);

  useEffect(() => {

    const handler = (e: any) => {

      setLeadFilter(e.detail || "all");

    };

    window.addEventListener("vendor-lead-filter", handler);

    return () => {

      window.removeEventListener("vendor-lead-filter", handler);

    };

  }, []);

  const activeLeads = leads.filter((l) => !["eliminado", "perdido"].includes(l.estado || l.status));

  const deletedLeads = leads.filter((l) => ["eliminado", "perdido"].includes(l.estado || l.status));

  const followups = activeLeads.filter((l) => l.seguimiento_fecha || l.next_follow_up_at || l.llamada_fecha || ["seguimiento", "seguimiento_atrasado"].includes(l.estado || l.status));

  const unread = alerts.filter((a) => a.estado !== "leida" && a.status !== "leida").length;

  const atrasados = activeLeads.filter((l) => false || isPast(l.seguimiento_fecha || l.next_follow_up_at || l.llamada_fecha)).length;

  const filteredLeads = useMemo(() => {

    switch (leadFilter) {

      case "nuevo":
        return activeLeads.filter(
          (l) => (l.estado || l.status) === "nuevo"
        );

      case "vendido":
        return activeLeads.filter(
          (l) => (l.estado || l.status) === "vendido"
        );

      case "atrasados":
        return activeLeads.filter(
          (l) =>
            false ||
            isPast(
              l.seguimiento_fecha ||
              l.next_follow_up_at ||
              l.llamada_fecha
            )
        );

      case "seguimiento":
        return followups;

      default:
        return activeLeads;

    }

  }, [leadFilter, activeLeads, followups]);

  const stats = useMemo(() => ({

    total: activeLeads.length,

    nuevos: activeLeads.filter((l) => (l.estado || l.status) === "nuevo").length,

    seguimiento: followups.length,

    atrasados,

    vendidos: activeLeads.filter((l) => (l.estado || l.status) === "vendido").length,

    alertas: unread,

  }), [activeLeads, followups, atrasados, unread]);

  async function saveLead() {

    if (!editingLead) return;

    const res = await fetch("/api/vendedor-leads", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(editingLead),

    });

    const json = await res.json();

    if (!res.ok) return alert(json.message || "No se pudo guardar.");

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

    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#12213c_0,#05070d_36%,#02040a_100%)] text-white">

      <SellerSidebar vendedor={vendedor} tab={tab} setTab={setTab} unread={unread} stats={stats} />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030509]/95 px-3 py-3 backdrop-blur lg:hidden">

        <div className="mb-3 flex items-center justify-between">

          <div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-blue-300">GoMotorsCo</p>

            <h1 className="text-lg font-black">Panel vendedor</h1>

          </div>

          <button

            onClick={async () => {

              await fetch("/api/vendedor-logout", { method: "PATCH" });

              window.location.href = "/vendedor/login";

            }}

            className="rounded-full bg-red-500/15 px-3 py-2 text-[11px] font-black text-red-300"

          >

            Salir

              </button>

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

      <section className="min-h-screen lg:pl-80">

        <div className="mx-auto w-full max-w-[1650px] px-3 py-4 sm:px-5 lg:px-8">

          <TopHeader vendedor={vendedor} unread={unread} setTab={setTab} setNewLead={setNewLead} />

          {inteligencia.length ? (

            <section className="mb-6 rounded-[32px] border border-cyan-300/20 bg-cyan-300/[0.06] p-6 shadow-[0_25px_80px_rgba(34,211,238,.10)]">

              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Asistente comercial</p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">

                {inteligencia.slice(0, 4).map((msg, i) => (

                  <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-bold text-slate-200">

                    {msg}

                  </div>

                ))}

              </div>

            </section>

          ) : null}

          {tab === "dashboard" ? <Dashboard stats={stats} leads={activeLeads} alerts={alerts} setTab={setTab} setEditingLead={setEditingLead} /> : null}

          {tab === "leads" ? <LeadsView leads={filteredLeads} title="Leads activos" empty="No tenés leads activos." setEditingLead={setEditingLead} /> : null}

          {tab === "eliminados" ? <LeadsView leads={deletedLeads} title="Leads eliminados / perdidos" empty="No hay leads eliminados." setEditingLead={setEditingLead} /> : null}

          {tab === "seguimientos" ? <LeadsView leads={followups} title="Seguimientos y llamadas" empty="No tenés seguimientos pendientes." setEditingLead={setEditingLead} /> : null}

          {tab === "alertas" ? <AlertsView alerts={alerts} markAlert={markAlert} /> : null}

          {tab === "perfil" ? <ProfileView vendedor={vendedor} /> : null}

          {tab === "fichas" ? <TechnicalSheetsPanel /> : null}

          {tab === "capacitacion" ? <TrainingPanel /> : null}

        </div>

      </section>

      {newLead ? <NewLeadModal newLead={newLead} setNewLead={setNewLead} createLead={createLead} /> : null}

      {editingLead ? <LeadModal editingLead={editingLead} setEditingLead={setEditingLead} saveLead={saveLead} /> : null}

    </main>

  );

}

function SellerSidebar({ vendedor, tab, setTab, unread, stats }: any) {

  return (

    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-80 overflow-y-auto border-r border-white/10 bg-[#050914]/90 p-5 shadow-[0_0_90px_rgba(37,99,235,.14)] backdrop-blur-2xl lg:block">

      <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">

        <div className="flex items-center gap-4">

          <img

            src={vendedor?.foto_url || "/logo-gomotorsco.png"}

            className="h-16 w-16 rounded-2xl border border-white/10 bg-white object-cover"

          />

          <div>

            <p className="text-xs uppercase tracking-[0.28em] text-blue-300">GoMotorsCo</p>

            <h1 className="mt-1 text-xl font-black">{vendedor?.nombre || "Vendedor"}</h1>

            <p className="mt-1 flex items-center gap-2 text-xs font-bold text-emerald-300">

              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.9)]" />

              En línea

            </p>

          </div>

        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">

          <MiniStat label="Leads" value={stats.total} />

          <MiniStat label="Alertas" value={stats.alertas} />

          <MiniStat label="Atrasos" value={stats.atrasados} danger />

        </div>

      </div>

      <nav className="mt-5 space-y-1 pb-24">

        {menu.map((item) => (

          <button

            key={item.key}

            onClick={() => setTab(item.key)}

            className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all duration-300 ${

              tab === item.key

                ? "border-blue-400/40 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_18px_60px_rgba(37,99,235,.30)]"

                : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"

            }`}

          >

            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">{item.icon}</span>

            <span>{item.label}</span>

            {item.key === "alertas" && unread > 0 ? (

              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">{unread}</span>

            ) : null}

            </button>

        ))}

      </nav>

      <button

        onClick={async () => {

          await fetch("/api/vendedor-logout", { method: "PATCH" });

          window.location.href = "/vendedor/login";

        }}

        className="mt-6 flex w-full items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-500 hover:text-white"

      >

        Cerrar sesión

        </button>

    </aside>

  );

}

function MiniStat({ label, value, danger }: any) {

  return (

    <div className={`rounded-2xl border p-3 text-center ${danger ? "border-red-400/20 bg-red-500/10" : "border-white/10 bg-black/20"}`}>

      <p className="text-lg font-black">{value}</p>

      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>

    </div>

  );

}

function TopHeader({ vendedor, unread, setTab, setNewLead }: any) {

  return (

    <section className="mb-6 rounded-[34px] border border-white/10 bg-[#080d18]/90 p-5 shadow-[0_24px_90px_rgba(0,0,0,.28)] backdrop-blur-xl">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">

            CRM comercial

          </p>

          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] md:text-4xl">

            Bienvenido, {vendedor?.nombre || "vendedor"}

          </h2>

          <p className="mt-2 text-sm text-slate-400">

            Seguimientos, llamadas, visitas y actividad comercial en un solo lugar.

          </p>

        </div>

        <div className="flex flex-wrap gap-2">

          <button

            onClick={() => setTab("alertas")}

            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black"

          >

            🔔 Alertas {unread > 0 ? `(${unread})` : ""}

          </button>

          <button

            onClick={() =>

              setNewLead({

                nombre: "",

                whatsapp: "",

                ciudad: "",

                vehiculo_interes: "",

                cuota_mensual: "",

              })

            }

            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black"

          >

            + Nuevo lead

          </button>

          <button

            onClick={() => setTab("seguimientos")}

            className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black"

          >

            Seguimientos

          </button>

        </div>

      </div>

    </section>

  );

}
function Dashboard({ stats, leads, alerts, setTab, setEditingLead }: any) {

  const openLeads = (filter?: string) => {
    window.dispatchEvent(new CustomEvent("vendor-lead-filter", { detail: filter || "all" }));
    setTab("leads");
  };

  const openFollowups = () => {
    window.dispatchEvent(new CustomEvent("vendor-lead-filter", { detail: "seguimiento" }));
    setTab("seguimientos");
  };

  const openAlerts = () => setTab("alertas");

  const priority = [...leads].sort((a: any, b: any) => {

    const av = a.estadofalse ? 0 : a.prioridad === "caliente" ? 1 : 2;

    const bv = b.estadofalse ? 0 : b.prioridad === "caliente" ? 1 : 2;

    return av - bv;

  });

  return (

    <div className="space-y-6">

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">

        <Card title="Leads activos" value={stats.total} onClick={() => openLeads("all")} />

        <Card title="Nuevos" value={stats.nuevos} onClick={() => openLeads("nuevo")} />

        <Card title="Seguimiento" value={stats.seguimiento} onClick={openFollowups} />

        <Card title="Atrasados" value={stats.atrasados} danger onClick={() => openLeads("atrasados")} />

        <Card title="Vendidos" value={stats.vendidos} onClick={() => openLeads("vendido")} />

        <Card title="Alertas" value={stats.alertas} onClick={openAlerts} />

      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">

        <section className="rounded-[30px] border border-white/10 bg-[#080d18]/90 p-5">

          <div className="flex items-center justify-between">

            <h3 className="text-xl font-black">Prioridad comercial</h3>

            <button onClick={() => setTab("leads")} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black">Ver todos</button>

          </div>

          <div className="mt-4 grid gap-3">

            {priority.slice(0, 6).map((lead: any) => (

              <LeadRow key={lead.id} lead={lead} setEditingLead={setEditingLead} />

            ))}

            {!priority.length ? <p className="text-sm text-slate-400">No hay leads asignados.</p> : null}

          </div>

        </section>

        <section className="rounded-[30px] border border-white/10 bg-[#080d18]/90 p-5">

          <h3 className="text-xl font-black">Últimas alertas</h3>

          <div className="mt-4 space-y-3">

            {alerts.slice(0, 5).map((a: any) => (

              <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">

                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">{a.tipo || "info"}</p>

                <p className="mt-1 font-black">{a.titulo || "Alerta"}</p>

                <p className="mt-1 text-sm text-slate-400">{a.mensaje}</p>

              </div>

            ))}

            {!alerts.length ? <p className="text-sm text-slate-400">Sin alertas.</p> : null}

          </div>

        </section>

      </div>

    </div>

  );

}

function LeadsView({ leads, title, empty, setEditingLead }: any) {

  return (

    <section className="rounded-[30px] border border-white/10 bg-[#080d18]/90 p-5">

      <h2 className="text-2xl font-black">{title}</h2>

      <div className="mt-5 grid gap-3">

        {leads.map((lead: any) => (

          <LeadRow key={lead.id} lead={lead} setEditingLead={setEditingLead} />

        ))}

        {!leads.length ? <p className="text-sm text-slate-400">{empty}</p> : null}

      </div>

    </section>

  );

}

function LeadRow({ lead, setEditingLead }: any) {

  const phone = lead.whatsapp || lead.telefono || lead.telefono_numero || "";

  const followDate = lead.llamada_fecha || lead.seguimiento_fecha || lead.next_follow_up_at;

  const overdue = isPast(followDate) && !["vendido", "perdido", "eliminado"].includes(lead.estado || lead.status);

  return (

    <article className={`rounded-3xl border p-4 transition hover:bg-white/[0.055] ${overdue ? "border-red-400/30 bg-red-500/10" : "border-white/10 bg-white/[0.035]"}`}>

      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">

        <div>

          <div className="flex flex-wrap items-center gap-2">

            <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${overdue ? "bg-red-500 text-white" : "bg-blue-500/15 text-blue-200"}`}>

              {overdue ? "atrasado" : lead.estado || lead.status || "nuevo"}

            </span>

            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-300">

              {lead.prioridad || "normal"}

            </span>

            {followDate ? <span className="text-xs font-bold text-slate-400">Próximo: {fmt(followDate)}</span> : null}

          </div>

          <h3 className="mt-3 text-xl font-black">{lead.nombre || "Lead sin nombre"}</h3>

          <p className="mt-1 text-sm text-slate-400">

            {lead.vehiculo || lead.vehiculo_interes || "Vehículo sin definir"} · {lead.ciudad || "Sin ciudad"}

          </p>

          <p className="mt-1 text-sm text-slate-500">

            WhatsApp: {phone || "—"} · Cédula: {lead.cedula || "—"}

          </p>

        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">

          <a href={phone ? `tel:${phone}` : "#"} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black">Llamar</a>

          <a href={phone ? `https://wa.me/${phone}` : "#"} target="_blank" className="rounded-xl bg-green-600 px-4 py-2 text-sm font-black">WhatsApp</a>

          <button onClick={() => setEditingLead(lead)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black">Gestionar</button>

        </div>

      </div>

    </article>

  );

}

function AlertsView({ alerts, markAlert }: any) {

  return (

    <section className="rounded-[30px] border border-white/10 bg-[#080d18]/90 p-5">

      <h2 className="text-2xl font-black">Alertas</h2>

      <div className="mt-5 grid gap-3">

        {alerts.map((a: any) => (

          <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">

            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">{a.tipo || "info"}</p>

            <h3 className="mt-2 font-black">{a.titulo || "Alerta"}</h3>

            <p className="mt-1 text-sm text-slate-400">{a.mensaje}</p>

            {a.scheduled_at ? <p className="mt-2 text-xs text-cyan-300">Programada: {fmt(a.scheduled_at)}</p> : null}

            <button onClick={() => markAlert(a.id)} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black">Marcar leída</button>

          </div>

        ))}

        {!alerts.length ? <p className="text-sm text-slate-400">Sin alertas.</p> : null}

      </div>

    </section>

  );

}

function ProfileView({ vendedor }: any) {
  return <ProfilePanel vendedor={vendedor} />;
}

const commercialSteps = [
  { key: "contacto", label: "Contacto" },
  { key: "seguimiento", label: "Seguimiento" },
  { key: "documentos", label: "Documentos" },
  { key: "aprobacion", label: "Aprobación" },
  { key: "visita", label: "Visita" },
  { key: "venta", label: "Venta" },
];

const estadoLabels: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_seguimiento: "En seguimiento",
  documentos_enviados: "Documentos enviados",
  documentos_aprobados: "Documentos aprobados",
  visita_agendada: "Visita agendada",
  vendido: "Vendido",
  perdido: "Perdido",
  eliminado: "Eliminado",
};

function getStepState(lead: any, step: string) {
  const estado = lead.estado || lead.status || "nuevo";
  const followDate = lead.next_follow_up_at || lead.seguimiento_fecha || lead.llamada_fecha;
  const hasFollow = Boolean(followDate);
  const hasCedula = Boolean(lead.cedula || lead.cedula_frontal_url);
  const hasVisit = Boolean(lead.visita_fecha);

  if (estado === "perdido" || estado === "eliminado") return "disabled";

  if (step === "contacto") {
    if (["contactado", "en_seguimiento", "documentos_enviados", "documentos_aprobados", "visita_agendada", "vendido"].includes(estado)) return "done";
    return "pending";
  }

  if (step === "seguimiento") {
    if (["documentos_enviados", "documentos_aprobados", "visita_agendada", "vendido"].includes(estado)) return "done";
    if (hasFollow && isPast(followDate)) return "danger";
    if (hasFollow || ["contactado", "en_seguimiento"].includes(estado)) return "pending";
    return "idle";
  }

  if (step === "documentos") {
    if (["documentos_enviados", "documentos_aprobados", "visita_agendada", "vendido"].includes(estado)) return "done";
    if (hasCedula || ["contactado", "en_seguimiento"].includes(estado)) return "pending";
    return "idle";
  }

  if (step === "aprobacion") {
    if (["documentos_aprobados", "visita_agendada", "vendido"].includes(estado)) return "done";
    if (estado === "documentos_enviados") return "pending";
    return "idle";
  }

  if (step === "visita") {
    if (["visita_agendada", "vendido"].includes(estado) || hasVisit) return "done";
    if (estado === "documentos_aprobados") return "pending";
    return "idle";
  }

  if (step === "venta") {
    if (estado === "vendido") return "done";
    if (["visita_agendada", "documentos_aprobados"].includes(estado)) return "pending";
    return "idle";
  }

  return "idle";
}

function StepSemaphore({ lead }: any) {
  const styles: Record<string, string> = {
    done: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    pending: "border-yellow-400/30 bg-yellow-500/10 text-yellow-200",
    danger: "border-red-400/30 bg-red-500/10 text-red-200",
    idle: "border-white/10 bg-white/[0.03] text-slate-400",
    disabled: "border-slate-600/20 bg-slate-700/10 text-slate-500",
  };

  const icons: Record<string, string> = {
    done: "🟢",
    pending: "🟡",
    danger: "🔴",
    idle: "⚪",
    disabled: "⚫",
  };

  return (
    <div className="grid gap-2 md:grid-cols-6">
      {commercialSteps.map((step) => {
        const state = getStepState(lead, step.key);
        return (
          <div key={step.key} className={"rounded-2xl border p-3 text-center " + styles[state]}>
            <p className="text-lg">{icons[state]}</p>
            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em]">{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function LeadModal({ editingLead, setEditingLead, saveLead }: any) {
  const estado = editingLead.estado || "nuevo";
  const showFollowDate = estado === "en_seguimiento";
  const showVisitDate = estado === "visita_agendada";
  const showDocumentsInfo = estado === "documentos_enviados" || estado === "documentos_aprobados";
  const showApprovalInfo = estado === "documentos_aprobados";
  const showSaleInfo = estado === "vendido";
  const showLostInfo = estado === "perdido";

  function updateEstado(v: string) {
    const patch: any = { ...editingLead, estado: v, funnel_stage: v };

    if (v === "contactado" && !patch.llamada_estado) patch.llamada_estado = "contesto";
    if (v === "en_seguimiento") patch.llamada_estado = patch.llamada_estado || "interesado";
    if (v === "documentos_enviados") patch.seguimiento = patch.seguimiento || "Documentos enviados por la vendedora.";
    if (v === "documentos_aprobados") patch.seguimiento = patch.seguimiento || "Documentos aprobados. Cliente listo para visita o cierre.";
    if (v === "visita_agendada") patch.llamada_estado = "visita_agendada";

    setEditingLead(patch);
  }

  function guardedSave() {
    if (estado === "en_seguimiento" && !(editingLead.next_follow_up_at || editingLead.seguimiento_fecha || editingLead.llamada_fecha)) {
      alert("Para dejar el lead en seguimiento, elegí la fecha del próximo contacto.");
      return;
    }

    if (estado === "visita_agendada" && !editingLead.visita_fecha) {
      alert("Para dejar visita agendada, elegí la fecha y hora de visita.");
      return;
    }

    saveLead();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[30px] border border-white/10 bg-[#080d18] p-6 shadow-[0_30px_120px_rgba(0,0,0,.45)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-300">Gestión comercial</p>
            <h2 className="mt-1 text-2xl font-black">{editingLead.nombre || "Lead sin nombre"}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {editingLead.vehiculo || editingLead.vehiculo_interes || "Vehículo sin definir"} · {editingLead.ciudad || "Sin ciudad"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estado actual</p>
            <p className="mt-1 font-black text-white">{estadoLabels[estado] || estado}</p>
          </div>
        </div>

        <div className="mt-5">
          <StepSemaphore lead={editingLead} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <SelectInput
            label="¿Qué pasó con el cliente?"
            value={estado}
            options={estados.filter((e) => e !== "eliminado")}
            onChange={updateEstado}
          />

          <InputModal
            label="Cédula cliente"
            value={editingLead.cedula || ""}
            onChange={(v: string) => setEditingLead({ ...editingLead, cedula: v })}
          />

          {showFollowDate ? (
            <InputModal
              label="Próximo contacto"
              type="datetime-local"
              value={(editingLead.next_follow_up_at || editingLead.seguimiento_fecha || editingLead.llamada_fecha) ? String(editingLead.next_follow_up_at || editingLead.seguimiento_fecha || editingLead.llamada_fecha).slice(0, 16) : ""}
              onChange={(v: string) =>
                setEditingLead({
                  ...editingLead,
                  estado: "en_seguimiento",
                  seguimiento_fecha: v,
                  next_follow_up_at: v,
                })
              }
            />
          ) : null}

          {showVisitDate ? (
            <InputModal
              label="Fecha y hora de visita"
              type="datetime-local"
              value={editingLead.visita_fecha ? String(editingLead.visita_fecha).slice(0, 16) : ""}
              onChange={(v: string) => setEditingLead({ ...editingLead, estado: "visita_agendada", visita_fecha: v })}
            />
          ) : null}

          {showDocumentsInfo ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 md:col-span-2">
              <p className="font-black text-cyan-100">Documentos del cliente</p>
              <p className="mt-1 text-sm text-cyan-100/80">
                Moto: cédula frontal. Auto: cédula frontal + PDF soporte. La carga real de archivos queda para la etapa de documentos.
              </p>
            </div>
          ) : null}

          {showApprovalInfo ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 md:col-span-2">
              <p className="font-black text-emerald-100">Documentos aprobados</p>
              <p className="mt-1 text-sm text-emerald-100/80">
                Este lead ya cuenta como oportunidad fuerte para visita, cierre y control de comisión.
              </p>
            </div>
          ) : null}

          {showSaleInfo ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 md:col-span-2">
              <p className="font-black text-emerald-100">Venta registrada</p>
              <p className="mt-1 text-sm text-emerald-100/80">
                Esta venta queda visible para vendedor, supervisor y admin en métricas comerciales.
              </p>
            </div>
          ) : null}

          {showLostInfo ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 md:col-span-2">
              <p className="font-black text-red-100">Lead perdido</p>
              <p className="mt-1 text-sm text-red-100/80">
                Dejá en notas el motivo para revisar objeciones y oportunidades de recuperación.
              </p>
            </div>
          ) : null}

          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            Notas comerciales
            <textarea
              rows={5}
              value={editingLead.resumen_llamada || editingLead.notas || ""}
              onChange={(e) => setEditingLead({ ...editingLead, resumen_llamada: e.target.value, notas: e.target.value })}
              className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
              placeholder="Ej: cliente interesado, pidió financiación, documentos pendientes, objeciones, próxima acción..."
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={guardedSave} className="rounded-2xl bg-emerald-600 px-6 py-3 font-black">Guardar actividad</button>
          <button onClick={() => setEditingLead(null)} className="rounded-2xl bg-white/10 px-6 py-3 font-black">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function NewLeadModal({ newLead, setNewLead, createLead }: any) {

  return (

    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">

      <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#080d18] p-6 shadow-[0_30px_120px_rgba(0,0,0,.45)]">

        <h2 className="text-2xl font-black">Nuevo lead propio</h2>

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

  );

}

function Card({ title, value, danger, onClick }: any) {

  return (

    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-[26px] border p-5 transition hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-blue-500/10 ${
        danger
          ? "border-red-400/20 bg-red-500/10"
          : "border-white/10 bg-[#080d18]/90"
      }`}
    >

      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-2 text-4xl font-black">{value}</p>

    </button>

  );

}
function InputModal({ label, value, onChange, type = "text" }: any) {

  return (

    <label className="grid gap-2 text-sm font-bold">

      {label}

      <input value={value || ""} type={type} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3" />

    </label>

  );

}

function SelectInput({ label, value, options, onChange }: any) {

  return (

    <label className="grid gap-2 text-sm font-bold">

      {label}

      <select value={value || ""} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3">

        {options.map((op: string) => <option key={op} value={op}>{op || "Sin seleccionar"}</option>)}

      </select>

    </label>

  );

}

