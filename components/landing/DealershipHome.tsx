import PremiumVehiclesCatalog from "@/components/landing/PremiumVehiclesCatalog";

export default function DealershipHome() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-blue-400">
              Concesionario
            </p>
            <p className="text-lg font-bold">AutoMarket Pro</p>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
            <a href="#vehiculos" className="hover:text-white">Vehículos</a>
            <a href="/preaprobacion" className="hover:text-white">Preaprobación</a>
            <a href="#beneficios" className="hover:text-white">Beneficios</a>
            <a href="#contacto" className="hover:text-white">Contacto</a>
          </nav>

          <a
            href="/preaprobacion"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Preaprobación
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.22),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
          <div className="flex flex-col justify-center">
            <p className="mb-4 inline-flex w-fit rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200">
              Autos · Motos · Ciclomotores · Financiación
            </p>

            <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Elegí la mejor opción para vos
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
              Encontrá vehículos disponibles, solicitá una evaluación inicial de financiación
              y recibí asesoría comercial personalizada.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#vehiculos"
                className="rounded-2xl bg-blue-600 px-6 py-4 text-center text-sm font-bold text-white hover:bg-blue-500"
              >
                Ver vehículos
              </a>

              <a
                href="/preaprobacion"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-center text-sm font-bold text-white hover:bg-white/10"
              >
                Solicitar preaprobación
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 max-w-xl">
              <MiniStat label="Respuesta" value="Rápida" />
              <MiniStat label="Evaluación" value="Inicial" />
              <MiniStat label="Parte de pago" value="Sí" />
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[1.5rem] bg-zinc-900">
                <img
                  src="/hero-0km.png"
                  alt="Vehículos disponibles"
                  className="h-[420px] w-full object-cover"
                />
              </div>
            </div>

            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/80 p-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                Sistema comercial
              </p>
              <p className="mt-1 text-sm text-zinc-200">
                Vehículos, preaprobación y asesoría en un solo lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Benefit
            title="Financiación"
            text="Solicitá una evaluación inicial sin cargar documentos en el primer contacto."
          />
          <Benefit
            title="Vehículo como parte de pago"
            text="Indicá si tenés un vehículo para entregar y un asesor revisa la tasación inicial."
          />
          <Benefit
            title="Asesoría comercial"
            text="Un vendedor puede contactarte, resolver dudas y acompañarte en el proceso."
          />
        </div>
      </section>

      <section id="vehiculos" className="bg-zinc-950/70">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
                Catálogo
              </p>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                Elegí la mejor opción para vos
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                Filtrá por tipo de vehículo, revisá detalles y solicitá contacto o preaprobación.
              </p>
            </div>

            <a
              href="/preaprobacion"
              className="rounded-2xl border border-blue-500/40 bg-blue-500/10 px-5 py-3 text-center text-sm font-semibold text-blue-100 hover:bg-blue-500/20"
            >
              Quiero preaprobarme
            </a>
          </div>

          <PremiumVehiclesCatalog />
        </div>
      </section>

      <section id="contacto" className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-950/40 to-zinc-950 p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300">
                Atención personalizada
              </p>
              <h2 className="mt-3 text-3xl font-black">
                ¿Tenés dudas sobre financiación o parte de pago?
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Dejá tus datos y un asesor comercial puede ayudarte a encontrar la mejor opción.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="/preaprobacion"
                className="rounded-2xl bg-blue-600 px-6 py-4 text-center text-sm font-bold text-white hover:bg-blue-500"
              >
                Solicitar evaluación inicial
              </a>
              <a
                href="#vehiculos"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-center text-sm font-bold text-white hover:bg-white/10"
              >
                Ver catálogo
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function Benefit({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-4 h-10 w-10 rounded-2xl bg-blue-600/20 ring-1 ring-blue-500/30" />
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
    </article>
  );
}
