"use client";

const brands = [
  { name: "Toyota", logo: "https://cdn.worldvectorlogo.com/logos/toyota.svg" },
  { name: "Renault", logo: "https://cdn.worldvectorlogo.com/logos/renault-5.svg" },
  { name: "Chevrolet", logo: "https://cdn.worldvectorlogo.com/logos/chevrolet.svg" },
  { name: "Hyundai", logo: "https://cdn.worldvectorlogo.com/logos/hyundai-2.svg" },
  { name: "BMW", logo: "https://cdn.worldvectorlogo.com/logos/bmw.svg" },
  { name: "Honda", logo: "https://cdn.worldvectorlogo.com/logos/honda-automobiles.svg" },
  { name: "Yamaha", logo: "https://cdn.worldvectorlogo.com/logos/yamaha-2.svg" },
  { name: "Suzuki", logo: "https://cdn.worldvectorlogo.com/logos/suzuki.svg" },
];

export default function FinanceBrandSlider() {
  const loop = [...brands, ...brands];

  return (
    <section className="py-10 bg-[#f6f1e8]">
      <div className="max-w-6xl mx-auto px-5">

        <div className="overflow-hidden border-t border-[#e6ded2] pt-6">
          <div className="flex w-max gap-16 animate-[gmSlow_70s_linear_infinite] items-center">

            {loop.map((brand, i) => (
              <div key={i} className="w-[120px] h-[50px] flex items-center justify-center">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-[28px] object-contain grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition"
                />
              </div>
            ))}

          </div>
        </div>

      </div>
    </section>
  );
}
