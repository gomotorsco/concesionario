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
        console.error("Error cargando catálogo premium:", err);
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
      <div className="rounded-3xl border border-white/10 bg-black/40 p-8 text-sm text-zinc-400">
        Cargando vehículos disponibles...
      </div>
    );
  }

  if (flatVehicles.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/40 p-8">
        <p className="text-lg font-semibold text-white">Todavía no hay vehículos cargados.</p>
        <p className="mt-2 text-sm text-zinc-400">
          Cargá autos, motos o ciclomotores desde el panel de administración.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveType(tab)}
            className={`whitespace-nowrap rounded-full border px-5 py-2 text-sm font-semibold transition ${
              activeType === tab
                ? "border-blue-500 bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.35)]"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            {typeLabel(tab)}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle: any) => {
          const slug = vehicle.slug || makeSlugFallback(vehicle.title);
          const price = vehicle.precio || vehicle.cuota_desde;
          const priceLabel = vehicle.precio ? "Precio" : "Desde";
          const estado = vehicle.estado || "disponible";

          return (
            <article
              key={vehicle.id}
              className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-black shadow-xl transition hover:-translate-y-1 hover:border-blue-500/40"
            >
              <a href={`/vehiculos/${slug}`} className="block">
                <div className="relative h-56 overflow-hidden bg-zinc-900">
                  {vehicle.imagen_url ? (
                    <img
                      src={vehicle.imagen_url}
                      alt={vehicle.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                      Sin imagen
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-full bg-black/75 px-3 py-1 text-[10px] font-bold uppercase text-white backdrop-blur">
                      {typeLabel(vehicle.sectionType)}
                    </span>

                    {vehicle.destacado ? (
                      <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase text-white">
                        Destacado
                      </span>
                    ) : null}
                  </div>

                  <span
                    className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                      estado === "vendido"
                        ? "bg-red-500/90 text-white"
                        : estado === "reservado"
                        ? "bg-amber-500/90 text-black"
                        : "bg-emerald-500/90 text-black"
                    }`}
                  >
                    {estado}
                  </span>
                </div>
              </a>

              <div className="space-y-4 p-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    {vehicle.sectionTitle}
                  </p>
                  <h3 className="mt-1 text-xl font-black text-white">{vehicle.title}</h3>

                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                    {vehicle.anio ? <span>{vehicle.anio}</span> : null}
                    {vehicle.km ? <span>{Number(vehicle.km).toLocaleString("es-CO")} km</span> : null}
                    {vehicle.marca ? <span>{vehicle.marca}</span> : null}
                    {vehicle.modelo ? <span>{vehicle.modelo}</span> : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] text-zinc-500">{priceLabel}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-300">
                    {price
                      ? `${vehicle.moneda ?? "COP"} ${Number(price).toLocaleString("es-CO")}`
                      : "Consultar"}
                  </p>
                </div>

                <div className="grid gap-2">
                  <a
                    href={`/vehiculos/${slug}`}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-500"
                  >
                    Ver vehículo
                  </a>

                  <a
                    href={`/preaprobacion?vehiculo=${encodeURIComponent(vehicle.title)}`}
                    className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-center text-sm font-bold text-blue-100 hover:bg-blue-500/20"
                  >
                    Solicitar preaprobación
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
