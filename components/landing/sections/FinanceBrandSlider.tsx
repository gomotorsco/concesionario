const brands = [
  "FORD",
  "HYUNDAI",
  "AUDI",
  "VOLVO",
  "SEAT",
  "KIA",
  "RENAULT",
  "CHEVROLET",
  "YAMAHA",
  "HONDA",
];

export default function FinanceBrandSlider() {
  const list = [...brands, ...brands];

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

        <div className="border-t border-[var(--gm-border)] py-6">
          <div className="flex w-max gap-14 gm-brand-slider">
            {list.map((brand, idx) => (
              <span
                key={`${brand}-${idx}`}
                className="text-2xl font-black tracking-[-0.04em] text-[var(--gm-muted)] opacity-75"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
