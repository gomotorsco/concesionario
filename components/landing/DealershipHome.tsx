import PremiumVehiclesCatalog from "@/components/landing/PremiumVehiclesCatalog";

export default function DealershipHome() {
  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#151515]">
      <div className="hidden border-b border-black/10 bg-[#111] text-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
          <span>Financiación disponible</span>
          <span>Recibimos vehículo en parte de pago</span>
          <span>Atención comercial personalizada</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f1ea]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <a href="/">
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-[#8b6f3e]">
              Grupo automotriz
            </p>
            <p className="mt-1 text-xl font-black tracking-tight text-[#101010]">
              AutoMarket Premium
            </p>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-black/65 md:flex">
            <a href="#stock" className="hover:text-black">Stock</a>
            <a href="/preaprobacion" className="hover:text-black">Financiación</a>
            <a href="#parte-pago" className="hover:text-black">Parte de pago</a>
            <a href="#proceso" className="hover:text-black">Cómo funciona</a>
          </nav>

          <a
            href="/preaprobacion"
            className="rounded-full bg-[#151515] px-5 py-2.5 text-sm font-bold text-white shadow-[0_16px_40px_rgba(0,0,0,0.22)] hover:bg-[#2a2a2a]"
          >
            Evaluar financiación
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0b0b0b] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(198,161,91,0.20),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.11),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[0.95fr_1.05fr] md:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#c6a15b]" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                Stock verificado · Financiación · Parte de pago
              </span>
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.055em] md:text-7xl">
              Tu próximo vehículo empieza con una buena decisión.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68">
              Autos, motos y opciones de financiación con asesoría comercial real.
              Revisamos tu perfil, tu inicial y si tenés vehículo para entregar.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#stock"
                className="rounded-full bg-[#c6a15b] px-7 py-4 text-center text-sm font-black text-black shadow-[0_20px_50px_rgba(198,161,91,0.25)] hover:bg-[#d9b66d]"
              >
                Ver stock disponible
              </a>

              <a
                href="/preaprobacion"
                className="rounded-full border border-white/20 bg-white/5 px-7 py-4 text-center text-sm font-black text-white hover:bg-white/10"
              >
                Evaluar financiación
              </a>

              <a
                href="#parte-pago"
                className="rounded-full border border-white/10 px-7 py-4 text-center text-sm font-bold text-white/75 hover:text-white"
              >
                Entregar mi usado
              </a>
            </div>

            <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
              <HeroMetric value="+200" label="consultas gestionadas" />
              <HeroMetric value="0" label="documentos al inicio" />
              <HeroMetric value="24h" label="respuesta comercial" />
            </div>
          </div>

          <div className="relative min-h-[520px]">
            <div className="absolute inset-0 rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-white/12 to-white/[0.03] p-3 shadow-[0_35px_100px_rgba(0,0,0,0.55)]">
              <div className="relative h-full overflow-hidden rounded-[1.8rem] bg-zinc-900">
                <img
                  src="/hero-0km.png"
                  alt="Vehículo premium"
                  className="h-full w-full object-cover opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/10 bg-black/70 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#c6a15b]">
                    Asesoría personalizada
                  </p>
                  <p className="mt-2 text-lg font-black">
                    Elegí, consultá y avanzá con información clara.
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    Financiación, stock y parte de pago desde un solo flujo.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -left-5 top-12 hidden rounded-3xl border border-white/10 bg-black/75 p-4 shadow-2xl backdrop-blur-xl lg:block">
              <p className="text-xs text-white/50">Evaluación inicial</p>
              <p className="mt-1 text-xl font-black text-white">Sin costo</p>
            </div>

            <div className="absolute -right-5 bottom-20 hidden rounded-3xl border border-[#c6a15b]/25 bg-[#15110a]/90 p-4 shadow-2xl backdrop-blur-xl lg:block">
              <p className="text-xs text-[#c6a15b]">Parte de pago</p>
              <p className="mt-1 text-xl font-black text-white">Disponible</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#f4f1ea]">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-10 md:grid-cols-4">
          <TrustCard title="Financiación" text="Evaluación inicial con datos básicos." />
          <TrustCard title="Parte de pago" text="Recibimos usado, moto o vehículo como inicial." />
          <TrustCard title="Asesor real" text="Un vendedor hace seguimiento personalizado." />
          <TrustCard title="Stock claro" text="Cada vehículo tiene ficha, estado y consulta." />
        </div>
      </section>

      <section id="stock" className="bg-[#f7f3ea]">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#8b6f3e]">
                Catálogo disponible
              </p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.04em] text-[#111] md:text-5xl">
                Elegí según lo que necesitás.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-black/55">
                Filtrá por autos, motos o ciclomotores. Revisá detalles, solicitá
                preaprobación o hablá con un asesor.
              </p>
            </div>

            <a
              href="/preaprobacion"
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-center text-sm font-black text-black shadow-sm hover:bg-black hover:text-white"
            >
              Quiero evaluar mi financiación
            </a>
          </div>

          <PremiumVehiclesCatalog />
        </div>
      </section>

      <section id="parte-pago" className="bg-[#111] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c6a15b]">
              Parte de pago
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] md:text-5xl">
              Tu usado puede acercarte al vehículo que querés.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ProcessCard number="01" title="Indicás el vehículo" text="Marca, modelo, año, kilometraje y estado general." />
            <ProcessCard number="02" title="Evaluación inicial" text="Un asesor revisa si puede tomarse como parte de pago." />
            <ProcessCard number="03" title="Opciones reales" text="Se combinan inicial, financiación y disponibilidad." />
            <ProcessCard number="04" title="Seguimiento" text="Todo queda en CRM para no perder la oportunidad." />
          </div>
        </div>
      </section>

      <section id="proceso" className="bg-[#f4f1ea]">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)] md:p-12">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#8b6f3e]">
              Cómo funciona
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#111]">
              Un proceso simple, comercial y medible.
            </h2>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <Step number="1" title="Elegís vehículo" text="Ves stock, detalles y opciones según categoría." />
              <Step number="2" title="Solicitás evaluación" text="Dejás datos básicos sin cargar documentos sensibles." />
              <Step number="3" title="Te contacta un asesor" text="El equipo comercial toma el lead, lo trabaja y mide el avance." />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-white/45">{label}</p>
    </div>
  );
}

function TrustCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      <div className="mb-4 h-9 w-9 rounded-full bg-[#151515]" />
      <h3 className="text-base font-black text-[#111]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-black/55">{text}</p>
    </article>
  );
}

function ProcessCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-xs font-black tracking-[0.25em] text-[#c6a15b]">{number}</p>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
    </article>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-black/10 bg-[#f7f3ea] p-6">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#151515] text-sm font-black text-white">
        {number}
      </div>
      <h3 className="text-xl font-black text-[#111]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-black/55">{text}</p>
    </article>
  );
}
