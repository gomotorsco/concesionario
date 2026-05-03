export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[#151515] px-5 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-white/45">
            GoMotorsCo
          </p>
          <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
            Grupo automotor
          </p>
        </div>

        <p className="max-w-xl text-sm leading-6 text-white/55">
          Automóviles, motos, ciclomotores, financiación y asesoría comercial personalizada.
        </p>
      </div>
    </footer>
  );
}
