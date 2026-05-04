"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  type: "auto" | "moto" | "ciclomotor";
  title: string;
  description?: string;
  examples?: string;
};

type Vehicle = {
  id: number;
  title: string;
  marca?: string;
  modelo?: string;
  version?: string;
  precio?: number;
  cuota_desde?: number;
  descripcion?: string;
  imagen_hero?: string;
  imagen_url?: string;
  galeria?: string[];
  visible?: boolean;
};

type Section = {
  id: number;
  title: string;
  vehicles: Vehicle[];
};

const emptyForm = {
  id: "",
  sectionId: "",
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
  const [sections, setSections] = useState<Section[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [brandName, setBrandName] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const res = await fetch(`/api/vehicles?admin=1&type=${type}`, { cache: "no-store" });
    const json = await res.json();
    setSections(json.sections || []);
  }

  useEffect(() => {
    load();
  }, [type]);

  const currentVehicles = useMemo(
    () => sections.flatMap((s) => s.vehicles || []),
    [sections]
  );

  function toggleSection(id: number) {
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function createBrand() {
    if (!brandName.trim()) return alert("IngresÃ¡ el nombre de la marca.");

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "section", title: brandName.trim(), sectionType: type }),
    });

    const json = await res.json();

    if (!res.ok) return alert(json.message || "No se pudo crear la marca.");

    setBrandName("");
    await load();
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;

    const selected = Array.from(files).slice(0, 15 - form.gallery.length);

    if (!selected.length) {
      alert("MÃ¡ximo 8 imÃ¡genes por vehÃ­culo.");
      return;
    }

    setUploading(true);

    const uploaded: string[] = [];

    for (const file of selected) {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/admin/upload-vehicle-image", {
        method: "POST",
        body: data,
      });

      const json = await res.json();

      if (res.ok && json.url) {
        uploaded.push(json.url);
      } else {
        alert(json.message || "No se pudo subir una imagen.");
      }
    }

    setForm((prev) => {
      const gallery = [...prev.gallery, ...uploaded].slice(0, 15);
      return {
        ...prev,
        gallery,
        imagenHero: prev.imagenHero || gallery[0] || "",
      };
    });

    setUploading(false);
  }

  function setHero(url: string) {
    setForm((prev) => ({ ...prev, imagenHero: url }));
  }

  function removeImage(url: string) {
    setForm((prev) => {
      const gallery = prev.gallery.filter((img) => img !== url);
      return {
        ...prev,
        gallery,
        imagenHero: prev.imagenHero === url ? gallery[0] || "" : prev.imagenHero,
      };
    });
  }

  function editVehicle(v: Vehicle) {
    const gallery = Array.isArray(v.galeria)
      ? v.galeria
      : [];

    const uniqueGallery = Array.from(
      new Set([v.imagen_hero || v.imagen_url, ...gallery].filter(Boolean))
    ) as string[];

    setEditing(v.id);
    setForm({
      id: String(v.id),
      sectionId: "",
      title: v.title || "",
      marca: v.marca || "",
      modelo: v.modelo || "",
      version: v.version || "",
      precio: v.precio ? String(v.precio) : "",
      cuotaDesde: v.cuota_desde ? String(v.cuota_desde) : "",
      descripcion: v.descripcion || "",
      imagenHero: v.imagen_hero || v.imagen_url || uniqueGallery[0] || "",
      gallery: uniqueGallery.slice(0, 15),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveVehicle() {
    if (!form.title.trim()) return alert("IngresÃ¡ el nombre pÃºblico.");

    const res = await fetch("/api/vehicles", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "vehicle",
        id: editing,
        inventoryType: type,
        sectionId: form.sectionId ? Number(form.sectionId) : undefined,
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
      }),
    });

    const json = await res.json();

    if (!res.ok) { alert(json.message || "No se pudo guardar."); return; }
    alert(editing ? "Cambios guardados." : "Vehículo creado.");

    setForm(emptyForm);
    setEditing(null);
    await load();
  }

  async function toggleVehicle(id: number) {
    await fetch("/api/vehicles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "toggle_visibility" }),
    });
    await load();
  }

  async function deleteVehicle(id: number) {
    if (!confirm("Â¿Eliminar este vehÃ­culo? Esta acciÃ³n no se puede deshacer.")) return;

    await fetch(`/api/vehicles?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <main className="min-h-screen bg-[#05070d] p-6 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-7">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-blue-300">
            Inventario GoMotorsCo
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">{title}</h1>
          {description ? <p className="mt-3 text-slate-300">{description}</p> : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <h2 className="text-xl font-black">Marcas</h2>
            <p className="mt-2 text-sm text-slate-400">
              Ejemplos: {examples || "Chevrolet, Renault, Yamaha, Honda"}.
            </p>

            <div className="mt-5 flex gap-3">
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Ingresar nueva marca"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 outline-none"
              />
              <button onClick={createBrand} className="rounded-2xl bg-blue-600 px-5 py-3 font-black">
                Crear marca
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setForm((prev) => ({ ...prev, marca: s.title }))}
                  className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-200"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
            <h2 className="text-xl font-black">
              {editing ? "Editar modelo / versiÃ³n" : "Cargar modelo / versiÃ³n"}
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                value={form.marca}
                onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))}
                placeholder="Marca"
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 outline-none"
              />

              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Nombre pÃºblico"
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 outline-none"
              />

              <input
                value={form.modelo}
                onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))}
                placeholder="Modelo"
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 outline-none"
              />

              <input
                value={form.version}
                onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                placeholder="VersiÃ³n"
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 outline-none"
              />

              <input
                value={form.precio}
                onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
                placeholder="Precio"
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 outline-none"
              />

              <input
                value={form.cuotaDesde}
                onChange={(e) => setForm((f) => ({ ...f, cuotaDesde: e.target.value }))}
                placeholder="Cuota desde"
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 outline-none"
              />

              <textarea
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                placeholder="DescripciÃ³n"
                rows={4}
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 outline-none md:col-span-2"
              />

              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#101827] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-black">ImÃ¡genes del vehÃ­culo</p>
                    <p className="text-sm text-slate-400">MÃ¡ximo 8. La primera serÃ¡ hero si no elegÃ­s otra.</p>
                  </div>

                  <label className="cursor-pointer rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black hover:bg-blue-500">
                    {uploading ? "Subiendo..." : "Subir imÃ¡genes"}
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

                {form.gallery.length ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    {form.gallery.map((img) => (
                      <div key={img} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                        <img src={img} className="h-28 w-full object-cover" />

                        <div className="flex gap-2 p-2">
                          <button
                            onClick={() => setHero(img)}
                            className={`flex-1 rounded-xl px-3 py-2 text-xs font-black ${
                              form.imagenHero === img ? "bg-emerald-600" : "bg-white/10"
                            }`}
                          >
                            Hero
                          </button>
                          <button
                            onClick={() => removeImage(img)}
                            className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={saveVehicle} className="rounded-2xl bg-emerald-600 px-6 py-3 font-black">
                {editing ? "Guardar cambios" : "Agregar al inventario"}
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

        <section className="mt-6 rounded-[28px] border border-white/10 bg-[#080d18] p-6">
          <h2 className="text-xl font-black">Inventario por marca</h2>

          <div className="mt-5 space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="overflow-hidden rounded-2xl border border-white/10">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between bg-white/[0.03] px-5 py-4 text-left"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Marca</p>
                    <h3 className="text-xl font-black">{section.title}</h3>
                  </div>
                  <span>{open.includes(section.id) ? "â–²" : "â–¼"}</span>
                </button>

                {open.includes(section.id) ? (
                  <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
                    {(section.vehicles || []).map((v) => (
                      <article key={v.id} className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04]">
                        <img
                          src={v.imagen_hero || v.imagen_url || "/category-banners/automoviles.png"}
                          className="h-44 w-full object-cover"
                        />

                        <div className="p-4">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                            {v.marca || section.title}
                          </p>
                          <h4 className="mt-2 text-lg font-black">{v.title}</h4>
                          <p className="mt-1 text-sm text-slate-400">
                            {v.visible === false ? "Pausado" : "Visible"}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button onClick={() => editVehicle(v)} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black">
                              Editar
                            </button>
                            <button onClick={() => toggleVehicle(v.id)} className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-black">
                              {v.visible === false ? "Activar" : "Pausar"}
                            </button>
                            <button onClick={() => deleteVehicle(v.id)} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black">
                              Eliminar
                            </button>
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
