import Link from "next/link";

export function Hero() {
  return (
    <section className="relative mx-auto w-full max-w-none px-0 pt-0">
      <div className="relative min-h-[82vh] overflow-hidden bg-[#efe8dc] lg:min-h-[760px]">
        <img
          src="/hero-0km.png"
          alt="Vehículo premium GoMotorsCo"
          className="absolute inset-0 h-full w-full object-contain object-center bg-[#efe8dc] brightness-[1.08]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent" />

        <div className="absolute bottom-8 left-4 right-4 grid grid-cols-2 gap-3 sm:bottom-10 sm:left-10 sm:right-auto sm:flex sm:w-auto">
          <Link
            href="#stock-auto"
            className="rounded-full bg-white px-5 py-4 text-center text-sm font-black text-[#151515] shadow-[0_20px_70px_rgba(0,0,0,0.30)] ring-1 ring-black/5 transition hover:scale-[1.02] sm:px-10 sm:py-5 sm:text-base"
          >
            Ver vehículos
          </Link>

          <Link
            href="/preaprobacion"
            className="rounded-full border border-white/55 bg-black/30 px-5 py-4 text-center text-sm font-black text-white shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:scale-[1.02] sm:px-10 sm:py-5 sm:text-base"
          >
            Evaluar
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
