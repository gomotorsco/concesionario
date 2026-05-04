"use client";

import { useState } from "react";

export default function VehicleGallery({ vehicle }) {
  const images = [
    vehicle.imagen_hero,
    ...(vehicle.galeria || []),
  ].filter(Boolean);

  const [active, setActive] = useState(images[0]);

  return (
    <div>

      <img
        src={active}
        className="h-[500px] w-full rounded-2xl object-cover"
      />

      <div className="mt-3 flex gap-2 overflow-x-auto">
        {images.map((img) => (
          <img
            key={img}
            src={img}
            onClick={() => setActive(img)}
            className={`h-20 w-28 cursor-pointer rounded-lg object-cover ${
              active === img ? "border-2 border-white" : ""
            }`}
          />
        ))}
      </div>

    </div>
  );
}
