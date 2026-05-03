"use client";

import { useEffect, useState } from "react";

export default function ConfiguracionPage() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/settings", { cache: "no-store" });
    const json = await res.json();
    setWhatsappNumber(json.whatsappNumber ?? "");
    setLoading(false);
  }

  async function save() {
    setSaving(true);

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappNumber }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      alert(json.message || "No se pudo guardar.");
      return;
    }

    alert("Configuración guardada.");
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#05070d] p-6 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-blue-300">
            Configuración general
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">
            Configuración
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-300">
            Ajustes principales del sitio y del sistema comercial de GoMotorsCo.
          </p>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-7">
          <h2 className="text-2xl font-black">WhatsApp principal</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Este número se usa en los botones de contacto, consultas de vehículos,
            preaprobación y atención comercial.
          </p>

          <label className="mt-6 grid gap-2">
            <span className="text-sm font-bold text-slate-300">
              Número de WhatsApp con código de país
            </span>
            <input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              disabled={loading}
              placeholder="Ej: 573001234567"
              className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <button
            onClick={save}
            disabled={saving || loading}
            className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </section>
      </section>
    </main>
  );
}
