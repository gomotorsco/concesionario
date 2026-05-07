import Link from "next/link";

export function Hero() {
  return (
    <section className="relative mx-auto w-full max-w-[1680px] px-3 pt-3 sm:px-5">
      <div className="relative min-h-[78vh] overflow-hidden rounded-[34px] bg-[#efe8dc] shadow-[0_30px_90px_rgba(20,20,20,0.18)] sm:rounded-[48px] lg:min-h-[820px]">
        <img
          src="/hero-0km.png"
          alt="Vehículo premium GoMotorsCo"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />

        <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-3 sm:bottom-8 sm:left-8 sm:right-auto sm:flex-row">
          <Link
            href="#stock-auto"
            className="rounded-full bg-white px-8 py-4 text-center text-sm font-black text-[#151515] shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition hover:scale-[1.02] sm:px-10 sm:py-5 sm:text-base"
          >
            Ver vehículos
          </Link>

          <Link
            href="/preaprobacion"
            className="rounded-full border border-white/45 bg-black/35 px-8 py-4 text-center text-sm font-black text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:scale-[1.02] sm:px-10 sm:py-5 sm:text-base"
          >
            Evaluar financiación
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
