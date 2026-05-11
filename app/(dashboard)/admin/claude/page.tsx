"use client";

import { useEffect, useState } from "react";

export default function ClaudeAdminPage() {
  const [form, setForm] = useState({
    anthropic_api_key: "",
    anthropic_model: "claude-3-5-haiku-20241022",
    commercial_ai_prompt: "",
    has_key: false,
  });

  async function load() {
    const res = await fetch("/api/admin/claude", { cache: "no-store" });
    const json = await res.json();
    if (json.settings) setForm(json.settings);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    const res = await fetch("/api/admin/claude", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    if (!res.ok) return alert(json.message || "No se pudo guardar Claude.");

    alert("IA comercial guardada.");
    await load();
  }

  return (
    <main className="min-h-screen bg-[#05070d] p-4 text-white md:p-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[30px] border border-white/10 bg-[#080d18] p-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Claude IA Comercial</p>
          <h1 className="mt-2 text-4xl font-black">Motor inteligente de ventas</h1>
          <p className="mt-2 text-slate-400">
            Configurá Claude para generar recomendaciones, respuestas WhatsApp y próximos pasos comerciales.
          </p>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#080d18] p-6">
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-bold">
              Claude API Key
              <input
                type="password"
                value={form.anthropic_api_key}
                onChange={(e) => setForm({ ...form, anthropic_api_key: e.target.value })}
                placeholder={form.has_key ? "Key configurada. Escribí una nueva si querés cambiarla." : "sk-ant-..."}
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Modelo
              <input
                value={form.anthropic_model}
                onChange={(e) => setForm({ ...form, anthropic_model: e.target.value })}
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Prompt comercial base
              <textarea
                rows={8}
                value={form.commercial_ai_prompt}
                onChange={(e) => setForm({ ...form, commercial_ai_prompt: e.target.value })}
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
              />
            </label>

            <button onClick={save} className="rounded-2xl bg-cyan-600 px-6 py-3 font-black">
              Guardar IA Comercial
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
