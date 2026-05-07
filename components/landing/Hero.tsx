export default function Hero() {
  return (
    <section className="relative mx-auto w-full max-w-[1700px] px-3 pt-3 sm:px-5">
      <div className="relative min-h-[82vh] overflow-hidden rounded-[42px] bg-[#efe8dc] shadow-[0_30px_90px_rgba(0,0,0,0.18)] lg:min-h-[860px]">
        <img
          src="/hero-0km.png"
          alt="GoMotorsCo"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-[1.12]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3 sm:bottom-10 sm:left-10 sm:right-auto sm:flex-row">
          <a
            href="#stock-auto"
            className="rounded-full bg-white px-9 py-5 text-center text-base font-black text-black shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition hover:scale-[1.02]"
          >
            Ver vehículos
          </a>

          <a
            href="/preaprobacion"
            className="rounded-full border border-white/30 bg-black/20 px-9 py-5 text-center text-base font-black text-white backdrop-blur-md transition hover:scale-[1.02]"
          >
            Evaluar financiación
          </a>
        </div>
      </div>
    </section>
  );
}
