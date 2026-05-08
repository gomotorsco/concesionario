"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Item = any;

const empty = {
  type: "video",
  title: "",
  content: "",
  youtube_url: "",
  category: "ventas",
  orden: "1",
  active: true,
};

function youtubeId(url: string) {
  const raw = String(url || "");
  const match = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match?.[1] || "";
}

export default function AdminCapacitacionPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [selected, setSelected] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/training", { cache: "no-store" });
    const json = await res.json();
    setItems(json.items ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function edit(item: Item) {
    setSelected(item);
    setForm({
      type: item.type || "consejo",
      title: item.title || "",
      content: item.content || "",
      youtube_url: item.youtube_url || "",
      category: item.category || "ventas",
      orden: String(item.orden || 1),
      active: item.active !== false,
    });
  }

  function reset() {
    setSelected(null);
    setForm(empty);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/admin/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected?.id,
        ...form,
        orden: Number(form.orden || 1),
      }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      alert(json.message || "No se pudo guardar.");
      return;
    }

    reset();
    load();
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar este contenido?")) return;
    await fetch(`/api/admin/training?id=${id}`, { method: "DELETE" });
    load();
  }

  const grouped = useMemo(() => ({
    videos: items.filter((i) => i.type === "video"),
    consejos: items.filter((i) => i.type === "consejo"),
    scripts: items.filter((i) => i.type === "script"),
  }), [items]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">Academia comercial</p>
        <h1 className="mt-2 text-3xl font-black text-white">Capacitación vendedor</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Cargá videos, consejos y scripts comerciales para entrenar al equipo desde el panel vendedor.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={submit} className="rounded-[26px] border border-white/10 bg-[#080d18] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">{selected ? "Editar contenido" : "Nuevo contenido"}</h2>
            {selected ? <button type="button" onClick={reset} className="text-xs font-bold text-slate-400">Crear nuevo</button> : null}
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Tipo
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
              >
                <option value="video">Video YouTube</option>
                <option value="consejo">Mensaje / consejo</option>
                <option value="script">Script comercial</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Título
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Cómo cerrar un cliente indeciso"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Categoría
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
              >
                <option value="ventas">Ventas</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="financiacion">Financiación</option>
                <option value="objeciones">Objeciones</option>
                <option value="cierre">Cierre</option>
              </select>
            </label>

            {form.type === "video" ? (
              <label className="grid gap-2 text-sm font-bold text-slate-200">
                Link YouTube
                <input
                  value={form.youtube_url}
                  onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
                />
              </label>
            ) : null}

            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Contenido
              <textarea
                rows={7}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Consejo, explicación o script para copiar..."
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-200">
                Orden
                <input
                  type="number"
                  value={form.orden}
                  onChange={(e) => setForm({ ...form, orden: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm font-bold text-slate-200">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Activo para vendedores
              </label>
            </div>
          </div>

          <button disabled={saving} className="mt-5 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white disabled:opacity-60">
            {saving ? "Guardando..." : selected ? "Guardar cambios" : "Publicar capacitación"}
          </button>
        </form>

        <div className="space-y-5">
          <TrainingList title="Videos" items={grouped.videos} edit={edit} remove={remove} />
          <TrainingList title="Consejos" items={grouped.consejos} edit={edit} remove={remove} />
          <TrainingList title="Scripts" items={grouped.scripts} edit={edit} remove={remove} />
        </div>
      </section>
    </div>
  );
}

function TrainingList({ title, items, edit, remove }: any) {
  return (
    <section className="rounded-[26px] border border-white/10 bg-[#080d18] p-5">
      <h2 className="text-lg font-black text-white">{title}</h2>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? <p className="text-sm text-slate-500">Sin contenido.</p> : null}

        {items.map((item: any) => {
          const id = youtubeId(item.youtube_url || "");
          return (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex gap-4">
                {item.type === "video" && id ? (
                  <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} className="h-20 w-32 rounded-xl object-cover" alt="" />
                ) : null}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">{item.category}</p>
                  <h3 className="mt-1 font-black text-white">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">{item.content}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.active === false ? "Inactivo" : "Activo"} · Orden {item.orden || 1}</p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={() => edit(item)} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-white">Editar</button>
                <button onClick={() => remove(item.id)} className="rounded-xl bg-red-600/80 px-4 py-2 text-xs font-black text-white">Eliminar</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
