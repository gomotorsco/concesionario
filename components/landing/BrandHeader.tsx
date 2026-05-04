"use client";

function CarIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <path d="M4 14l1.4-4.2A3 3 0 0 1 8.2 8h7.6a3 3 0 0 1 2.8 1.8L20 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 14h14v4H5v-4Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="7.5" cy="18" r="1.5" fill="currentColor" />
      <circle cx="16.5" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

function MotoIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="17" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="17" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 17h3l3-6h2l1 3M12 17l-2-5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CycleIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <circle cx="7" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 18h5M15 18l2-9h2M12 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function BrandHeader() {
  return (
    <header className="absolute left-0 right-0 top-5 z-50">
      <div className="gm-premium-container">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/40 bg-white/86 px-5 py-2.5 shadow-[0_18px_55px_rgba(21,21,21,.14)] backdrop-blur-2xl">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo-gomotorsco.png" alt="GoMotorsCo" className="h-12 w-auto object-contain" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6f675e]">
                Grupo automotor
              </p>
              <p className="text-lg font-black tracking-[-0.04em] text-[#151515]">
                GoMotorsCo
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 rounded-full bg-white/70 p-1 md:flex">
            <a href="#stock" className="rounded-full px-4 py-2 text-sm font-bold text-[#6f675e] hover:bg-[#fffdf8] hover:text-[#151515]">Stock</a>
            <a href="#stock" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[#6f675e] hover:bg-[#fffdf8] hover:text-[#151515]"><CarIcon /> Autos</a>
            <a href="#stock" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[#6f675e] hover:bg-[#fffdf8] hover:text-[#151515]"><MotoIcon /> Motos</a>
            <a href="#stock" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[#6f675e] hover:bg-[#fffdf8] hover:text-[#151515]"><CycleIcon /> Ciclomotores</a>
            <a href="/preaprobacion" className="rounded-full px-4 py-2 text-sm font-bold text-[#6f675e] hover:bg-[#fffdf8] hover:text-[#151515]">Financiación</a>
          </nav>

          <a href="/preaprobacion" className="rounded-full bg-[#151515] px-5 py-2.5 text-sm font-black text-white hover:bg-black">
            Evaluar
          </a>
        </div>
      </div>
    </header>
  );
}
