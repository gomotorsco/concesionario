import BrandHeader from "@/components/landing/BrandHeader";
import PremiumVehiclesCatalog from "@/components/landing/PremiumVehiclesCatalog";
import FinanceBrandSlider from "@/components/landing/sections/FinanceBrandSlider";
import CategoryBanners from "@/components/landing/sections/CategoryBanners";

export default function DealershipHome(){
  return (
    <main className="gm-premium-shell min-h-screen">
      <section className="relative overflow-hidden">
        <img
          src="/hero-0km.png"
          alt="GoMotorsCo"
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent" />

        <BrandHeader />

        <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-6 pt-32 md:px-10">
          <div className="max-w-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/60">
              GoMotorsCo  Grupo Automotor
            </span>

            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">
              Encuentre su próximo vehículo hoy.
            </h1>

            <p className="mt-6 text-base leading-relaxed text-white/75 md:text-lg">
              Autos, motos y opciones de financiación con asesoría comercial personalizada.
              Evaluamos su perfil y le acompañamos en todo el proceso.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#stock"
                className="rounded-full bg-white px-8 py-4 text-center text-sm font-semibold tracking-wide text-black transition hover:opacity-90"
              >
                Ver vehículos disponibles
              </a>

              <a
                href="/preaprobacion"
                className="rounded-full border border-white/30 px-8 py-4 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
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
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--gm-muted)]">
                Inventario GoMotorsCo
              </p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.05em] text-[var(--gm-text)] md:text-5xl">
                Elija según lo que necesita.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--gm-muted)]">
                Filtre por autos, motos o ciclomotores. Revise detalles, solicite preaprobación
                o hable con un asesor comercial.
              </p>
            </div>

            <a href="/preaprobacion" className="gm-premium-ghost px-6 py-3 text-center text-sm">
              Solicitar evaluación
            </a>
          </div>

          <PremiumVehiclesCatalog />
        </div>
      </section>
    </main>
  );
}
