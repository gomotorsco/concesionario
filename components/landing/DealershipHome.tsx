import Hero from "@/components/landing/Hero";
import BrandHeader from "@/components/landing/BrandHeader";
import PremiumVehiclesCatalog from "@/components/landing/PremiumVehiclesCatalog";
import FinanceBrandSlider from "@/components/landing/sections/FinanceBrandSlider";
import CategoryBanners from "@/components/landing/sections/CategoryBanners";
import LocationMap from "@/components/landing/LocationMap";
import Footer from "@/components/landing/Footer";

export default function DealershipHome() {
  return (
    <main className="gm-premium-shell min-h-screen">
      <section className="relative overflow-hidden"><BrandHeader />
        <Hero />

        </section>

      <FinanceBrandSlider />
      <CategoryBanners />

      <section id="stock" className="border-t border-[var(--gm-border)] bg-[rgba(255,253,248,.58)]">
        <div className="gm-premium-container py-24">
          <PremiumVehiclesCatalog />
        </div>
      </section>
          <LocationMap />
      <Footer />
    </main>
  );
}
