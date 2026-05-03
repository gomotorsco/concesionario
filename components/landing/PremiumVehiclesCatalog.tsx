"use client";

import { useEffect, useMemo, useState } from "react";

type Vehicle = {
  id: number;
  title: string;
  marca?: string | null;
  modelo?: string | null;
  slug?: string | null;
  precio?: number | null;
  cuota_desde?: number | null;
  moneda?: string | null;
  imagen_url?: string | null;
  imagen_hero?: string | null;
  tipo?: string | null;
};

type Section = {
  id: number;
  title: string;
  slug: string;
  type: string;
  vehicles: Vehicle[];
};

const typeLabels: Record<string, string> = {
  auto: "Autos",
  moto: "Motos",
  ciclomotor: "Ciclomotores",
};

function money(value?: number | null) {
  if (!value) return "Consultar";
  return `$ ${Number(value).toLocaleString("es-CO")}`;
}

function normalizeType(value?: string | null) {
  const raw = String(value || "auto").toLowerCase();
  if (raw.includes("moto")) return "moto";
  if (raw.includes("ciclo") || raw.includes("scooter") || raw.includes("cuatri")) return "ciclomotor";
  return "auto";
}

export default function PremiumVehiclesCatalog() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/vehicles", { cache: "no-store" });
    const json = await res.json();
    setSections(json.sections ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();

    const readHash = () => {
      const hash = window.location.hash.replace("#stock-", "");
      if (["auto", "moto", "ciclomotor"].includes(hash)) {
        setActiveType(hash);
        setActiveBrand(null);
      }
    };

    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const vehicles = useMemo(() => {
    return sections.flatMap((section) =>
      (section.vehicles ?? []).map((vehicle) => ({
        ...vehicle,
        tipo: normalizeType(vehicle.tipo || section.type),
      }))
    );
  }, [sections]);

  const selectedVehicles = useMemo(() => {
    if (!activeType) return [];

    return vehicles.filter((v) => {
      const sameType = normalizeType(v.tipo) === activeType;
      const sameBrand = !activeBrand || String(v.marca || "").toLowerCase() === activeBrand.toLowerCase();
      return sameType && sameBrand;
    });
  }, [vehicles, activeType, activeBrand]);

  const brands = useMemo(() => {
    if (!activeType) return [];

    return Array.from(
      new Set(
        vehicles
          .filter((v) => normalizeType(v.tipo) === activeType)
          .map((v) => v.marca || "Sin marca")
      )
    ).sort();
  }, [vehicles, activeType]);

  return (
    <section id="stock" className="scroll-mt-28">
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#8a7760]">
          Inventario
        </p>
        <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#151515] md:text-5xl">
          Seleccione una categoría.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#6f675e]">
          Primero elija autos, motos o ciclomotores. Luego filtre por marca y revise las opciones disponibles.
        </p>
      </div>

      <div className="mb-8 rounded-[34px] border border-black/10 bg-white/72 p-4 shadow-[0_18px_60px_rgba(21,21,21,.08)] backdrop-blur">
        <div className="flex flex-wrap gap-3">
          {["auto", "moto", "ciclomotor"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveType(type);
                setActiveBrand(null);
              }}
              className={`rounded-full px-7 py-4 text-sm font-black transition ${
                activeType === type
                  ? "bg-[#151515] text-white shadow-xl"
                  : "bg-[#f6f1e8] text-[#514940] hover:bg-[#151515] hover:text-white"
              }`}
            >
              {typeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {!activeType ? (
        <div className="rounded-[34px] border border-black/10 bg-[#fffdf8] p-8 text-center shadow-[0_18px_60px_rgba(21,21,21,.08)]">
          <h3 className="text-2xl font-black tracking-[-0.04em] text-[#151515]">
            El inventario se mostrará al seleccionar una categoría.
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#6f675e]">
            Así el catálogo se mantiene limpio y el cliente navega por intención: automóviles, motos o movilidad ligera.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-center gap-3 rounded-[34px] border border-black/10 bg-white/72 p-4 shadow-[0_18px_60px_rgba(21,21,21,.08)] backdrop-blur">
            <span className="px-3 text-sm font-black uppercase tracking-[0.2em] text-[#8a7760]">
              Marcas:
            </span>

            {brands.length === 0 ? (
              <span className="text-sm font-bold text-[#6f675e]">No hay marcas cargadas todavía.</span>
            ) : (
              brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
                  className={`rounded-full px-5 py-3 text-sm font-black transition ${
                    activeBrand === brand
                      ? "bg-[#151515] text-white"
                      : "bg-[#f6f1e8] text-[#514940] hover:bg-[#151515] hover:text-white"
                  }`}
                >
                  {brand}
                </button>
              ))
            )}
          </div>

          {loading ? (
            <p className="text-[#6f675e]">Cargando inventario...</p>
          ) : selectedVehicles.length === 0 ? (
            <div className="rounded-[34px] border border-black/10 bg-[#fffdf8] p-8 text-center">
              <p className="text-lg font-black text-[#151515]">No hay unidades cargadas para esta selección.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {selectedVehicles.map((vehicle) => (
                <article
                  key={vehicle.id}
                  className="overflow-hidden rounded-[32px] border border-black/10 bg-[#fffdf8] shadow-[0_22px_70px_rgba(21,21,21,.10)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(21,21,21,.16)]"
                >
                  <a href={`/vehiculos/${vehicle.slug}`} className="block">
                    <div className="h-64 overflow-hidden bg-[#eee6da]">
                      {vehicle.imagen_hero || vehicle.imagen_url ? (
                        <img
                          src={vehicle.imagen_hero || vehicle.imagen_url || ""}
                          alt={vehicle.title}
                          className="h-full w-full object-cover transition duration-700 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-bold text-[#8a7760]">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8a7760]">
                        {vehicle.marca || "Marca"}
                      </p>
                      <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#151515]">
                        {vehicle.title}
                      </h3>
                      <p className="mt-3 text-sm text-[#6f675e]">
                        {[vehicle.modelo].filter(Boolean).join(" · ") || "Modelo disponible"}
                      </p>

                      <div className="mt-5 rounded-2xl border border-black/10 bg-[#f6f1e8] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a7760]">
                          Precio
                        </p>
                        <p className="mt-1 text-2xl font-black text-[#151515]">
                          {money(vehicle.precio || vehicle.cuota_desde)}
                        </p>
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
