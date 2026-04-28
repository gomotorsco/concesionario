"use client";

import { FormEvent, useEffect, useState } from "react";

type Section = {
  id: number;
  title: string;
  slug?: string | null;
  type?: string | null;
  visible?: boolean | null;
  vehicles?: Vehicle[];
};

type Vehicle = {
  id: number;
  section_id: number;
  title: string;
  slug?: string | null;
  tipo?: string | null;
  precio?: number | null;
  cuota_desde?: number | null;
  moneda?: string | null;
  imagen_url?: string | null;
  visible?: boolean | null;
  estado?: string | null;
};

export default function AdminVehiculosPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionType, setSectionType] = useState("autos");

  const [vehicle, setVehicle] = useState({
    sectionId: "",
    title: "",
    tipo: "auto",
    precio: "",
    cuotaDesde: "",
    moneda: "COP",
    imagen1: "",
    estado: "disponible",
  });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/vehicles?admin=1", { cache: "no-store" });
    const json = await res.json();
    setSections(json.sections ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createSection(e: FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "section", title: sectionTitle, sectionType }),
    });

    if (!res.ok) {
      const j = await res.json();
      alert(j.message || "No se pudo crear sección.");
      return;
    }

    setSectionTitle("");
    await load();
  }

  async function createVehicle(e: FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "vehicle", ...vehicle }),
    });

    if (!res.ok) {
      const j = await res.json();
      alert(j.message || "No se pudo crear vehículo.");
      return;
    }

    setVehicle({
      sectionId: "",
      title: "",
      tipo: "auto",
      precio: "",
      cuotaDesde: "",
      moneda: "COP",
      imagen1: "",
      estado: "disponible",
    });

    await load();
  }

  if (loading) return <p className="text-slate-400">Cargando vehículos...</p>;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-100">Vehículos</h1>
        <p className="text-xs text-slate-400">
          Administre autos, motos y ciclomotores de GoMotorsCo.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <form onSubmit={createSection} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Crear sección</h2>

          <input
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="Autos, Motos, Ciclomotores..."
            className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
          />

          <select
            value={sectionType}
            onChange={(e) => setSectionType(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
          >
            <option value="autos">Autos</option>
            <option value="motos">Motos</option>
            <option value="ciclomotores">Ciclomotores</option>
          </select>

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Crear sección
          </button>
        </form>

        <form onSubmit={createVehicle} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Crear vehículo</h2>

          <select
            value={vehicle.sectionId}
            onChange={(e) => setVehicle((p) => ({ ...p, sectionId: e.target.value }))}
            className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
          >
            <option value="">Seleccionar sección</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} — {s.type || "autos"}
              </option>
            ))}
          </select>

          <input
            value={vehicle.title}
            onChange={(e) => setVehicle((p) => ({ ...p, title: e.target.value }))}
            placeholder="Nombre del vehículo"
            className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
          />

          <select
            value={vehicle.tipo}
            onChange={(e) => setVehicle((p) => ({ ...p, tipo: e.target.value }))}
            className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
          >
            <option value="auto">Auto</option>
            <option value="moto">Moto</option>
            <option value="ciclomotor">Ciclomotor</option>
          </select>

          <input
            value={vehicle.precio}
            onChange={(e) => setVehicle((p) => ({ ...p, precio: e.target.value }))}
            placeholder="Precio"
            type="number"
            className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
          />

          <input
            value={vehicle.cuotaDesde}
            onChange={(e) => setVehicle((p) => ({ ...p, cuotaDesde: e.target.value }))}
            placeholder="Cuota desde"
            type="number"
            className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
          />

          <input
            value={vehicle.imagen1}
            onChange={(e) => setVehicle((p) => ({ ...p, imagen1: e.target.value }))}
            placeholder="URL imagen"
            className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
          />

          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
            Crear vehículo
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {sections.length === 0 ? (
          <p className="text-sm text-slate-400">No hay secciones creadas.</p>
        ) : (
          sections.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h2 className="text-sm font-semibold text-slate-100">
                {s.title} <span className="text-xs text-slate-500">({s.type || "autos"})</span>
              </h2>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {(s.vehicles ?? []).map((v) => (
                  <div key={v.id} className="rounded-lg border border-slate-800 bg-black/40 p-3">
                    {v.imagen_url ? (
                      <img src={v.imagen_url} alt={v.title} className="mb-3 h-32 w-full rounded-lg object-cover" />
                    ) : null}
                    <p className="font-semibold text-slate-100">{v.title}</p>
                    <p className="text-xs text-slate-500">{v.tipo} · {v.estado || "disponible"}</p>
                    <p className="mt-1 text-sm text-emerald-300">
                      {v.precio ? `${v.moneda || "COP"} ${Number(v.precio).toLocaleString("es-CO")}` : "Precio a consultar"}
                    </p>
                    {v.slug ? (
                      <a href={`/vehiculos/${v.slug}`} target="_blank" className="mt-2 inline-block text-xs text-blue-300">
                        Ver ficha pública
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
