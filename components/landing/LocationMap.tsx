const address = "Cra 7 No 155 - 80 Interior 2 Oficina 122, North Point Offices, Bogotá";
const encoded = encodeURIComponent(address);

export default function LocationMap() {
  return (
    <section className="bg-[#f6f1e8] px-5 py-16">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[34px] border border-black/10 bg-[#fffdf8] p-8 shadow-[0_22px_70px_rgba(21,21,21,.08)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#8a7760]">
            Ubicación
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#151515]">
            Visítenos en North Point Offices.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#6f675e]">
            {address}
          </p>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encoded}`}
            target="_blank"
            className="mt-7 inline-flex rounded-full bg-[#151515] px-7 py-4 text-sm font-black text-white"
          >
            Abrir en Google Maps
          </a>
        </div>

        <div className="overflow-hidden rounded-[34px] border border-black/10 bg-[#fffdf8] shadow-[0_22px_70px_rgba(21,21,21,.10)]">
          <iframe
            title="Ubicación GoMotorsCo"
            src={`https://www.google.com/maps?q=${encoded}&output=embed`}
            className="h-[420px] w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
