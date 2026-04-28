"use client";

import { FormEvent, useEffect, useState } from "react";

const initial = {
  business_name: "",
  slogan: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  primary_color: "#2563eb",
  secondary_color: "#16a34a",
  logo_url: "",
  hero_title: "",
  hero_subtitle: "",
  seo_title: "",
  seo_description: "",
  enabled: true,
};

export default function BrandingPage() {
  const [form, setForm] = useState<any>(initial);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/branding", { cache: "no-store" });
    const json = await res.json();

    if (json.branding) {
      setForm({ ...initial, ...json.branding });
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setField(key: string, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/admin/branding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      alert("No se pudo guardar branding.");
      return;
    }

    alert("Branding guardado.");
    await load();
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-100">Branding del concesionario</h1>
        <p className="text-xs text-slate-400">
          Configura nombre, contacto, textos principales, logo y SEO.
        </p>
      </section>

      <form onSubmit={save} className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.8fr]">
        <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Datos del negocio</h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="Nombre comercial" value={form.business_name} onChange={(v) => setField("business_name", v)} />
            <Input label="Slogan" value={form.slogan} onChange={(v) => setField("slogan", v)} />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(v) => setField("whatsapp", v)} />
            <Input label="Email" value={form.email} onChange={(v) => setField("email", v)} />
            <Input label="Ciudad" value={form.city} onChange={(v) => setField("city", v)} />
            <Input label="Dirección" value={form.address} onChange={(v) => setField("address", v)} />
          </div>

          <h2 className="pt-4 text-sm font-semibold text-slate-100">Identidad visual</h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="Color principal" type="color" value={form.primary_color} onChange={(v) => setField("primary_color", v)} />
            <Input label="Color secundario" type="color" value={form.secondary_color} onChange={(v) => setField("secondary_color", v)} />
          </div>

          <Input label="Logo URL" value={form.logo_url} onChange={(v) => setField("logo_url", v)} />

          <h2 className="pt-4 text-sm font-semibold text-slate-100">Home / Hero</h2>

          <Input label="Título principal" value={form.hero_title} onChange={(v) => setField("hero_title", v)} />

          <div>
            <label className="mb-1 block text-xs text-slate-400">Subtítulo</label>
            <textarea
              value={form.hero_subtitle}
              onChange={(e) => setField("hero_subtitle", e.target.value)}
              className="min-h-[90px] w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <h2 className="pt-4 text-sm font-semibold text-slate-100">SEO</h2>

          <Input label="SEO title" value={form.seo_title} onChange={(v) => setField("seo_title", v)} />

          <div>
            <label className="mb-1 block text-xs text-slate-400">SEO description</label>
            <textarea
              value={form.seo_description}
              onChange={(e) => setField("seo_description", e.target.value)}
              className="min-h-[90px] w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={form.enabled !== false}
              onChange={(e) => setField("enabled", e.target.checked)}
            />
            Branding activo
          </label>

          <button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Guardando..." : "Guardar branding"}
          </button>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Vista previa</h2>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-black p-5">
            {form.logo_url ? (
              <img src={form.logo_url} alt={form.business_name} className="mb-4 h-14 object-contain" />
            ) : null}

            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: form.primary_color }}>
              {form.business_name || "Concesionario"}
            </p>

            <h3 className="mt-3 text-3xl font-bold text-white">
              {form.hero_title || "Título principal"}
            </h3>

            <p className="mt-3 text-sm text-slate-400">
              {form.hero_subtitle || "Subtítulo comercial del concesionario."}
            </p>

            <button
              type="button"
              className="mt-5 rounded-xl px-5 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: form.primary_color }}
            >
              Consultar ahora
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
      />
    </div>
  );
}
