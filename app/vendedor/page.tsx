"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = any;
type Alert = any;
type Vendedor = any;

const estados = [
  "nuevo",
  "contactado",
  "seguimiento",
  "aprobado",
  "vendido",
  "pausado",
  "perdido",
];

export default function VendedorPage() {
  const [vendedorId, setVendedorId] = useState("");
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [profile, setProfile] = useState({ nombre: "", whatsapp: "", zona: "", foto_url: "" });

  async function load() {
    const p = await fetch(`/api/vendedor/profile?id=${vendedorId}`, { cache: "no-store" }).then((r) => r.json());
    const l = await fetch(`/api/vendedor/leads?vendedor_id=${vendedorId}`, { cache: "no-store" }).then((r) => r.json());
    const a = await fetch(`/api/vendedor/alerts?vendedor_id=${vendedorId}`, { cache: "no-store" }).then((r) => r.json());

    setVendedor(p.vendedor ?? null);
    setProfile({
      nombre: p.vendedor?.nombre ?? "",
      whatsapp: p.vendedor?.whatsapp ?? "",
      zona: p.vendedor?.zona ?? "",
      foto_url: p.vendedor?.foto_url ?? "",
    });
    setLeads(l.leads ?? []);
    setAlerts(a.alerts ?? []);
  }

useEffect(() => {
  async function init() {
    const stored = localStorage.getItem("vendedor_id");
    const res = await fetch("/api/vendedores", { cache: "no-store" });
    const json = await res.json();
    const list = json.vendedores ?? [];
    setVendedores(list);

    if (stored) {
      setVendedorId(stored);
    } else if (list[0]?.id) {
      setVendedorId(String(list[0].id));
    }
  }

  init();
}, []);

  useEffect(() => {
    if (!vendedorId) return;
    localStorage.setItem("vendedor_id", vendedorId);
    load();
  }, [vendedorId]);

  const stats = useMemo(() => {
    return {
      nuevos: leads.filter((x) => x.estado === "nuevo" || x.status === "nuevo").length,
      seguimiento: leads.filter((x) => x.estado === "seguimiento").length,
      vendidos: leads.filter((x) => x.estado === "vendido").length,
      alertas: alerts.filter((x) => x.estado !== "leida" && x.status !== "leida").length,
    };
  }, [leads, alerts]);

  async function uploadProfile(file?: File) {
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/vendedor/upload-profile", {
      method: "POST",
      body: data,
    });

    const json = await res.json();

    if (!res.ok) return alert(json.message || "No se pudo subir la foto.");

    setProfile((p) => ({ ...p, foto_url: json.url }));
  }

  async function saveProfile() {
    const res = await fetch("/api/vendedor/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: vendedorId, ...profile }),
    });

    if (!res.ok) return alert("No se pudo guardar perfil.");

    alert("Perfil guardado.");
    load();
  }

  async function saveLead() {
    if (!editingLead) return;

    const res = await fetch("/api/vendedor/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingLead),
    });

    const json = await res.json();

    if (!res.ok) return alert(json.message || "No se pudo actualizar lead.");

    setEditingLead(null);
    load();
  }

  async function markAlert(id: number) {
    await fetch("/api/vendedor/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    load();
  }

  return (
    <main className="min-h-screen bg-[#05070d] p-4 text-white md:p-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">
                GoMotorsCo Comercial
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">
                Panel vendedor
              </h1>
              <p className="mt-2 text-slate-400">
                Leads, alertas, seguimiento y agenda comercial.
              </p>
            </div>

            <label className="grid gap-2 text-sm">
              Vendedor
              <select
                value={vendedorId}
                onChange={(e) => setVendedorId(e.target.value)}
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white"
              >
                <option value="">Seleccionar vendedor</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nombre} — {v.email}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <Card title="Nuevos" value={stats.nuevos} />
          <Card title="Seguimiento" value={stats.seguimiento} />
          <Card title="Vendidos" value={stats.vendidos} />
          <Card title="Alertas" value={stats.alertas} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <h2 className="text-2xl font-black">Perfil</h2>

            <div className="mt-5 flex items-center gap-4">
              <img
                src={profile.foto_url || "/logo-gomotorsco.png"}
                className="h-24 w-24 rounded-full border border-white/10 object-cover bg-white"
              />

              <label className="cursor-pointer rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black">
                Subir foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadProfile(e.target.files?.[0])}
                />
              </label>
            </div>

            <div className="mt-5 grid gap-4">
              <Input label="Nombre" value={profile.nombre} onChange={(v) => setProfile({ ...profile, nombre: v })} />
              <Input label="WhatsApp" value={profile.whatsapp} onChange={(v) => setProfile({ ...profile, whatsapp: v })} />
              <Input label="Zona" value={profile.zona} onChange={(v) => setProfile({ ...profile, zona: v })} />

              <button onClick={saveProfile} className="rounded-2xl bg-emerald-600 px-6 py-3 font-black">
                Guardar perfil
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <h2 className="text-2xl font-black">Alertas</h2>

            <div className="mt-5 space-y-3">
              {alerts.length === 0 ? (
                <p className="text-slate-400">No tenés alertas.</p>
              ) : (
                alerts.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-black">{a.titulo || "Alerta"}</p>
                        <p className="mt-1 text-sm text-slate-400">{a.mensaje}</p>
                        {a.scheduled_at ? (
                          <p className="mt-2 text-xs text-blue-300">
                            Programada: {new Date(a.scheduled_at).toLocaleString("es-CO")}
                          </p>
                        ) : null}
                      </div>

                      <button
                        onClick={() => markAlert(a.id)}
                        className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black"
                      >
                        Marcar leída
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

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

                      <p className="mt-1 text-sm text-slate-400">
                        WhatsApp: {lead.whatsapp || lead.telefono} · Ciudad: {lead.ciudad || "—"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Vehículo: {lead.vehiculo || lead.vehiculo_interes || lead.vehicle_name || "—"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Cuota: {lead.cuota_mensual || "—"} · Inicial: {lead.cuota_inicial || "—"}
                      </p>

                      {lead.notas ? (
                        <p className="mt-3 rounded-xl bg-black/30 p-3 text-sm text-slate-300">{lead.notas}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:flex-col">
                      <button onClick={() => setEditingLead(lead)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black">
                        Gestionar
                      </button>

                      <a
                        href={`https://wa.me/${lead.whatsapp || lead.telefono}`}
                        target="_blank"
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-black"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </section>

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
                  {estados.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Fecha de seguimiento
                <input
                  type="datetime-local"
                  value={editingLead.seguimiento_fecha ? String(editingLead.seguimiento_fecha).slice(0, 16) : ""}
                  onChange={(e) => setEditingLead({ ...editingLead, seguimiento_fecha: e.target.value })}
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
              <button onClick={saveLead} className="rounded-2xl bg-emerald-600 px-6 py-3 font-black">
                Guardar seguimiento
              </button>

              <button onClick={() => setEditingLead(null)} className="rounded-2xl bg-white/10 px-6 py-3 font-black">
                Cerrar
              </button>
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

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none"
      />
    </label>
  );
}
