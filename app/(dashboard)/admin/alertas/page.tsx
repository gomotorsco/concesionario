"use client";

import { useEffect, useState } from "react";

export default function AlertasAdminPage() {
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [form, setForm] = useState({
    vendedor_id: "",
    tipo: "info",
    titulo: "",
    mensaje: "",
  });
  const [sending, setSending] = useState(false);

  async function load() {
    const vendedoresRes = await fetch("/api/vendedores", { cache: "no-store" });
    const vendedoresJson = await vendedoresRes.json();

    const alertsRes = await fetch("/api/admin/seller-alerts", { cache: "no-store" });
    const alertsJson = await alertsRes.json();

    setVendedores(vendedoresJson.vendedores ?? []);
    setAlerts(alertsJson.alerts ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function sendAlert() {
    if (!form.vendedor_id) return alert("Seleccione vendedor.");
    if (!form.mensaje.trim()) return alert("Escriba el mensaje.");

    setSending(true);

    try {
      const res = await fetch("/api/admin/seller-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.message || "No se pudo enviar la alerta.");
        return;
      }

      alert("Alerta enviada.");
      setForm({ vendedor_id: "", tipo: "info", titulo: "", mensaje: "" });
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05070d] p-4 text-white md:p-8">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">
            GoMotorsCo
          </p>
          <h1 className="mt-2 text-3xl font-black">Alertas internas</h1>
          <p className="mt-2 text-slate-400">
            Enviá mensajes directos a la campanita del vendedor.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-bold">
              Vendedor
              <select
                value={form.vendedor_id}
                onChange={(e) => setForm({ ...form, vendedor_id: e.target.value })}
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
              >
                <option value="">Seleccionar vendedor</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nombre} — {v.email}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Prioridad
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
              >
                <option value="info">Info</option>
                <option value="advertencia">Advertencia</option>
                <option value="urgente">Urgente</option>
              </select>
            </label>

            <Input label="Título" value={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} />

            <label className="grid gap-2 text-sm font-bold">
              Mensaje
              <textarea
                rows={6}
                value={form.mensaje}
                onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
              />
            </label>

            <button
              onClick={sendAlert}
              disabled={sending}
              className="rounded-2xl bg-blue-600 px-6 py-3 font-black disabled:opacity-60"
            >
              {sending ? "Enviando..." : "Enviar alerta"}
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
          <h2 className="text-2xl font-black">Historial</h2>

          <div className="mt-5 space-y-3">
            {alerts.length === 0 ? (
              <p className="text-slate-400">No hay alertas todavía.</p>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">
                    {a.tipo || "info"} · {a.estado || a.status || "pendiente"}
                  </p>
                  <h3 className="mt-2 font-black">{a.titulo || "Alerta"}</h3>
                  <p className="mt-1 text-sm text-slate-400">{a.mensaje}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
      />
    </label>
  );
}
