import Link from "next/link";
import Header from "@/components/layout/Header";
import LeadForm from "@/components/landing/LeadForm";
import AnnouncementBar from "@/components/landing/AnnouncementBar";
import EntryModal from "@/components/landing/EntryModal";
import FloatingActions from "@/components/landing/FloatingActions";
import VehiclesSection from "@/components/landing/VehiclesSection";
import { getWhatsappNumber } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Fuerza que esta página sea dinámica (sin HTML cacheado)
export const dynamic = "force-dynamic";

function buildWhatsAppUrl(rawNumber?: string | null) {
  const fallback = "541136706858";
  const clean =
    rawNumber && rawNumber.trim().length > 5
      ? rawNumber.replace(/\D/g, "")
      : fallback;

  return `https://wa.me/${clean}`;
}

type Vehicle = {
  id: number;
  title: string;
  cuota_desde: number | null;
  moneda: string | null;
  imagen_url: string | null;
  imagen_url_2: string | null;
  imagen_url_3: string | null;
};

type Section = {
  id: number;
  title: string;
  slug: string | null;
  order_index: number | null;
  visible: boolean | null;
  vehicles: Vehicle[];
};

async function getVehicleSectionsForLanding(): Promise<Section[]> {
  const { data, error } = await supabaseAdmin
    .from("vehicle_sections")
    .select(
      `
      id,
      title,
      slug,
      order_index,
      visible,
      vehicles:vehicles (
        id,
        title,
        cuota_desde,
        moneda,
        imagen_url,
        imagen_url_2,
        imagen_url_3,
        orden
      )
    `
    )
    .order("order_index", { ascending: true })
    .order("orden", { foreignTable: "vehicles", ascending: true });

  if (error) {
    console.error("Error cargando vehicle_sections para landing:", error);
    return [];
  }

  return (data as Section[]) ?? [];
}

