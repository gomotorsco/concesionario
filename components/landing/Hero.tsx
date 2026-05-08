import Link from "next/link";

export function Hero() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#efe8dc]">
      <div className="relative h-[760px] w-screen overflow-hidden">
        <img
          src="/hero-0km.png"
          alt="Vehículo premium GoMotorsCo"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-[1.02]"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/16 via-transparent to-transparent" />

        <div className="absolute bottom-10 left-10 z-10 flex gap-4">
          <Link
            href="#stock-auto"
            className="rounded-full bg-white px-8 py-4 text-sm font-black text-[#151515] shadow-[0_18px_60px_rgba(0,0,0,0.18)] transition hover:scale-[1.02]"
          >
            Ver vehículos
          </Link>

          <Link
            href="/preaprobacion"
            className="rounded-full border border-white/30 bg-black/35 px-8 py-4 text-sm font-black text-white backdrop-blur-xl transition hover:scale-[1.02]"
          >
            Evaluar
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
