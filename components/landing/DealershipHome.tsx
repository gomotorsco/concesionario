import BrandHeader from "@/components/landing/BrandHeader";
import PremiumVehiclesCatalog from "@/components/landing/PremiumVehiclesCatalog";
import FinanceBrandSlider from "@/components/landing/sections/FinanceBrandSlider";
import CategoryBanners from "@/components/landing/sections/CategoryBanners";

export default function DealershipHome() {
  return (
    <main className="gm-premium-shell min-h-screen">
      <BrandHeader />

      <section className="relative -mt-24 overflow-hidden pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,.10),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,.08),transparent_30%)]" />

        <div className="relative gm-premium-container grid gap-12 py-20 md:grid-cols-[0.95fr_1.05fr] md:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex w-fit items-center gap-3 rounded-full border border-[var(--gm-border)] bg-[var(--gm-soft)] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[var(--gm-accent)]" />
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--gm-muted)]">
                Stock verificado · financiación · parte de pago
              </span>
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.06em] text-[var(--gm-text)] md:text-7xl">
              Su próximo vehículo empieza con una buena decisión.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--gm-muted)]">
              Autos, motos y opciones de financiación con asesoría comercial personalizada.
              Revisamos su perfil, su cuota inicial y si cuenta con vehículo para entregar.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#stock" className="gm-premium-button px-7 py-4 text-center text-sm">
                Ver stock disponible
              </a>
              <a href="/preaprobacion" className="gm-premium-ghost px-7 py-4 text-center text-sm">
                Evaluar financiación
              </a>
            </div>
          </div>

          <div className="relative min-h-[500px]">
            <div className="absolute inset-0 rounded-[34px] p-3 gm-premium-card">
              <div className="relative h-full overflow-hidden rounded-[26px] bg-[var(--gm-soft)]">
                <img src="/hero-0km.png" alt="Vehículo GoMotorsCo" className="h-full w-full object-cover opacity-95" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/10 bg-black/70 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.30em] text-white/50">
                    Asesoría personalizada
                  </p>
                  <p className="mt-2 text-lg font-black text-white">
                    Elija, consulte y avance con información clara.
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    Inventario, financiación y seguimiento comercial desde un solo flujo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinanceBrandSlider />
      <CategoryBanners />

      <section id="stock" className="border-t border-[var(--gm-border)] bg-[var(--gm-surface)]/70">
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
