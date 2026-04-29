"use client";

const brands = [
  { name: "Ford", logo: "https://cdn.worldvectorlogo.com/logos/ford-1.svg" },
  { name: "Audi", logo: "https://cdn.worldvectorlogo.com/logos/audi-4.svg" },
  { name: "Toyota", logo: "https://cdn.worldvectorlogo.com/logos/toyota.svg" },
  { name: "Chevrolet", logo: "https://cdn.worldvectorlogo.com/logos/chevrolet.svg" },
  { name: "Hyundai", logo: "https://cdn.worldvectorlogo.com/logos/hyundai-2.svg" },
  { name: "Kia", logo: "https://cdn.worldvectorlogo.com/logos/kia-4.svg" },
  { name: "Renault", logo: "https://cdn.worldvectorlogo.com/logos/renault-5.svg" },
  { name: "BMW", logo: "https://cdn.worldvectorlogo.com/logos/bmw.svg" },
  { name: "Honda", logo: "https://cdn.worldvectorlogo.com/logos/honda-automobiles.svg" },
  { name: "Yamaha", logo: "https://cdn.worldvectorlogo.com/logos/yamaha-2.svg" },
];

export default function FinanceBrandSlider() {
  const loop = [...brands, ...brands];

  return (
    <section className="py-10 bg-[#f6f1e8]">
      <div className="max-w-6xl mx-auto px-5">

        {/* TEXTO */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <p className="text-xl md:text-2xl font-semibold text-[#151515]">
            Encuentre opciones según su presupuesto y capacidad de pago.
          </p>

          <a
            href="/preaprobacion"
            className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold"
          >
            Iniciar evaluación
          </a>
        </div>

        {/* SLIDER */}
        <div className="overflow-hidden border-t border-[#e6ded2] pt-6">
          <div className="flex w-max gap-14 animate-[gmSlow_70s_linear_infinite] items-center">
            {loop.map((brand, i) => (
              <img
                key={i}
                src={brand.logo}
                alt={brand.name}
                className="h-10 opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition"
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
