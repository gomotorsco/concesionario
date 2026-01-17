import Header from "@/components/layout/Header";
import LeadForm from "@/components/landing/LeadForm";
import VehiclesGrid from "@/components/landing/VehiclesGrid";

export default function LandingPage() {
  // Más adelante esto vendrá desde una API / Supabase
  const vehicles: any[] = [];

  return (
    <main className="min-h-screen flex flex-col bg-[#f6f3ec] text-slate-900">
      <Header />

      {/* BANDA DE AVISO / URGENCIA */}
      <section className="border-b border-amber-300/70 bg-amber-100 text-[11px] text-amber-900 py-2">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="font-medium">
            Atención: los cupos de evaluación sin costo se actualizan cada 24 hs y dependen
            del mes y del cupo disponible en cada plan.
          </p>
        </div>
      </section>

      {/* HERO LIMPIO */}
      <section
        id="hero"
        className="px-6 md:px-10 lg:px-20 pt-10 pb-8 flex flex-col items-center justify-center"
      >
        <div className="max-w-5xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-10 items-start">
            {/* Texto principal */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-sky-700">
                  Evaluación de acceso a tu 0km
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-[2.7rem] leading-tight font-semibold text-slate-900">
                  Conocé el{" "}
                  <span className="text-sky-700">Plan Nacional tu 0km</span> y enterate si
                  podés acceder a un{" "}
                  <span className="underline decoration-sky-300 decoration-[5px] underline-offset-[6px]">
                    beneficio en cuotas
                  </span>
                  .
                </h1>

                <div className="space-y-2 text-sm md:text-[15px]">
                  <p className="text-slate-800">
                    <span className="font-semibold">
                      Plataforma oficial de pre-evaluación según scoring y cupo disponible.
                    </span>
                  </p>
                  <p className="text-slate-600">
                    Si calificás, vas a poder acceder a opciones para tu 0km con beneficios
                    exclusivos. Completá tus datos y un asesor autorizado te contactará con
                    las alternativas vigentes según tu perfil.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <a
                  href="#form"
                  className="px-7 py-3 rounded-full bg-sky-700 hover:bg-sky-600 text-sm font-medium text-white shadow-[0_14px_40px_rgba(15,118,110,0.28)] transition transform hover:-translate-y-[1px]"
                >
                  Evaluar mi caso ahora
                </a>
                <div className="space-y-1 max-w-xs">
                  <p className="text-[11px] text-slate-600">
                    Evaluación sin costo. No garantiza adjudicación ni entrega; todo queda
                    sujeto a scoring, cupo y condiciones vigentes de cada concesionario.
                  </p>
                  <p className="text-[10px] text-slate-500">
                    PlanNacionalTu0km.com.ar es una plataforma privada de asesoría.{" "}
                    <span className="underline underline-offset-2">
                      No pertenece al Gobierno ni a organismos oficiales.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta lateral con resumen del proceso */}
            <aside className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Vista rápida
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    Cómo funciona el proceso
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                  Sin costo inicial
                </span>
              </div>

              <div className="space-y-3 text-[13px]">
                <div className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-sky-600 text-white text-[11px] flex items-center justify-center font-semibold mt-[2px]">
                    1
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">Completás el formulario</p>
                    <p className="text-slate-600">
                      Datos básicos de contacto, provincia, entrega pactada deseada y si
                      tenés auto usado para entregar llave por llave.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-sky-600 text-white text-[11px] flex items-center justify-center font-semibold mt-[2px]">
                    2
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">Analizamos tu perfil</p>
                    <p className="text-slate-600">
                      Scoring, ingresos, zona y cupo disponible. Definimos si podés aplicar
                      a 3, 6, 8, 12 meses u otros esquemas de entrega.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-sky-600 text-white text-[11px] flex items-center justify-center font-semibold mt-[2px]">
                    3
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">Te contacta un asesor</p>
                    <p className="text-slate-600">
                      Un asesor autorizado te explica opciones concretas y te vincula con el
                      concesionario oficial que pueda tomar tu caso.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA (DETALLE) */}
      <section
        id="como-funciona"
        className="px-6 md:px-10 lg:px-20 pb-10 border-t border-slate-200/80 bg-[#f9f6f0]"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold mb-2 text-slate-900">
            ¿Cómo funciona el Plan Nacional tu 0km?
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            El objetivo es que entiendas el proceso antes de avanzar. No vendemos humo ni
            promesas imposibles: trabajamos en base a tu perfil real y a las condiciones
            vigentes en cada concesionario oficial.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                Paso 1 · Formulario
              </p>
              <p className="text-slate-800">
                Completás tus datos de contacto, provincia, entrega pactada deseada y si tenés
                auto usado para entregar llave por llave.
              </p>
            </div>
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                Paso 2 · Evaluación
              </p>
              <p className="text-slate-800">
                Nuestro sistema analiza tu perfil (scoring, ingresos, zona) y define qué tipo
                de esquema podría aplicar: 3, 6, 8 o 12 meses de entrega pactada, según cupo
                y condiciones.
              </p>
            </div>
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                Paso 3 · Asesoría
              </p>
              <p className="text-slate-800">
                Un asesor se comunica con vos por WhatsApp o teléfono para explicarte
                opciones concretas y derivarte al concesionario oficial que pueda tomar tu
                caso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AUTOS AMPARADOS (GRID DINÁMICO DESDE PANEL) */}
      <section
        id="marcas"
        className="px-6 md:px-10 lg:px-20 py-10 border-t border-slate-200 bg-[#f6f3ec]"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold mb-2 text-slate-900">
            Autos amparados por el Plan Nacional tu 0km
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Desde el panel interno vas a poder cargar modelos por marca, definir la cuota
            estimada, el texto comercial y hasta 4 fotos por vehículo. Acá se mostrarán
            automáticamente hasta 9 vehículos destacados (3 filas de 3 autos) para que el
            usuario vea ejemplos de unidades alcanzadas por el beneficio.
          </p>

          <VehiclesGrid whatsappUrl={whatsappUrl} />

        </div>
      </section>

      {/* FORMULARIO + BENEFICIOS */}
      <section
        id="form"
        className="border-t border-slate-200 bg-[#fdfaf5] px-6 md:px-10 lg:px-20 py-10"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_18px_45px_rgba(15,23,42,0.06)] p-5 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-2 text-slate-900">
              Completá tu evaluación sin costo y vemos si podés acceder a un plan.
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Este formulario llega directo al panel interno. Un asesor revisa tu scoring, la
              entrega que te interesa (3, 6, 8, 12 meses, etc.) y si tenés auto usado para
              tomar llave por llave.
            </p>
            <LeadForm />
          </div>

          <div
            id="beneficios"
            className="space-y-4 text-sm text-slate-700"
          >
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-1">
                Entrega pactada y perfil
              </p>
              <p className="text-[13px] mb-2 text-slate-700">
                No todos los casos son iguales. En base a tu historial y al cupo del momento,
                podemos trabajar entregas pactadas a:
              </p>
              <p className="text-[13px] mb-2 text-slate-800">
                <strong>3, 6, 8 o 12 meses</strong>, y en algunos casos plazos más largos. La
                idea es que tengas una hoja de ruta clara desde el inicio, sin promesas
                imposibles.
              </p>
              <p className="text-[11px] text-slate-500">
                Analizamos tu caso de forma individual, según scoring, ingresos, zona y
                disponibilidad de cada concesionario.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-1">
                Auto usado como parte de pago
              </p>
              <p className="text-[13px] mb-1 text-slate-700">
                Si ya tenés un auto, podés usarlo como parte de pago:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[13px] text-slate-700">
                <li>Tomamos tu usado y se descuenta del plan o del valor del 0km.</li>
                <li>
                  Podemos trabajar esquemas <strong>llave por llave</strong>: entregás tu auto
                  actual cuando retirás el nuevo.
                </li>
                <li>
                  Cuanto más claro nos expliques tu auto (marca, modelo, año, estado), mejor
                  propuesta te vamos a poder armar.
                </li>
              </ul>
            </div>

            <div
              id="preguntas"
              className="border border-slate-200 rounded-2xl p-4 bg-[#f6f3ec]"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-slate-600 mb-1">
                Aclaración importante
              </p>
              <p className="text-[11px] text-slate-700">
                PlanNacionalTu0km.com.ar es un{" "}
                <strong>programa privado de asesoría y gestión</strong>. No es un plan del
                Gobierno, ni un programa oficial del Estado, ni depende de ningún organismo
                público. Trabajamos de forma independiente, conectándote con distintas
                alternativas del mercado y con concesionarios oficiales autorizados.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
