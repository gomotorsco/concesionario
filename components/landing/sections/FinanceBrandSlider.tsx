"use client";

import { useState } from "react";

const brands = [
  { name: "Ford", logo: "https://logo.clearbit.com/ford.com" },
  { name: "Hyundai", logo: "https://logo.clearbit.com/hyundai.com" },
  { name: "Audi", logo: "https://logo.clearbit.com/audi.com" },
  { name: "Volvo", logo: "https://logo.clearbit.com/volvocars.com" },
  { name: "SEAT", logo: "https://logo.clearbit.com/seat.com" },
  { name: "Kia", logo: "https://logo.clearbit.com/kia.com" },
  { name: "Renault", logo: "https://logo.clearbit.com/renault.com" },
  { name: "Chevrolet", logo: "https://logo.clearbit.com/chevrolet.com" },
  { name: "Yamaha", logo: "https://logo.clearbit.com/yamaha-motor.com" },
  { name: "Honda", logo: "https://logo.clearbit.com/honda.com" },
];

function BrandLogo({ name, logo }: { name: string; logo: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-12 min-w-[150px] items-center justify-center rounded-2xl border border-[var(--gm-border)] bg-[var(--gm-soft)] px-5">
      {failed ? (
        <span className="text-sm font-black uppercase tracking-[0.18em] text-[var(--gm-muted)]">
          {name}
        </span>
      ) : (
        <img
          src={logo}
          alt={name}
          onError={() => setFailed(true)}
          className="max-h-7 max-w-[110px] object-contain grayscale opacity-70 transition hover:grayscale-0 hover:opacity-100"
        />
      )}
    </div>
  );
}

export default function FinanceBrandSlider() {
  const loop = [...brands, ...brands];

  return (
    <section className="gm-premium-container py-10">
      <div className="overflow-hidden rounded-[28px] border border-[var(--gm-border)] bg-[var(--gm-surface)] shadow-[0_24px_70px_rgba(0,0,0,.18)]">
        <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl text-xl font-semibold tracking-[-0.03em] text-[var(--gm-text)] md:text-2xl">
            Encuentre opciones según su presupuesto y capacidad de pago.
          </p>

          <a href="/preaprobacion" className="gm-premium-button px-6 py-3 text-center text-sm">
            Iniciar evaluación
          </a>
        </div>

        <div className="overflow-hidden border-t border-[var(--gm-border)] py-6">
          <div className="flex w-max gap-5 animate-[gmSlow_55s_linear_infinite]">
            {loop.map((brand, idx) => (
              <BrandLogo key={`${brand.name}-${idx}`} {...brand} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
