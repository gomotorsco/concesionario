"use client";

function CarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 14l1.4-4.2A3 3 0 0 1 8.2 8h7.6a3 3 0 0 1 2.8 1.8L20 14" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 14h14v4H5v-4Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="7.5" cy="18" r="1.5" fill="currentColor" />
      <circle cx="16.5" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

function MotoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="17" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="17" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 17h3l3-6h2l1 3M12 17l-2-5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ScooterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="7" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 18h5M15 18l2-9h2M12 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function BrandHeader() {
  return (
    <header className="sticky top-4 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between rounded-full border border-gray-200 bg-white/90 px-5 py-3 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-black text-white">
              G
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
                Grupo automotor
              </p>
              <p className="text-lg font-black tracking-[-0.03em] text-gray-950">
                GoMotorsCo
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 rounded-full bg-gray-100 p-1 md:flex">
            <a href="#stock" className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-white hover:text-black">
              Stock
            </a>
            <a href="#stock" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-white hover:text-black">
              <CarIcon /> Autos
            </a>
            <a href="#stock" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-white hover:text-black">
              <MotoIcon /> Motos
            </a>
            <a href="#stock" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-white hover:text-black">
              <ScooterIcon /> Ciclomotores
            </a>
            <a href="/preaprobacion" className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-white hover:text-black">
              Financiación
            </a>
          </nav>

          <a href="/preaprobacion" className="rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-900">
            Evaluar
          </a>
        </div>
      </div>
    </header>
  );
}
