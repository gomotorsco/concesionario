"use client";

import { useState } from "react";

export default function AutomatizacionPage() {
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  async function runAutomation() {
    setRunning(true);
    const res = await fetch("/api/admin/automation", { method: "POST" });
    const json = await res.json();
    setResult(json);
    setRunning(false);
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-100">
          Automatización comercial
        </h1>
        <p className="text-xs text-slate-400">
          Reglas automáticas para detectar leads sin tocar, seguimientos vencidos y vendedores sin actividad.
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="text-sm font-semibold text-slate-100">
          Reglas activas
        </h2>

        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>• Lead nuevo sin actividad por 24h → alerta urgente al vendedor.</li>
          <li>• Lead en seguimiento sin actividad por 48h → alerta de seguimiento.</li>
          <li>• Vendedor sin actividad por 24h → alerta comercial.</li>
        </ul>

        <button
          onClick={runAutomation}
          disabled={running}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {running ? "Ejecutando..." : "Ejecutar revisión ahora"}
        </button>

        {result ? (
          <pre className="mt-4 overflow-auto rounded-lg border border-slate-800 bg-black p-3 text-xs text-slate-300">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : null}
      </section>
    </div>
  );
}
