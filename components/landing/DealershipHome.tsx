import BrandHeader from "@/components/landing/BrandHeader";
import PremiumVehiclesCatalog from "@/components/landing/PremiumVehiclesCatalog";

export default function DealershipHome() {
  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#151515]">
      <BrandHeader />

      <section className="relative -mt-24 overflow-hidden bg-[#0b0b0b] pt-32 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(198,161,91,0.18),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.10),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[0.95fr_1.05fr] md:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#c6a15b]" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                Stock verificado · financiación · parte de pago
              </span>
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.055em] md:text-7xl">
              Su próximo vehículo empieza con una buena decisión.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68">
              Autos, motos y opciones de financiación con asesoría comercial personalizada.
              Revisamos su perfil, su cuota inicial y si cuenta con vehículo para entregar.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#stock" className="rounded-full bg-[#c6a15b] px-7 py-4 text-center text-sm font-black text-black hover:bg-[#d9b66d]">
                Ver stock disponible
              </a>
              <a href="/preaprobacion" className="rounded-full border border-white/20 bg-white/5 px-7 py-4 text-center text-sm font-black text-white hover:bg-white/10">
                Evaluar financiación
              </a>
            </div>
          </div>

          <div className="relative min-h-[520px]">
            <div className="absolute inset-0 rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-white/12 to-white/[0.03] p-3 shadow-[0_35px_100px_rgba(0,0,0,0.55)]">
              <div className="relative h-full overflow-hidden rounded-[1.8rem] bg-zinc-900">
                <img src="/hero-0km.png" alt="Vehículo GoMotorsCo" className="h-full w-full object-cover opacity-95" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/10 bg-black/70 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#c6a15b]">
                    Asesoría personalizada
                  </p>
                  <p className="mt-2 text-lg font-black">
                    Elija, consulte y avance con información clara.
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    Inventario, financiación y seguimiento comercial desde un solo flujo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stock" className="bg-[#f7f3ea]">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#8b6f3e]">
                Inventario GoMotorsCo
              </p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.04em] text-[#111] md:text-5xl">
                Elija según lo que necesita.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-black/55">
                Filtre por autos, motos o ciclomotores. Revise detalles, solicite preaprobación
                o hable con un asesor comercial.
              </p>
            </div>

            <a href="/preaprobacion" className="rounded-full border border-black/15 bg-white px-6 py-3 text-center text-sm font-black text-black shadow-sm hover:bg-black hover:text-white">
              Solicitar evaluación de financiación
            </a>
          </div>

          <PremiumVehiclesCatalog />
        </div>
      </section>
    </main>
  );
}
