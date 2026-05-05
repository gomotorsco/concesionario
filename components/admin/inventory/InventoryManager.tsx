"use client";

import { useEffect, useState } from "react";

type Props = {
  type: "auto" | "moto" | "ciclomotor";
  title: string;
  description?: string;
  examples?: string;
};

const emptyForm = {
  id: "",
  title: "",
  marca: "",
  modelo: "",
  version: "",
  precio: "",
  cuotaDesde: "",
  descripcion: "",
  imagenHero: "",
  gallery: [] as string[],
};

export default function InventoryManager({ type, title, description, examples }: Props) {
  const [sections, setSections] = useState<any[]>([]);
  const [open, setOpen] = useState<any[]>([]);
  const [brandName, setBrandName] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const res = await fetch(`/api/vehicles?admin=1&type=${type}`, { cache: "no-store" });
    const json = await res.json();
    setSections(json.sections || []);
  }

  useEffect(() => {
    load();
  }, [type]);

  async function createBrand() {
    if (!brandName.trim()) return alert("Ingrese la marca.");

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "section", title: brandName.trim(), sectionType: type }),
    });

    const json = await res.json();
    if (!res.ok) return alert(json.message || "No se pudo crear marca.");

    setBrandName("");
    await load();
    alert("Marca creada.");
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;

    const selected = Array.from(files).slice(0, 15 - form.gallery.length);
    if (!selected.length) return alert("Máximo 15 imágenes.");

    setUploading(true);
    const uploaded: string[] = [];

    for (const file of selected) {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/upload-vehicle-image", { method: "POST", body: fd });
      const json = await res.json();

      if (res.ok && json.url) uploaded.push(json.url);
      else alert(json.message || "No se pudo subir una imagen.");
    }

    setForm((prev) => {
      const gallery = [...prev.gallery, ...uploaded].slice(0, 15);
      return { ...prev, gallery, imagenHero: prev.imagenHero || gallery[0] || "" };
    });

    setUploading(false);
  }

  function editVehicle(v: any) {
    const gallery = Array.isArray(v.galeria) ? v.galeria : [];
    const unique = Array.from(new Set([v.imagen_hero || v.imagen_url, ...gallery].filter(Boolean))) as string[];

    setEditing(v.id);
    setForm({
      id: String(v.id),
      title: v.title || "",
      marca: v.marca || "",
      modelo: v.modelo || "",
      version: v.version || "",
      precio: v.precio ? String(v.precio) : "",
      cuotaDesde: v.cuota_desde ? String(v.cuota_desde) : "",
      descripcion: v.descripcion || "",
      imagenHero: v.imagen_hero || v.imagen_url || unique[0] || "",
      gallery: unique.slice(0, 15),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveVehicle() {
    if (!form.title.trim()) return alert("Ingrese nombre público.");
    if (!form.marca.trim()) return alert("Ingrese marca.");

    const res = await fetch("/api/vehicles", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "vehicle",
        id: editing,
        inventoryType: type,
        title: form.title,
        marca: form.marca,
        modelo: form.modelo,
        version: form.version,
        precio: form.precio,
        cuotaDesde: form.cuotaDesde,
        descripcion: form.descripcion,
        imagenHero: form.imagenHero,
        imagenUrl: form.imagenHero,
        gallery: form.gallery,
        galeria: form.gallery,
      }),
    });

    const json = await res.json();
    if (!res.ok) return alert(json.message || "No se pudo guardar.");

    alert(editing ? "Cambios guardados." : "Vehículo creado.");
    setEditing(null);
    setForm(emptyForm);
    await load();
  }

  async function toggleVehicle(id: any) {
    const res = await fetch("/api/vehicles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "toggle_visibility" }),
    });

    const json = await res.json();
    if (!res.ok) return alert(json.message || "No se pudo pausar/activar.");

    await load();
  }

  async function deleteVehicle(id: any) {
    if (!confirm("¿Eliminar vehículo definitivamente?")) return;

    const res = await fetch(`/api/vehicles?id=${id}`, { method: "DELETE" });
    const json = await res.json();

    if (!res.ok) return alert(json.message || "No se pudo eliminar.");

    alert("Vehículo eliminado.");
    await load();
  }

  function removeImage(url: string) {
    setForm((prev) => {
      const gallery = prev.gallery.filter((x) => x !== url);
      return {
        ...prev,
        gallery,
        imagenHero: prev.imagenHero === url ? gallery[0] || "" : prev.imagenHero,
      };
    });
  }

  return (
    <main className="min-h-screen bg-[#05070d] p-4 text-white md:p-6">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">Inventario</p>
          <h1 className="mt-2 text-4xl font-black">{title}</h1>
          <p className="mt-2 text-slate-400">{description}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <h2 className="text-xl font-black">Marcas</h2>
            <p className="mt-2 text-sm text-slate-400">Ej: {examples}</p>

            <div className="mt-5 flex gap-3">
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Nueva marca"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
              />
              <button onClick={createBrand} className="rounded-2xl bg-blue-600 px-5 py-3 font-black">
                Crear
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setForm((f) => ({ ...f, marca: s.title }))}
                  className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-200"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <h2 className="text-xl font-black">{editing ? "Editar vehículo" : "Crear vehículo"}</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input label="Marca" value={form.marca} onChange={(v) => setForm({ ...form, marca: v })} />
              <Input label="Nombre público" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <Input label="Modelo" value={form.modelo} onChange={(v) => setForm({ ...form, modelo: v })} />
              <Input label="Versión" value={form.version} onChange={(v) => setForm({ ...form, version: v })} />
              <Input label="Precio" value={form.precio} onChange={(v) => setForm({ ...form, precio: v })} />
              <Input label="Cuota desde" value={form.cuotaDesde} onChange={(v) => setForm({ ...form, cuotaDesde: v })} />

              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-bold">Descripción</span>
                <textarea
                  rows={4}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
                />
              </label>

              <div className="rounded-2xl border border-white/10 bg-[#101827] p-4 md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-black">Imágenes</p>
                    <p className="text-sm text-slate-400">Máximo 15. Elegí cuál es hero.</p>
                  </div>

                  <label className="cursor-pointer rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black">
                    {uploading ? "Subiendo..." : "Subir imágenes"}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={uploading || form.gallery.length >= 15}
                      onChange={(e) => uploadImages(e.target.files)}
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {form.gallery.map((img) => (
                    <div key={img} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                      <img src={img} className="h-28 w-full object-cover" />
                      <div className="flex gap-2 p-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, imagenHero: img })}
                          className={`flex-1 rounded-xl px-3 py-2 text-xs font-black ${
                            form.imagenHero === img ? "bg-emerald-600" : "bg-white/10"
                          }`}
                        >
                          Elegir hero
                        </button>
                        <button type="button" onClick={() => removeImage(img)} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black">
                          Borrar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={saveVehicle} className="rounded-2xl bg-emerald-600 px-6 py-3 font-black">
                {editing ? "Guardar cambios" : "Crear vehículo"}
              </button>

              {editing ? (
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-2xl bg-white/10 px-6 py-3 font-black"
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </section>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
          <h2 className="text-xl font-black">Inventario por marca</h2>

          <div className="mt-5 space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="overflow-hidden rounded-2xl border border-white/10">
                <button
                  onClick={() => setOpen((prev) => (prev.includes(section.id) ? prev.filter((x) => x !== section.id) : [...prev, section.id]))}
                  className="flex w-full items-center justify-between bg-white/[0.03] px-5 py-4 text-left"
                >
                  <h3 className="text-xl font-black">{section.title}</h3>
                  <span>{open.includes(section.id) ? "▲" : "▼"}</span>
                </button>

                {open.includes(section.id) ? (
                  <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
                    {(section.vehicles || []).map((v: any) => (
                      <article key={v.id} className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04]">
                        <img src={v.imagen_hero || v.imagen_url || "/category-banners/automoviles.png"} className="h-44 w-full object-cover" />

                        <div className="p-4">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">{v.marca || section.title}</p>
                          <h4 className="mt-2 text-lg font-black">{v.title}</h4>
                          <p className="mt-1 text-sm text-slate-400">{v.visible === false ? "Pausado" : "Visible"}</p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button onClick={() => editVehicle(v)} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black">Editar</button>
                            <button onClick={() => toggleVehicle(v.id)} className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-black">
                              {v.visible === false ? "Activar" : "Pausar"}
                            </button>
                            <button onClick={() => deleteVehicle(v.id)} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black">Eliminar</button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold">{label}</span>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
      />
    </label>
  );
}
