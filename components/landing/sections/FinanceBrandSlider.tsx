export default function FinanceBrandSlider() {
  return (
    <section className="relative -mt-1 overflow-hidden border-y border-black/5 bg-[#efe8dc] py-4 md:py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#efe8dc] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#efe8dc] to-transparent" />

      <div className="mx-auto flex w-full max-w-[1720px] items-center justify-center px-4">
        <img
          src="/logos.png"
          alt="Marcas GoMotorsCo"
          draggable={false}
          className="h-auto w-full max-w-[1280px] select-none object-contain opacity-90 md:max-w-[1450px]"
        />
      </div>
    </section>
  );
}
