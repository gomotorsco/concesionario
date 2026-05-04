"use client";

import { useEffect, useMemo, useState } from "react";

type Vehicle = {
  title?: string;
  imagen_hero?: string | null;
  imagen_url?: string | null;
  galeria?: string[] | null;
};

export default function VehicleGallery({ vehicle }: { vehicle: Vehicle }) {
  const images = useMemo(() => {
    return Array.from(
      new Set([vehicle.imagen_hero, vehicle.imagen_url, ...(vehicle.galeria ?? [])].filter(Boolean))
    ) as string[];
  }, [vehicle]);

  const [active, setActive] = useState(images[0] || "");

  useEffect(() => {
    setActive(images[0] || "");
  }, [images[0]]);

  if (!images.length) {
    return (
      <div className="flex h-[620px] items-center justify-center rounded-[36px] bg-[#eee6da] text-[#6f675e]">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="rounded-[36px] border border-black/10 bg-[#fffdf8] p-3 shadow-[0_28px_90px_rgba(21,21,21,.14)]">
      <div className="overflow-hidden rounded-[28px]">
        <img
          src={active}
          alt={vehicle.title || "Vehículo"}
          className="h-[620px] w-full object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(img)}
              className={`shrink-0 overflow-hidden rounded-2xl border p-1 transition ${
                active === img ? "border-black bg-black" : "border-black/10 bg-white hover:border-black/40"
              }`}
            >
              <img
                src={img}
                alt={`${vehicle.title || "Vehículo"} ${index + 1}`}
                className="h-24 w-36 rounded-xl object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
