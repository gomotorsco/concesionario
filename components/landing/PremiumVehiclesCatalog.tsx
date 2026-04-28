"use client";

import { useEffect, useMemo, useState } from "react";

type Vehicle = {
  id: number;
  title: string;
  slug?: string | null;
  tipo?: string | null;
  marca?: string | null;
  modelo?: string | null;
  anio?: number | null;
  km?: number | null;
  precio?: number | null;
  cuota_desde?: number | null;
  moneda?: string | null;
  estado?: string | null;
  destacado?: boolean | null;
  imagen_url?: string | null;
};

type Section = {
  id: number;
  title: string;
  slug?: string | null;
  type?: string | null;
  vehicles: Vehicle[];
};

function normalizeType(type?: string | null) {
  const value = (type || "").toLowerCase();
  if (value.includes("moto")) return "motos";
  if (value.includes("ciclo")) return "ciclomotores";
  if (value.includes("auto") || value.includes("camioneta")) return "autos";
  return value || "otros";
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    todos: "Todos",
    autos: "Autos",
    motos: "Motos",
    ciclomotores: "Ciclomotores",
    otros: "Otros",
  };
  return labels[type] ?? type;
}

function makeSlugFallback(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function money(value?: number | null, moneda?: string | null) {
  if (!value) return "Consultar";
  return `${moneda ?? "$"} ${Number(value).toLocaleString("es-CO")}`;
}

export default function PremiumVehiclesCatalog() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeType, setActiveType] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/vehicles", { cache: "no-store" });
        const json = await res.json();
        setSections(json.sections ?? []);
      } catch (err) {
        console.error("Error cargando catálogo:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const flatVehicles = useMemo(() => {
    return sections.flatMap((section) => {
      const sectionType = normalizeType(section.type || section.title);
      return (section.vehicles ?? []).map((vehicle) => ({
        ...vehicle,
        sectionTitle: section.title,
        sectionType: normalizeType(vehicle.tipo || sectionType),
      }));
    });
  }, [sections]);

  const tabs = useMemo(() => {
    const found = Array.from(new Set(flatVehicles.map((v: any) => v.sectionType)));
    const ordered = ["autos", "motos", "ciclomotores", "otros"].filter((x) => found.includes(x));
    return ["todos", ...ordered];
  }, [flatVehicles]);

  const vehicles = useMemo(() => {
    if (activeType === "todos") return flatVehicles;
    return flatVehicles.filter((v: any) => v.sectionType === activeType);
  }, [activeType, flatVehicles]);

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-black/10 bg-white p-10 text-sm text-black/50">
        Cargando stock disponible...
      </div>
    );
  }

  if (flatVehicles.length === 0) {
    return (
      <div className="rounded-[2rem] border border-black/10 bg-white p-10">
        <p className="text-xl font-black text-[#111]">Todavía no hay vehículos cargados.</p>
        <p className="mt-2 text-sm text-black/55">
          Cargá autos, motos o ciclomotores desde el panel de administración.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-9">
      <div className="rounded-full border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveType(tab)}
              className={`whitespace-nowrap rounded-full px-6 py-3 text-sm font-black transition ${
                activeType === tab
                  ? "bg-[#151515] text-white shadow-[0_16px_35px_rgba(0,0,0,0.18)]"
                  : "text-black/55 hover:bg-black/5 hover:text-black"
              }`}
            >
              {typeLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle: any) => {
          const slug = vehicle.slug || makeSlugFallback(vehicle.title);
          const estado = vehicle.estado || "disponible";
          const price = vehicle.precio || vehicle.cuota_desde;

          return (
            <article
              key={vehicle.id}
              className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_35px_90px_rgba(0,0,0,0.14)]"
            >
              <a href={`/vehiculos/${slug}`} className="block">
                <div className="relative h-64 overflow-hidden bg-[#e9e3d8]">
                  {vehicle.imagen_url ? (
                    <img
                      src={vehicle.imagen_url}
                      alt={vehicle.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-black/35">
                      Sin imagen
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black backdrop-blur">
                      {typeLabel(vehicle.sectionType)}
                    </span>

                    {vehicle.destacado ? (
                      <span className="rounded-full bg-[#c6a15b] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black">
                        Destacado
                      </span>
                    ) : null}
                  </div>

                  <span
                    className={`absolute bottom-4 left-4 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                      estado === "vendido"
                        ? "bg-red-600 text-white"
                        : estado === "reservado"
                        ? "bg-[#c6a15b] text-black"
                        : "bg-emerald-500 text-black"
                    }`}
                  >
                    {estado}
                  </span>
                </div>
              </a>

              <div className="space-y-5 p-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#8b6f3e]">
                    {vehicle.sectionTitle}
                  </p>

                  <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#111]">
                    {vehicle.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-black/45">
                    {vehicle.anio ? <span>{vehicle.anio}</span> : null}
                    {vehicle.km ? <span>{Number(vehicle.km).toLocaleString("es-CO")} km</span> : null}
                    {vehicle.marca ? <span>{vehicle.marca}</span> : null}
                    {vehicle.modelo ? <span>{vehicle.modelo}</span> : null}
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 bg-[#f7f3ea] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/35">
                    {vehicle.precio ? "Precio" : "Desde"}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#111]">
                    {money(price, vehicle.moneda)}
                  </p>
                </div>

                <div className="grid gap-2">
                  <a
                    href={`/vehiculos/${slug}`}
                    className="rounded-full bg-[#151515] px-4 py-3 text-center text-sm font-black text-white hover:bg-[#2a2a2a]"
                  >
                    Ver detalle completo
                  </a>

                  <a
                    href={`/preaprobacion?vehiculo=${encodeURIComponent(vehicle.title)}`}
                    className="rounded-full border border-black/15 px-4 py-3 text-center text-sm font-black text-black hover:bg-[#c6a15b] hover:border-[#c6a15b]"
                  >
                    Evaluar financiación
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
