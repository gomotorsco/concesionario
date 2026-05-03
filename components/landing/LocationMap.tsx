const address = "Cra 7 No 155 - 80 Interior 2 Oficina 122, North Point Offices, Bogotá";
const encoded = encodeURIComponent(address);

export default function LocationMap() {
  return (
    <section className="bg-[#151515] px-5 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-white/40">
            Ubicación
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-5xl">
            Estamos en North Point Offices, Bogotá.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/65">{address}</p>
        </div>

        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-3 shadow-[0_30px_100px_rgba(0,0,0,.35)]">
          <iframe
            title="Ubicación GoMotorsCo"
            src={`https://www.google.com/maps?q=${encoded}&output=embed`}
            className="h-[460px] w-full rounded-[28px]"
            loading="lazy"
          />
        </div>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encoded}`}
          target="_blank"
          className="mt-7 inline-flex rounded-full bg-white px-7 py-4 text-sm font-black text-[#151515]"
        >
          Abrir en Google Maps
        </a>
      </div>
    </section>
  );
}
