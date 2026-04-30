import BrandHeader from "@/components/landing/BrandHeader";
import PremiumVehiclesCatalog from "@/components/landing/PremiumVehiclesCatalog";
import FinanceBrandSlider from "@/components/landing/sections/FinanceBrandSlider";
import CategoryBanners from "@/components/landing/sections/CategoryBanners";

export default function DealershipHome() {
  return (
    <main className="gm-premium-shell min-h-screen">
      <section className="relative overflow-hidden">
        <img
          src="/hero-0km.png"
          alt="GoMotorsCo"
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.72)_0%,rgba(0,0,0,.50)_38%,rgba(0,0,0,.15)_68%,rgba(0,0,0,.05)_100%)]" />

        <BrandHeader />

        <div className="relative mx-auto flex min-h-[640px] max-w-7xl items-start px-6 pt-28 md:px-10 md:pt-32">
          <div className="max-w-3xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
              GoMotorsCo · Grupo Automotor
            </span>

            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] text-white md:text-6xl">
              Encuentre su próximo vehículo en GoMotorsCo.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 md:text-lg">
              Autos, motos y opciones de financiación con asesoría comercial personalizada.
              Evaluamos su perfil y le acompañamos en el proceso.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#stock"
                className="rounded-2xl bg-white px-7 py-3.5 text-center text-sm font-bold text-black transition hover:bg-white/90"
              >
                Ver vehículos
              </a>

              <a
                href="/preaprobacion"
                className="rounded-2xl border border-white/35 bg-white/8 px-7 py-3.5 text-center text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                Evaluar financiación
              </a>
            </div>
          </div>
        </div>
      </section>

      <FinanceBrandSlider />
      <CategoryBanners />

      <section id="stock" className="border-t border-[var(--gm-border)] bg-[rgba(255,253,248,.58)]">
        <div className="gm-premium-container py-16">
          <PremiumVehiclesCatalog />
        </div>
      </section>
    </main>
  );
}
