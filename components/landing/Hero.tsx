import Link from "next/link";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f4efe5]">
      <div className="relative h-[72vh] min-h-[420px] w-full overflow-hidden md:h-[92vh] md:min-h-[760px]">

        {/* MOBILE */}
        <img
          src="/hero-mobile.png"
          alt="GoMotorsCo Mobile Hero"
          className="absolute inset-0 h-full w-full object-cover object-center md:hidden"
        />

        {/* DESKTOP */}
        <img
          src="/hero-0km.png"
          alt="GoMotorsCo Hero"
          className="absolute inset-0 hidden h-full w-full object-contain object-center bg-[#f4efe5] md:block"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/38 via-black/8 to-black/12" />

        <div className="absolute bottom-8 left-5 right-5 grid grid-cols-2 gap-3 sm:left-10 sm:right-auto sm:flex">
          <Link
            href="#stock-auto"
            className="rounded-full bg-white px-5 py-3.5 text-center text-[13px] font-black tracking-[0.02em] text-[#151515] shadow-[0_20px_70px_rgba(0,0,0,0.30)] transition hover:scale-[1.02] sm:px-10 sm:py-5 sm:text-base"
          >
            Ver vehículos
          </Link>

          <Link
            href="/preaprobacion"
            className="rounded-full border border-white/55 bg-black/35 px-5 py-3.5 text-center text-[13px] font-black tracking-[0.02em] text-white shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:scale-[1.02] sm:px-10 sm:py-5 sm:text-base"
          >
            Evaluar
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
