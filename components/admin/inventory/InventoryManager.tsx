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
  heroTitle: "",
  heroSubtitle: "",
  block1Title: "",
  block1Text: "",
  block1Image: "",
  block2Title: "",
  block2Text: "",
  block2Image: "",
  block3Title: "",
  block3Text: "",
  block3Image: "",
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

  function createBrand() {
    if (!brandName.trim()) return alert("Ingrese la marca.");
    const name = brandName.trim();

    setSections((prev) => {
      if (prev.some((s) => String(s.title).toLowerCase() === name.toLowerCase())) return prev;
      return [...prev, { id: "local-" + name, title: name, name, slug: name.toLowerCase(), type, visible: true, vehicles: [] }];
    });

    setForm((prev) => ({ ...prev, marca: name }));
    setBrandName("");
    alert("Marca creada. Ahora cargá un vehículo con esa marca.");
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
      return {
        ...prev,
        gallery,
        imagenHero: prev.imagenHero || gallery[0] || "",
        block1Image: prev.block1Image || gallery[1] || gallery[0] || "",
        block2Image: prev.block2Image || gallery[2] || gallery[0] || "",
        block3Image: prev.block3Image || gallery[3] || gallery[0] || "",
      };
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
      heroTitle: v.hero_title || v.title || "",
      heroSubtitle: v.hero_subtitle || v.descripcion || "",
      block1Title: v.block1_title || "Diseño y presencia",
      block1Text: v.block1_text || "",
      block1Image: v.block1_image || unique[1] || unique[0] || "",
      block2Title: v.block2_title || "Confort interior",
      block2Text: v.block2_text || "",
      block2Image: v.block2_image || unique[2] || unique[0] || "",
      block3Title: v.block3_title || "Financiación a tu medida",
      block3Text: v.block3_text || "",
      block3Image: v.block3_image || unique[3] || unique[0] || "",
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
        ...form,
        id: editing,
        inventoryType: type,
        imagenHero: form.imagenHero,
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
    if (!confirm("¿Eliminar vehículo?")) return;

    const res = await fetch(`/api/vehicles?id=${id}`, { method: "DELETE" });
    const json = await res.json();

    if (!res.ok) return alert(json.message || "No se pudo eliminar.");

    alert("Vehículo eliminado.");
    await load();
  }

  function removeImage(url: string) {
    setForm((prev) => {
      const gallery = prev.gallery.filter((x) => x !== url);
      const first = gallery[0] || "";
      return {
        ...prev,
        gallery,
        imagenHero: prev.imagenHero === url ? first : prev.imagenHero,
        block1Image: prev.block1Image === url ? first : prev.block1Image,
        block2Image: prev.block2Image === url ? first : prev.block2Image,
        block3Image: prev.block3Image === url ? first : prev.block3Image,
      };
    });
  }

  return (
    <main className="min-h-screen bg-[#05070d] p-4 text-white md:p-6">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">Inventario premium</p>
          <h1 className="mt-2 text-4xl font-black">{title}</h1>
          <p className="mt-2 text-slate-400">{description}</p>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
              <h2 className="text-xl font-black">Marcas</h2>
              <p className="mt-2 text-sm text-slate-400">Ej: {examples}</p>

              <div className="mt-5 flex gap-3">
                <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Nueva marca" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#101827] px-4 py-3" />
                <button onClick={createBrand} className="rounded-2xl bg-blue-600 px-5 py-3 font-black">Crear</button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {sections.map((s) => (
                  <button key={s.id} onClick={() => setForm((f) => ({ ...f, marca: s.title }))} className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-200">
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
              <h2 className="text-xl font-black">{editing ? "Editar landing del vehículo" : "Crear landing del vehículo"}</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Input label="Marca" value={form.marca} onChange={(v: string) => setForm({ ...form, marca: v })} />
                <Input label="Nombre público" value={form.title} onChange={(v: string) => setForm({ ...form, title: v })} />
                <Input label="Modelo" value={form.modelo} onChange={(v: string) => setForm({ ...form, modelo: v })} />
                <Input label="Versión" value={form.version} onChange={(v: string) => setForm({ ...form, version: v })} />
                <Input label="Precio" value={form.precio} onChange={(v: string) => setForm({ ...form, precio: v })} />
                <Input label="Cuota desde" value={form.cuotaDesde} onChange={(v: string) => setForm({ ...form, cuotaDesde: v })} />

                <Textarea label="Descripción base" value={form.descripcion} onChange={(v: string) => setForm({ ...form, descripcion: v })} />

                <div className="rounded-2xl border border-white/10 bg-[#101827] p-4 md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black">Imágenes generales</p>
                      <p className="text-sm text-slate-400">Máximo 15. Separá hero y bloques desde abajo.</p>
                    </div>

                    <label className="cursor-pointer rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black">
                      {uploading ? "Subiendo..." : "Subir imágenes"}
                      <input type="file" multiple accept="image/*" className="hidden" disabled={uploading || form.gallery.length >= 15} onChange={(e) => uploadImages(e.target.files)} />
                    </label>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    {form.gallery.map((img) => (
                      <div key={img} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                        <img src={img} className="h-28 w-full object-cover" />
                        <div className="grid grid-cols-2 gap-2 p-2">
                          <button type="button" onClick={() => setForm({ ...form, imagenHero: img })} className={`rounded-xl px-3 py-2 text-xs font-black ${form.imagenHero === img ? "bg-emerald-600" : "bg-white/10"}`}>Hero</button>
                          <button type="button" onClick={() => removeImage(img)} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black">Borrar</button>
                          <button type="button" onClick={() => setForm({ ...form, block1Image: img })} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black">Bloque 1</button>
                          <button type="button" onClick={() => setForm({ ...form, block2Image: img })} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black">Bloque 2</button>
                          <button type="button" onClick={() => setForm({ ...form, block3Image: img })} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black">Bloque 3</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Input label="Título hero" value={form.heroTitle} onChange={(v: string) => setForm({ ...form, heroTitle: v })} />
                <Input label="Subtítulo hero" value={form.heroSubtitle} onChange={(v: string) => setForm({ ...form, heroSubtitle: v })} />

                <Editorial title="Bloque editorial 1" img={form.block1Image} imageLabel="Imagen bloque 1" titleValue={form.block1Title} textValue={form.block1Text} onTitle={(v: string) => setForm({ ...form, block1Title: v })} onText={(v: string) => setForm({ ...form, block1Text: v })} onImage={(v: string) => setForm({ ...form, block1Image: v })} />
                <Editorial title="Bloque editorial 2" img={form.block2Image} imageLabel="Imagen bloque 2" titleValue={form.block2Title} textValue={form.block2Text} onTitle={(v: string) => setForm({ ...form, block2Title: v })} onText={(v: string) => setForm({ ...form, block2Text: v })} onImage={(v: string) => setForm({ ...form, block2Image: v })} />
                <Editorial title="Bloque editorial 3" img={form.block3Image} imageLabel="Imagen bloque 3" titleValue={form.block3Title} textValue={form.block3Text} onTitle={(v: string) => setForm({ ...form, block3Title: v })} onText={(v: string) => setForm({ ...form, block3Text: v })} onImage={(v: string) => setForm({ ...form, block3Image: v })} />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={saveVehicle} className="rounded-2xl bg-emerald-600 px-6 py-3 font-black">{editing ? "Guardar cambios" : "Crear vehículo"}</button>
                {editing ? <button onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-2xl bg-white/10 px-6 py-3 font-black">Cancelar</button> : null}
              </div>
            </div>
          </section>

          <Preview form={form} />
        </div>

        <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
          <h2 className="text-xl font-black">Inventario por marca</h2>
          <div className="mt-5 space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="overflow-hidden rounded-2xl border border-white/10">
                <button onClick={() => setOpen((prev) => (prev.includes(section.id) ? prev.filter((x) => x !== section.id) : [...prev, section.id]))} className="flex w-full items-center justify-between bg-white/[0.03] px-5 py-4 text-left">
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
                            <button onClick={() => toggleVehicle(v.id)} className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-black">{v.visible === false ? "Activar" : "Pausar"}</button>
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
  return <label className="grid gap-2"><span className="text-sm font-bold">{label}</span><input value={value || ""} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3" /></label>;
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label className="grid gap-2 md:col-span-2"><span className="text-sm font-bold">{label}</span><textarea rows={4} value={value || ""} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3" /></label>;
}

function Editorial(props: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-2">
      <h3 className="text-lg font-black">{props.title}</h3>
      <div className="mt-4 grid gap-4">
        <Input label="Título" value={props.titleValue} onChange={props.onTitle} />
        <Textarea label="Texto" value={props.textValue} onChange={props.onText} />
        <Input label={props.imageLabel} value={props.img} onChange={props.onImage} />
        {props.img ? <img src={props.img} className="h-56 w-full rounded-2xl object-cover" /> : null}
      </div>
    </div>
  );
}

function Preview({ form }: any) {
  return (
    <aside className="sticky top-5 h-fit rounded-[32px] border border-white/10 bg-black/30 p-5">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">Preview landing</p>
      <div className="mt-5 overflow-hidden rounded-[28px] bg-[#05070d]">
        <div className="grid items-center gap-8 p-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">{form.marca || "Marca"}</p>
            <h1 className="mt-4 text-5xl font-black leading-none">{form.heroTitle || form.title || "Nombre vehículo"}</h1>
            <p className="mt-5 text-slate-300">{form.heroSubtitle || form.descripcion || "Subtítulo comercial"}</p>
            <button className="mt-7 rounded-2xl bg-blue-600 px-6 py-4 font-black">Pre-aprobación</button>
          </div>
          <img src={form.imagenHero || form.gallery[0] || "/category-banners/automoviles.png"} className="w-full rounded-3xl object-cover" />
        </div>

        <Block img={form.block1Image} title={form.block1Title || "Bloque editorial 1"} text={form.block1Text} flip={false} />
        <Block img={form.block2Image} title={form.block2Title || "Bloque editorial 2"} text={form.block2Text} flip />
        <Block img={form.block3Image} title={form.block3Title || "Bloque editorial 3"} text={form.block3Text} flip={false} />
      </div>
    </aside>
  );
}

function Block({ img, title, text, flip }: any) {
  return (
    <div className={`grid gap-6 border-t border-white/10 p-8 lg:grid-cols-2 ${flip ? "lg:[&>div:first-child]:order-2" : ""}`}>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">Detalle</p>
        <h2 className="mt-3 text-3xl font-black">{title}</h2>
        <p className="mt-4 text-slate-300">{text || "Texto comercial del vehículo."}</p>
      </div>
      <img src={img || "/category-banners/automoviles.png"} className="h-72 w-full rounded-3xl object-cover" />
    </div>
  );
}


