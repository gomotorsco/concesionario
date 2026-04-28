"use client";

import { FormEvent, useEffect, useState } from "react";

type FAQ = {
  id: number;
  question: string;
  answer: string;
  category: string;
  active: boolean;
};

export default function AdminIAPage() {
  const [settings, setSettings] = useState<any>({
    assistant_name: "Asistente Comercial",
    tone: "profesional",
    main_prompt: "",
    fallback_message: "",
    whatsapp_number: "",
    enabled: true,
  });

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("credito");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/ai-settings", { cache: "no-store" });
    const json = await res.json();

    if (json.settings) setSettings(json.settings);
    setFaqs(json.faqs ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function setField(key: string, value: any) {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  }

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/admin/ai-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "update_settings", ...settings }),
    });

    setSaving(false);

    if (!res.ok) {
      alert("No se pudo guardar configuración.");
      return;
    }

    await load();
    alert("Configuración guardada.");
  }

  async function createFaq(e: FormEvent) {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      alert("Completá pregunta y respuesta.");
      return;
    }

    const res = await fetch("/api/admin/ai-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "create_faq",
        question,
        answer,
        category,
      }),
    });

    if (!res.ok) {
      alert("No se pudo crear FAQ.");
      return;
    }

    setQuestion("");
    setAnswer("");
    await load();
  }

  async function toggleFaq(faq: FAQ) {
    await fetch("/api/admin/ai-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "update_faq",
        id: faq.id,
        active: !faq.active,
      }),
    });

    await load();
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-100">
          IA Comercial / Créditos
        </h1>
        <p className="text-xs text-slate-400">
          Configura el asistente básico para responder consultas frecuentes sin prometer aprobaciones.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={saveSettings} className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            Configuración del asistente
          </h2>

          <Input label="Nombre del asistente" value={settings.assistant_name ?? ""} onChange={(v) => setField("assistant_name", v)} />
          <Input label="Tono" value={settings.tone ?? ""} onChange={(v) => setField("tone", v)} />
          <Input label="WhatsApp principal" value={settings.whatsapp_number ?? ""} onChange={(v) => setField("whatsapp_number", v)} />

          <div>
            <label className="mb-1 block text-xs text-slate-400">Prompt principal</label>
            <textarea
              value={settings.main_prompt ?? ""}
              onChange={(e) => setField("main_prompt", e.target.value)}
              className="min-h-[180px] w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Mensaje fallback</label>
            <textarea
              value={settings.fallback_message ?? ""}
              onChange={(e) => setField("fallback_message", e.target.value)}
              className="min-h-[90px] w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={settings.enabled !== false}
              onChange={(e) => setField("enabled", e.target.checked)}
            />
            Asistente activo
          </label>

          <button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </form>

        <div className="space-y-4">
          <form onSubmit={createFaq} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Nueva pregunta frecuente
            </h2>

            <Input label="Pregunta" value={question} onChange={setQuestion} />

            <div>
              <label className="mb-1 block text-xs text-slate-400">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
              >
                <option value="credito">Crédito</option>
                <option value="parte_pago">Parte de pago</option>
                <option value="vehiculos">Vehículos</option>
                <option value="horarios">Horarios</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Respuesta</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[110px] w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
              />
            </div>

            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
              Crear FAQ
            </button>
          </form>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              FAQs cargadas
            </h2>

            {faqs.length === 0 ? (
              <p className="text-sm text-slate-400">No hay FAQs cargadas.</p>
            ) : (
              <div className="space-y-3">
                {faqs.map((f) => (
                  <div key={f.id} className="rounded-lg border border-slate-800 bg-black/40 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{f.question}</p>
                        <p className="mt-1 text-xs text-slate-400">{f.answer}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{f.category}</p>
                      </div>

                      <button
                        onClick={() => toggleFaq(f)}
                        className={`rounded-full border px-3 py-1 text-[10px] ${
                          f.active
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-slate-600 bg-slate-800 text-slate-300"
                        }`}
                      >
                        {f.active ? "Activa" : "Inactiva"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
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
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
      />
    </div>
  );
}
