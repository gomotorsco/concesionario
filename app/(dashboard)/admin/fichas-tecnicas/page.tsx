"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminTechnicalSheetsPage() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    title: "",
    brand: "",
    model: "",
    vehicle_type: "auto",
    year: "",
    tags: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  async function load() {
    const res = await fetch("/api/admin/technical-sheets", { cache: "no-store" });
    const json = await res.json();
    setSheets(json.sheets ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return sheets.filter((s) =>
      [s.title, s.brand, s.model, s.vehicle_type, s.tags]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [sheets, q]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Seleccioná un PDF.");

    setSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v ?? "")));
    fd.append("file", file);

    const res = await fetch("/api/admin/technical-sheets", {
      method: "POST",
      body: fd,
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) return alert(json.message || "No se pudo subir la ficha.");

    setForm({ title: "", brand: "", model: "", vehicle_type: "auto", year: "", tags: "" });
    setFile(null);
    await load();
  }

  async function toggle(sheet: any) {
    await fetch("/api/admin/technical-sheets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sheet.id, visible: !sheet.visible }),
    });
    await load();
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-blue-300">Biblioteca comercial</p>
        <h1 className="mt-2 text-3xl font-black text-white">Fichas técnicas</h1>
        <p className="mt-2 text-sm text-slate-400">
          Subí PDFs por marca, modelo y tipo para que los vendedores los consulten rápido.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-lg font-black text-white">Nueva ficha PDF</h2>

          <div className="mt-5 grid gap-3">
            <Input label="Título" value={form.title} onChange={(v: string) => setForm({ ...form, title: v })} />
            <Input label="Marca" value={form.brand} onChange={(v: string) => setForm({ ...form, brand: v })} />
            <Input label="Modelo" value={form.model} onChange={(v: string) => setForm({ ...form, model: v })} />

            <label className="grid gap-1 text-xs font-bold text-slate-400">
              Tipo
              <select
                value={form.vehicle_type}
                onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                className="rounded-xl border border-slate-700 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="auto">Auto</option>
                <option value="moto">Moto</option>
                <option value="ciclomotor">Ciclomotor / Cuatriciclo</option>
              </select>
            </label>

            <Input label="Año" value={form.year} onChange={(v: string) => setForm({ ...form, year: v })} type="number" />
            <Input label="Tags" value={form.tags} onChange={(v: string) => setForm({ ...form, tags: v })} placeholder="financiación, pickup, híbrido..." />

            <label className="grid gap-1 text-xs font-bold text-slate-400">
              PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="rounded-xl border border-slate-700 bg-black px-3 py-2 text-sm text-white"
              />
            </label>
          </div>

          <button disabled={saving} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60">
            {saving ? "Subiendo..." : "Subir ficha"}
          </button>
        </form>

        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-black text-white">Fichas cargadas</h2>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar ficha..."
              className="rounded-xl border border-slate-700 bg-black px-4 py-2 text-sm text-white"
            />
          </div>

          <div className="mt-5 grid gap-3">
            {filtered.map((s) => (
              <article key={s.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-black text-white">{s.title}</p>
                    <p className="text-xs text-slate-400">
                      {s.brand || "Marca"} · {s.model || "Modelo"} · {s.vehicle_type || "tipo"} · {s.year || "s/año"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a href={s.file_url} target="_blank" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-black text-white">
                      Ver PDF
                    </a>
                    <button onClick={() => toggle(s)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white">
                      {s.visible ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }: any) {
  return (
    <label className="grid gap-1 text-xs font-bold text-slate-400">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-700 bg-black px-3 py-2 text-sm text-white"
      />
    </label>
  );
}
