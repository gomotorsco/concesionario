import Link from "next/link";

function CarIcon() {
  return <span className="text-lg">▰</span>;
}

function MotoIcon() {
  return <span className="text-lg">⌘</span>;
}

function CycleIcon() {
  return <span className="text-lg">⌁</span>;
}

export function BrandHeader() {
  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4 sm:top-6 sm:px-8">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between rounded-full border border-white/75 bg-white/88 px-5 py-3 shadow-[0_24px_90px_rgba(20,20,20,0.24)] backdrop-blur-2xl sm:px-7">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo-gomotorsco.png"
            alt="GoMotorsCo"
            className="h-10 w-auto object-contain sm:h-12"
          />

          <div className="hidden sm:block">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#7b746b]">
              Grupo automotor
            </p>

            <p className="text-xl font-black tracking-[-0.04em] text-[#151515]">
              GoMotorsCo
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full bg-[#f4eee4]/85 p-1 lg:flex">
          <a
            href="#stock"
            className="rounded-full px-4 py-2 text-sm font-black text-[#6f675e] transition hover:bg-white hover:text-[#151515]"
          >
            Stock
          </a>

          <a
            href="#stock-auto"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-[#6f675e] transition hover:bg-white hover:text-[#151515]"
          >
            <CarIcon /> Autos
          </a>

          <a
            href="#stock-moto"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-[#6f675e] transition hover:bg-white hover:text-[#151515]"
          >
            <MotoIcon /> Motos
          </a>

          <a
            href="#stock-ciclomotor"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-[#6f675e] transition hover:bg-white hover:text-[#151515]"
          >
            <CycleIcon /> Ciclomotores
          </a>

          <Link
            href="/preaprobacion"
            className="rounded-full px-4 py-2 text-sm font-black text-[#6f675e] transition hover:bg-white hover:text-[#151515]"
          >
            Financiación
          </Link>
        </nav>

        <Link
          href="/preaprobacion"
          className="rounded-full bg-[#151515] px-6 py-3 text-sm font-black text-white shadow-[0_16px_45px_rgba(0,0,0,0.22)] transition hover:scale-[1.02] sm:px-8"
        >
          Evaluar
        </Link>
      </div>
    </header>
  );
}

export default BrandHeader;
