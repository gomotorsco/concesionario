export default function FinanceBrandSlider() {
  return (
    <section className="relative overflow-hidden border-t border-black/5 bg-[#ebe7df] py-10">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#ebe7df] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#ebe7df] to-transparent" />

      <div className="flex min-w-max animate-[gmBrands_35s_linear_infinite]">
        <img
          src="/logos.png"
          alt="Marcas GoMotorsCo"
          draggable={false}
          className="h-16 w-auto select-none object-contain opacity-90 md:h-20"
        />

        <img
          src="/logos.png"
          alt="Marcas GoMotorsCo"
          draggable={false}
          className="h-16 w-auto select-none object-contain opacity-90 md:h-20"
        />
      </div>
    </section>
  );
}
