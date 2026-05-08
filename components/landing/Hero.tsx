import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#efe8dc]">
      <div className="relative h-[720px] overflow-hidden lg:h-[760px]">
        <img
          src="/hero-0km.png"
          alt="Vehículo premium GoMotorsCo"
          className="absolute inset-0 h-full w-full scale-[1.06] object-cover object-center brightness-[1.02]"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/12 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1720px] items-end px-5 pb-8 md:px-10 md:pb-12">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="#stock-auto"
                className="rounded-full bg-white px-7 py-3 text-sm font-black text-[#151515] shadow-[0_18px_60px_rgba(0,0,0,0.18)] transition hover:scale-[1.02]"
              >
                Ver vehículos
              </Link>

              <Link
                href="/preaprobacion"
                className="rounded-full border border-white/25 bg-black/28 px-7 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:scale-[1.02]"
              >
                Evaluar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
