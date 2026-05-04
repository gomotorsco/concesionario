"use client";

import { useMemo, useState } from "react";

export default function VehicleGallery({
  title,
  hero,
  gallery,
}: {
  title: string;
  hero?: string | null;
  gallery?: string[] | null;
}) {
  const images = useMemo(() => {
    return Array.from(new Set([hero, ...(gallery ?? [])].filter(Boolean))) as string[];
  }, [hero, gallery]);

  const [active, setActive] = useState(images[0] || "");

  if (!images.length) {
    return (
      <div className="flex h-[560px] items-center justify-center rounded-[28px] bg-[#eee6da] text-[#6f675e]">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[30px] border border-black/10 bg-[#fffdf8] p-3 shadow-[0_24px_70px_rgba(21,21,21,.12)]">
        <img
          src={active}
          alt={title}
          className="h-[560px] w-full rounded-[22px] object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
          {images.map((img) => (
            <button
              key={img}
              onClick={() => setActive(img)}
              className={`overflow-hidden rounded-2xl border p-1 ${
                active === img ? "border-black bg-black" : "border-black/10 bg-white"
              }`}
            >
              <img src={img} alt={title} className="h-24 w-full rounded-xl object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
