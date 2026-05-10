export default function FinanceBrandSlider() {
  return (
    <section className="relative -mt-px overflow-hidden border-y border-black/5 bg-[#efe8dc] py-2 md:py-3">
      <div className="mx-auto flex w-full max-w-[1720px] items-center justify-center px-0">
        <img
          src="/logos.png"
          alt="Marcas GoMotorsCo"
          draggable={false}
          className="block h-auto w-full select-none object-contain opacity-95"
        />
      </div>
    </section>
  );
}
