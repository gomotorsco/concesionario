export default function Hero() {
  return (
    <section className="relative -mt-20">

      <img
        src="/hero-0km.png"
        className="w-full h-[640px] object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-2xl px-6 md:px-12">

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-[-0.06em]">
            Encuentre su vehículo hoy
          </h1>

          <p className="mt-5 text-lg text-white/80">
            Autos, motos y financiación con asesoría real.
          </p>

          <div className="mt-7 flex gap-3">
            <a href="#stock" className="bg-white text-black px-6 py-3 rounded-full font-bold">
              Ver vehículos
            </a>

            <a href="/preaprobacion" className="border border-white/30 text-white px-6 py-3 rounded-full font-bold">
              Evaluar crédito
            </a>
          </div>

        </div>
      </div>

    </section>
  );
}
