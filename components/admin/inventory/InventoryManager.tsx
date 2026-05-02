"use client";

import { useEffect, useMemo, useState } from "react";

type InventoryType = "auto" | "moto" | "ciclomotor";

type Props = {
  type: InventoryType;
  title: string;
  description: string;
  examples: string;
};

type Section = {
  id: number;
  title: string;
  slug: string;
  type: string;
  visible: boolean;
  orden?: number;
  vehicles?: Vehicle[];
};

type Vehicle = {
  id: number;
  title: string;
  marca?: string | null;
  modelo?: string | null;
  version?: string | null;
  precio?: number | null;
  cuota_desde?: number | null;
  descripcion?: string | null;
  imagen_url?: string | null;
  imagen_hero?: string | null;
  visible?: boolean;
};

export default function InventoryManager({ type, title, description, examples }: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState("");
  const [form, setForm] = useState({
    sectionId: "",
    title: "",
    marca: "",
    modelo: "",
    version: "",
    precio: "",
    cuotaDesde: "",
    descripcion: "",
    imagenUrl: "",
  });

  const currentSections = useMemo(() => {
    return sections.filter((s) => String(s.type).toLowerCase() === type);
  }, [sections, type]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/vehicles?admin=1&type=${type}`, { cache: "no-store" });
    const json = await res.json();
    setSections(json.sections ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createBrand() {
    if (!brandName.trim()) return alert("Escribí el nombre de la marca.");

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "section",
        title: brandName.trim(),
        sectionType: type,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.message || "No se pudo crear la marca.");
      return;
    }

    setBrandName("");
    await load();
  }

  async function createVehicle() {
    if (!form.sectionId) return alert("Elegí una marca/marca.");
    if (!form.title.trim()) return alert("Escribí el nombre del modelo.");

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "vehicle",
        sectionId: Number(form.sectionId),
        title: form.title.trim(),
        marca: form.marca.trim() || undefined,
        modelo: form.modelo.trim() || form.title.trim(),
        version: form.version.trim() || undefined,
        tipo: type,
        precio: form.precio ? Number(form.precio) : undefined,
        cuotaDesde: form.cuotaDesde ? Number(form.cuotaDesde) : undefined,
        descripcion: form.descripcion.trim() || undefined,
        imagenUrl: form.imagenUrl.trim() || undefined,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.message || "No se pudo crear.");
      return;
    }

    setForm({
      sectionId: "",
      title: "",
      marca: "",
      modelo: "",
      version: "",
      precio: "",
      cuotaDesde: "",
      descripcion: "",
      imagenUrl: "",
    });

    await load();
  }

  return (
    <main className="min-h-screen bg-[#05070d] p-6 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-blue-300">
            Inventario GoMotorsCo
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">{title}</h1>
          <p className="mt-3 max-w-4xl text-lg leading-8 text-slate-300">{description}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <h2 className="text-xl font-black">Marcas / secciones</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Cargá marcas como {examples}. Dentro de cada marca cargás modelos, versiones, imagen hero, galería y descripción.
            </p>

            <div className="mt-5 flex gap-3">
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder={examples}
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
              <button
                onClick={createBrand}
                className="rounded-2xl bg-blue-600 px-5 py-3 font-black hover:bg-blue-500"
              >
                Crear marca
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {loading ? (
                <span className="text-slate-400">Cargando...</span>
              ) : currentSections.length === 0 ? (
                <span className="text-slate-400">Todavía no hay marcas creadas.</span>
              ) : (
                currentSections.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-200"
                  >
                    {s.title} {s.visible ? "· Visible" : "· Oculta"}
                  </span>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <h2 className="text-xl font-black">Cargar modelo / versión</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-300">Marca</span>
                <select
                  value={form.sectionId}
                  onChange={(e) => {
                    const selected = currentSections.find((s) => String(s.id) === e.target.value);
                    setForm((f) => ({
                      ...f,
                      sectionId: e.target.value,
                      marca: selected?.title ?? f.marca,
                    }));
                  }}
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none"
                >
                  <option value="">Elegí una marca</option>
                  {currentSections.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-300">Nombre público</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Renault Duster Intens CVT"
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-300">Modelo</span>
                <input
                  value={form.modelo}
                  onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))}
                  placeholder="Ej: Duster"
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-300">Versión</span>
                <input
                  value={form.version}
                  onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                  placeholder="Ej: Intens CVT"
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-300">Precio</span>
                <input
                  value={form.precio}
                  onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
                  placeholder="Ej: 89900000"
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-300">Cuota desde</span>
                <input
                  value={form.cuotaDesde}
                  onChange={(e) => setForm((f) => ({ ...f, cuotaDesde: e.target.value }))}
                  placeholder="Ej: 1200000"
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-bold text-slate-300">Imagen hero / principal</span>
                <input
                  value={form.imagenUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imagenUrl: e.target.value }))}
                  placeholder="URL de imagen o luego lo conectamos a Storage"
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-bold text-slate-300">Descripción</span>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  rows={4}
                  placeholder="Descripción comercial, ficha técnica resumida, beneficios..."
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </label>
            </div>

            <button
              onClick={createVehicle}
              className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 font-black hover:bg-emerald-500"
            >
              Agregar al inventario
            </button>
          </section>
        </div>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-[#080d18] p-6">
          <h2 className="text-xl font-black">Inventario cargado</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {currentSections.flatMap((s) =>
              (s.vehicles ?? []).map((v) => (
                <article key={v.id} className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]">
                  <div className="h-44 bg-slate-900">
                    {v.imagen_hero || v.imagen_url ? (
                      <img src={v.imagen_hero || v.imagen_url || ""} alt={v.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        Sin imagen hero
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                      {s.title}
                    </p>
                    <h3 className="mt-2 text-xl font-black">{v.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {[v.modelo, v.version].filter(Boolean).join(" · ") || "Modelo sin versión"}
                    </p>
                    <p className="mt-3 text-sm text-slate-300">
                      {v.visible === false ? "Oculto" : "Visible"}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
