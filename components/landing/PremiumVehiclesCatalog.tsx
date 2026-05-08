"use client";

import { useEffect, useMemo, useState } from "react";

type Vehicle = any;
type Section = { vehicles: Vehicle[]; type: string };

const labels: Record<string, string> = {
  auto: "Autos",
  moto: "Motos",
  ciclomotor: "Ciclomotores",
};

const fallbackImages: Record<string, string> = {
  auto: "/category-banners/automoviles.png",
  moto: "/category-banners/motos.png",
  ciclomotor: "/category-banners/ciclomotores.png",
};

function normalizeType(value?: string | null) {
  const raw = String(value || "auto").toLowerCase();
  if (raw.includes("ciclo") || raw.includes("scooter") || raw.includes("cuatri")) return "ciclomotor";
  if (raw.includes("moto")) return "moto";
  return "auto";
}

function money(value?: number | null) {
  if (!value) return "Consultar";
  return `$ ${Number(value).toLocaleString("es-CO")}`;
}

export default function PremiumVehiclesCatalog() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeType, setActiveType] = useState<string | null>("auto");
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/vehicles", { cache: "no-store" });
    const json = await res.json();
    setSections(json.sections ?? []);
  }

  useEffect(() => {
    load();

    const readHash = () => {
      const hash = window.location.hash.replace("#stock-", "");
      if (["auto", "moto", "ciclomotor"].includes(hash)) {
        setActiveType(hash);
        setActiveBrand(null);
        setTimeout(() => document.getElementById("stock")?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    };

    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const vehicles = useMemo(() => {
    return sections.flatMap((s) =>
      (s.vehicles ?? []).map((v) => ({ ...v, tipo: normalizeType(v.tipo || s.type) }))
    );
  }, [sections]);

  const brands = useMemo(() => {
    if (!activeType) return [];
    return Array.from(new Set(
      vehicles.filter((v) => normalizeType(v.tipo) === activeType).map((v) => v.marca || "Sin marca")
    )).sort();
  }, [vehicles, activeType]);

  const selected = useMemo(() => {
    if (!activeType) return [];
    return vehicles.filter((v) => {
      const sameType = normalizeType(v.tipo) === activeType;
      const sameBrand = !activeBrand || String(v.marca || "").toLowerCase() === activeBrand.toLowerCase();
      return sameType && sameBrand;
    });
  }, [vehicles, activeType, activeBrand]);

  if (!activeType) return null;

  return (
    <section id="stock" className="bg-[#f6f1e8] px-5 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#8a7760]">
            Inventario
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#151515] md:text-5xl">
            {labels[activeType]}:
          </h2>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-[34px] border border-black/10 bg-white/75 p-4 shadow-[0_18px_60px_rgba(21,21,21,.08)]">
          <span className="px-3 text-sm font-black uppercase tracking-[0.2em] text-[#8a7760]">
            Marcas:
          </span>

          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
              className={`rounded-full px-5 py-3 text-sm font-black transition ${
                activeBrand === brand ? "bg-[#151515] text-white" : "bg-[#f6f1e8] text-[#514940] hover:bg-[#151515] hover:text-white"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {selected.map((vehicle) => {
            const img = vehicle.imagen_hero || vehicle.imagen_url || fallbackImages[activeType];

            return (
              <article key={vehicle.id} className="overflow-hidden rounded-[26px] border border-black/10 bg-[#fffdf8] shadow-[0_18px_45px_rgba(21,21,21,.08)] transition hover:-translate-y-1">
                <a href={`/vehiculos/${vehicle.slug}`} className="block">
                  <div className="h-72 overflow-hidden bg-[#eee6da]">
                    <img src={img} alt={vehicle.title} className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]" />
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8a7760]">
                      {vehicle.marca || "Marca"}
                    </p>
                    <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#151515]">
                      {vehicle.title}
                    </h3>
                    <div className="mt-5 rounded-2xl border border-black/10 bg-[#f6f1e8] p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a7760]">Precio</p>
                      <p className="mt-1 text-2xl font-black text-[#151515]">
                        {money(vehicle.precio || vehicle.cuota_desde)}
                      </p>
                    </div>
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
