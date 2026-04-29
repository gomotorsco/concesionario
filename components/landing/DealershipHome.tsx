import BrandHeader from "@/components/landing/BrandHeader";
import PremiumVehiclesCatalog from "@/components/landing/PremiumVehiclesCatalog";
import FinanceBrandSlider from "@/components/landing/sections/FinanceBrandSlider";
import CategoryBanners from "@/components/landing/sections/CategoryBanners";

export default function DealershipHome() {
  return (
    <main>

      <BrandHeader />
      <Hero />

      <FinanceBrandSlider />
      <CategoryBanners />

      <section id="stock" className="py-16 bg-[#f6f1e8]">
        <div className="max-w-6xl mx-auto px-5">
          <PremiumVehiclesCatalog />
        </div>
      </section>

    </main>
  );
}
