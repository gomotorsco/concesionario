"use client";

import { FormEvent, useEffect, useState } from "react";

type Vendedor = {
  id: string;
  nombre: string;
  email: string;
};

type Alert = {
  id: number;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  created_at: string;
  vendedores?: {
    nombre?: string;
    email?: string;
  };
};

export default function AdminAlertasPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [vendedorId, setVendedorId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("info");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [vendedoresRes, alertsRes] = await Promise.all([
      fetch("/api/vendedores", { cache: "no-store" }),
      fetch("/api/admin/seller-alerts", { cache: "no-store" }),
    ]);

    const vendedoresJson = await vendedoresRes.json();
    const alertsJson = await alertsRes.json();

    setVendedores(vendedoresJson.vendedores ?? []);
    setAlerts(alertsJson.alerts ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();

    if (!vendedorId || !title.trim() || !message.trim()) {
      alert("Completá vendedor, título y mensaje.");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/admin/seller-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendedor_id: vendedorId,
        title,
        message,
        priority,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      alert("No se pudo enviar la alerta.");
      return;
    }

    setTitle("");
    setMessage("");
    setPriority("info");
    await load();
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-100">
          Alertas internas
        </h1>
        <p className="text-xs text-slate-400">
          Envía mensajes directos a cada vendedor dentro del panel comercial.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
        >
          <h2 className="text-sm font-semibold text-slate-100">
            Enviar alerta
          </h2>

          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Vendedor
            </label>
            <select
              value={vendedorId}
              onChange={(e) => setVendedorId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Seleccionar vendedor</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre} — {v.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Prioridad
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
            >
              <option value="info">Info</option>
              <option value="warning">Advertencia</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
              placeholder="Ej: Revisar leads pendientes"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Mensaje
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[130px] w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
              placeholder="Mensaje para el vendedor..."
            />
          </div>

          <button
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Enviando..." : "Enviar alerta"}
          </button>
        </form>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">
            Últimas alertas enviadas
          </h2>

          {alerts.length === 0 ? (
            <p className="text-sm text-slate-400">No hay alertas todavía.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className="rounded-lg border border-slate-800 bg-black/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{a.title}</p>
                      <p className="text-xs text-slate-400">{a.message}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Para: {a.vendedores?.nombre ?? "Vendedor"} ·{" "}
                        {new Date(a.created_at).toLocaleString("es-CO")}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[10px] uppercase ${
                      a.priority === "urgent"
                        ? "border-red-500/40 bg-red-500/10 text-red-300"
                        : a.priority === "warning"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                        : "border-sky-500/40 bg-sky-500/10 text-sky-300"
                    }`}>
                      {a.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Estado: {a.read ? "Leída" : "No leída"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