export default async function LandingPage() {
  const whatsappNumber = await getWhatsappNumber();
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber);

  const sections = await getVehicleSectionsForLanding();

  const sectionsVisibles = sections.filter(
    (s) => s.visible === true || s.visible === null || s.visible === undefined
  );

  const sectionsConAutos = sectionsVisibles.filter(
    (s) => s.vehicles && s.vehicles.length > 0
  );

  return (
    <main className="min-h-screen bg-[#f3f1eb] text-slate-900">
      <Header />
      <AnnouncementBar />
      <EntryModal />
      <FloatingActions whatsappUrl={whatsappUrl} />

      {/* HERO */}
      <section id="hero" className="px-4 md:px-6 lg:px-8 pt-8 pb-14">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl shadow-[0_28px_80px_rgba(15,23,42,0.65)]">
            <div className="absolute inset-0 bg-[url('/hero-0km.png')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-slate-950/60" />

            <div className="relative px-6 py-10 md:px-10 md:py-14 text-white">
              <div className="max-w-3xl space-y-5">
                <p className="inline-flex items-center gap-2 rounded-full bg-black/40 border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Consulta de acceso a tu 0km
                </p>

                <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-semibold leading-tight">
                  Consultá si podés acceder a tu{" "}
                  <span className="text-sky-300">0km en cuotas</span> según tu
                  perfil.
                </h1>

                <p className="max-w-xl text-[15px] text-slate-200">
                  Dejá tus datos una sola vez y un asesor oficial te contacta
                  con opciones de concesionarios autorizados. Sin costo, sin
                  venta directa desde este sitio y sin compromiso de compra.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="#form"
                    className="px-7 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-sm font-medium text-white shadow-[0_18px_40px_rgba(56,189,248,0.55)] transition"
                  >
                    Enviar consulta
                  </a>

                  <Link
                    href={whatsappUrl}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white shadow-[0_18px_38px_rgba(37,211,102,0.55)] hover:bg-[#20bd5a] transition"
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 fill-current"
                      >
                        <path d="M20.52 3.48A11.8 11.8 0 0 0 12.01 0C5.73 0 .61 5.12.61 11.4c0 2.01.53 3.97 1.55 5.7L0 24l7.09-2.19a11.37 11.37 0 0 0 4.92 1.13h.01c6.28 0 11.4-5.12 11.4-11.4 0-3.05-1.19-5.91-3.4-8.06ZM12.01 21.3c-1.57 0-3.1-.42-4.44-1.21l-.32-.19-4.21 1.3 1.37-4.09-.21-.33A9.3 9.3 0 0 1 2.3 11.4c0-5.35 4.35-9.7 9.71-9.7 2.59 0 5.02 1.01 6.85 2.85a9.58 9.58 0 0 1 2.84 6.86c0 5.35-4.35 9.7-9.69 9.7Zm5.32-7.04c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.91 1.13-.17.19-.34.2-.63.05-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.73-1.61-2.02-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.55-.88-2.12-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.51.07-.78.36-.26.29-1.02.99-1.02 2.42 0 1.43 1.04 2.81 1.19 3 .15.19 2.06 3.15 4.99 4.42.7.3 1.25.48 1.68.62.71.23 1.35.2 1.86.12.57-.08 1.7-.7 1.94-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34Z" />
                      </svg>
                    </span>
                    Hablar por WhatsApp
                  </Link>

                  <p className="text-[11px] text-slate-200 max-w-xs">
                    Consulta sin costo. No impacta tu scoring. Te contactan solo
                    por las alternativas que aplican a tu perfil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUTOS ALCANZADOS POR EL BENEFICIO */}
      <section id="marcas" className="px-6 md:px-10 lg:px-20 pb-10">
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#f8f5ef] border border-slate-200/70 shadow-[0_16px_45px_rgba(15,23,42,0.15)] px-5 py-7 md:px-8 md:py-9">
          <h2 className="text-xl md:text-2xl font-semibold mb-2 text-slate-900">
            Autos alcanzados por el beneficio
          </h2>
          <p className="text-sm text-slate-600 mb-6 max-w-2xl"></p>

          {sectionsConAutos.length === 0 ? (
            <p className="text-sm text-slate-500">
              En este momento no hay modelos disponibles para mostrar.
            </p>
          ) : (
            <VehiclesSection sections={sectionsConAutos} whatsappUrl={whatsappUrl} />
          )}
        </div>
      </section>

      {/* FORMULARIO PRINCIPAL */}
      <section id="form" className="px-6 md:px-10 lg:px-20 pb-14">
        <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.18)] px-5 py-8 md:px-8 md:py-10">
          <div className="max-w-3xl mb-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-2 text-slate-900">
              Completá tu consulta para evaluar acceso a cuotas y beneficios.
            </h2>
            <p className="text-sm text-slate-600">
              Un asesor oficial va a revisar tu perfil, zona y si tenés auto
              usado para tomar llave por llave. Después te va a contactar por
              WhatsApp o teléfono con las alternativas vigentes.
            </p>
          </div>

          <LeadForm />

          <div className="mt-4 space-y-1 text-[11px] text-slate-600 max-w-3xl">
            <p>
              La información que recibas puede variar según marca, modelo,
              concesionario y condiciones del momento. Las propuestas finales se
              acuerdan directamente con la concesionaria oficial.
            </p>
            <p className="text-[10px]">
              PlanNacionalTu0km.com.ar es una plataforma privada de asesoría. No
              pertenece al Estado Nacional, Gobierno ni organismos oficiales. No
              realizamos venta directa: solo derivamos consultas a
              concesionarios autorizados.
            </p>
          </div>
        </div>
      </section>
	        {/* FOOTER LEGAL */}
      <footer className="border-t border-slate-200 bg-[#f3f1eb]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-20 py-8 md:py-10 text-[11px] md:text-xs text-slate-600 space-y-4">
          <div className="space-y-2">
            <p>
              Las imágenes y descripciones exhibidas en este sitio tienen fines
              publicitarios y son meramente ilustrativas, no contractuales. Los
              valores indicados son orientativos y no representan una oferta
              comercial directa. Los precios, bonificaciones y condiciones
              pueden variar según fabricante, disponibilidad o concesionario.
            </p>
            <p className="font-semibold">
              Última actualización: 07/01/2026.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">
              PlanNacionalTu0km.com.ar – Naturaleza del servicio
            </p>
            <p>
              PlanNacionalTu0km.com.ar es una plataforma privada de asesoría y
              derivación de consultas. NO pertenece ni está afiliada al Estado
              Nacional, Gobierno, ministerios, secretarías ni a ningún organismo
              oficial de la República Argentina.
            </p>
            <p>
              PlanNacionalTu0km.com.ar NO cuenta con vendedores, representantes
              ni oficinas de atención al público en ninguna parte del país. No
              poseemos otros sitios web, sucursales, cuentas de WhatsApp ni
              dominios adicionales fuera del presente.
            </p>
            <p>
              PlanNacionalTu0km.com.ar NO realiza venta directa, no administra
              grupos de ahorro, no suscribe contratos, no gestiona cobranzas, no
              adjudica unidades y no garantiza bonificaciones ni tiempos de
              entrega.
            </p>
            <p>
              Los planes de ahorro y operaciones comerciales son realizados
              exclusivamente por Concesionarios Oficiales de cada marca, quienes
              poseen la autorización para la comercialización, publicación y
              suscripción de los planes correspondientes. Toda transacción final
              se realiza directamente entre el usuario y el concesionario. Al
              completar el formulario, el usuario autoriza el uso de sus datos
              para contacto y pre-evaluación por parte de dichos concesionarios.
            </p>
            <p className="font-semibold">
              PlanNacionalTu0km.com.ar es un sitio completamente independiente y
              no tiene relación ni vinculación alguna con plannacional.autos ni
              con sus operadores.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200/70 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <a href="#" className="hover:text-slate-900 underline-offset-2 hover:underline">
                Privacidad
              </a>
              <span>/</span>
              <a href="#" className="hover:text-slate-900 underline-offset-2 hover:underline">
                Políticas de uso
              </a>
              <span>/</span>
              <a href="#" className="hover:text-slate-900 underline-offset-2 hover:underline">
                Preguntas frecuentes
              </a>
              <span>/</span>
              <a href="#" className="hover:text-slate-900 underline-offset-2 hover:underline">
                Opiniones y comentarios
              </a>
            </div>

            <div>
              <a
                href="#form"
                className="font-medium text-sky-700 hover:text-sky-900 underline-offset-2 hover:underline"
              >
                ¿Sos concesionario oficial? Publicá tu oferta en el sitio
              </a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
