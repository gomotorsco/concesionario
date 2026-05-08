export default function FinanceBrandSlider() {
  return (
    <section className="relative overflow-hidden border-t border-black/5 bg-[#ebe7df] py-10">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4">
        <img
          src="/logos.png"
          alt="Marcas GoMotorsCo"
          draggable={false}
          className="h-auto w-full max-w-[1600px] select-none object-contain opacity-90"
        />
      </div>
    </section>
  );
}
