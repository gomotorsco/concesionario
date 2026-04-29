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
          className="absolute inset-0 h-full w-full object-cover scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent" />

        <BrandHeader />

        REPLACE_HERO

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
