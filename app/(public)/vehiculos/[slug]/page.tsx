import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { VehicleLeadForm } from "./VehicleLeadForm";

function money(value?: number | null) {
  if (!value) return "Consultar";
  return `$ ${Number(value).toLocaleString("es-CO")}`;
}

function parseGallery(v: any) {
  const raw = Array.isArray(v.galeria) ? v.galeria : [];
  return Array.from(new Set([v.imagen_hero, v.imagen_url, ...raw].filter(Boolean)));
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: vehicle, error } = await supabaseAdmin
    .from("vehicles")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !vehicle) notFound();

  const images = parseGallery(vehicle);
  const hero = vehicle.imagen_hero || images[0] || "/category-banners/automoviles.png";

  return (
    <main className="min-h-screen bg-[#f5efe5] text-[#151515]">
      <section className="mx-auto max-w-7xl px-5 py-8">
        <Link href="/#stock-auto" className="text-sm font-bold text-[#6f675e] hover:text-[#151515]">
          ← Volver
        </Link>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#8a7760]">
              {vehicle.marca}
            </p>

            <h1 className="mt-5 text-6xl font-black leading-none tracking-[-0.07em]">
              {vehicle.hero_title || vehicle.title}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#6f675e]">
              {vehicle.hero_subtitle || vehicle.descripcion || "Financiación disponible con asesoría personalizada."}
            </p>

            <div className="mt-8 rounded-[28px] border border-black/10 bg-[#fffdf8] p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#8a7760]">Desde</p>
              <p className="mt-2 text-4xl font-black">{money(vehicle.precio)}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/preaprobacion?vehiculo=${encodeURIComponent(vehicle.title)}`} className="rounded-full bg-[#151515] px-7 py-4 text-sm font-black text-white">
                Iniciar pre-aprobación
              </Link>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Hola, quiero información sobre ${vehicle.title}`)}`} target="_blank" className="rounded-full border border-black/15 bg-white px-7 py-4 text-sm font-black text-[#151515]">
                WhatsApp
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[42px] border border-black/10 bg-[#fffdf8] p-3 shadow-[0_25px_80px_rgba(21,21,21,.12)]">
            <img src={hero} alt={vehicle.title} className="h-[620px] w-full rounded-[32px] object-cover" />
          </div>
        </div>

        {images.length > 1 ? (
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
            {images.map((img: string) => (
              <img key={img} src={img} className="h-28 w-44 shrink-0 rounded-2xl border border-black/10 bg-white object-cover" />
            ))}
          </div>
        ) : null}
      </section>

      <Editorial img={vehicle.block1_image || images[1] || hero} title={vehicle.block1_title || "Diseño y presencia"} text={vehicle.block1_text || vehicle.descripcion} flip={false} />
      <Editorial img={vehicle.block2_image || images[2] || hero} title={vehicle.block2_title || "Confort interior"} text={vehicle.block2_text || "Espacio, tecnología y comodidad para cada trayecto."} flip />
      <Editorial img={vehicle.block3_image || images[3] || hero} title={vehicle.block3_title || "Financiación a tu medida"} text={vehicle.block3_text || "Te ayudamos a encontrar una cuota e inicial acorde a tu perfil."} flip={false} />

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[34px] border border-black/10 bg-[#fffdf8] p-8 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#8a7760]">Resumen</p>
          <h2 className="mt-4 text-4xl font-black">Información comercial</h2>
          <p className="mt-5 text-lg leading-8 text-[#6f675e]">
            {vehicle.descripcion || "Vehículo disponible para evaluación comercial."}
          </p>
        </div>

        <VehicleLeadForm vehicleTitle={vehicle.title} />
      </section>
    </main>
  );
}

function Editorial({ img, title, text, flip }: any) {
  return (
    <section className="border-t border-black/10 bg-[#f5efe5] px-5 py-16">
      <div className={`mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 ${flip ? "lg:[&>div:first-child]:order-2" : ""}`}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#8a7760]">Detalle</p>
          <h2 className="mt-4 text-5xl font-black tracking-[-0.06em]">{title}</h2>
          <p className="mt-6 text-lg leading-8 text-[#6f675e]">{text}</p>
        </div>
        <img src={img} className="h-[520px] w-full rounded-[38px] border border-black/10 object-cover shadow-sm" />
      </div>
    </section>
  );
}
