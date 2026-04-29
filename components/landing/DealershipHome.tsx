import BrandHeader from "@/components/landing/BrandHeader";
import PremiumVehiclesCatalog from "@/components/landing/PremiumVehiclesCatalog";
import FinanceBrandSlider from "@/components/landing/sections/FinanceBrandSlider";
import CategoryBanners from "@/components/landing/sections/CategoryBanners";

export default function DealershipHome() {
  return (
    <main className="gm-premium-shell min-h-screen">
      <BrandHeader />

      <section className="relative -mt-14 overflow-hidden pt-24">
        <div className="relative gm-premium-container py-10 md:py-20">
          <div className="relative overflow-hidden rounded-[34px] border border-[var(--gm-border)] shadow-[0_30px_90px_rgba(21,21,21,.16)]">
            <img
              src="/hero-0km.png"
              alt="Vehículo GoMotorsCo"
              className="h-[620px] w-full object-cover md:h-[650px]"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/38 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:hidden" />

            <div className="absolute inset-0 flex items-center">
              <div className="max-w-3xl px-6 md:px-12">
                <div className="mb-6 flex w-fit items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-[#fffdf8]" />
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                    Stock verificado · financiación · parte de pago
                  </span>
                </div>

                <h1 className="gm-title max-w-3xl text-5xl text-white md:text-7xl">
                  Encuentre su próximo vehículo hoy.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-white/74 md:text-lg md:leading-8">
                  Autos, motos y opciones de financiación con asesoría comercial personalizada.
                  Revisamos su perfil, su cuota inicial y si cuenta con vehículo para entregar.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href="#stock" className="rounded-full bg-[#fffdf8] px-7 py-4 text-center text-sm font-black text-[#151515]">
                    Ver stock disponible
                  </a>
                  <a href="/preaprobacion" className="rounded-full border border-white/25 bg-white/10 px-7 py-4 text-center text-sm font-black text-white backdrop-blur hover:bg-white/15">
                    Evaluar financiación
                  </a>
                </div>
              </div>
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
