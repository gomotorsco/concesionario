"use client";

import { useEffect, useState } from "react";

type Alert = {
  id: number;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  created_at: string;
};

export default function VendedorAlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  async function load() {
    const r = await fetch("/api/vendedor-alerts", { cache: "no-store" });
    const j = await r.json();
    setAlerts(j.alerts ?? []);
  }

  async function markRead(id: number) {
    await fetch("/api/vendedor-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-2xl font-semibold">Mis alertas</h1>
      <p className="text-xs text-zinc-400">Mensajes internos y avisos comerciales.</p>

      <div className="mt-6 space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-zinc-500">No tenés alertas.</p>
        ) : (
          alerts.map((a) => (
            <div key={a.id} className={`rounded-xl border p-4 ${
              a.read ? "border-zinc-800 bg-zinc-950" : "border-amber-500/40 bg-amber-950/20"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-zinc-300">{a.message}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {new Date(a.created_at).toLocaleString("es-CO")}
                  </p>
                </div>
                {!a.read ? (
                  <button onClick={() => markRead(a.id)} className="rounded bg-white px-3 py-1 text-xs text-black">
                    Marcar leída
                  </button>
                ) : (
                  <span className="text-xs text-zinc-500">Leída</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
