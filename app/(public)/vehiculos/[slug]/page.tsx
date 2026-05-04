import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import VehicleGallery from "./VehicleGallery";
import { VehicleLeadForm } from "./VehicleLeadForm";

function money(value?: number | null) {
  if (!value) return "Consultar";
  return `$ ${Number(value).toLocaleString("es-CO")}`;
}

function parseGallery(vehicle: any) {
  const raw = vehicle?.galeria;

  let gallery: string[] = [];

  if (Array.isArray(raw)) {
    gallery = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      gallery = Array.isArray(parsed) ? parsed : [];
    } catch {
      gallery = raw
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
    }
  }

  return Array.from(
    new Set([vehicle?.imagen_hero, vehicle?.imagen_url, ...gallery].filter(Boolean))
  );
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { data: vehicle, error } = await supabaseAdmin
    .from("vehicles")
    .select("*")
    .eq("slug", (await params).slug)
    .maybeSingle();

  if (error || !vehicle) notFound();

  const images = parseGallery(vehicle);

  const title = vehicle.title || vehicle.modelo || "Vehículo";
  const brand = vehicle.marca || "GoMotorsCo";
  const model = vehicle.modelo || title;
  const description =
    vehicle.descripcion ||
    "Vehículo disponible con asesoría comercial personalizada y opciones de financiación.";

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#151515]">
      <div className="mx-auto max-w-7xl px-5 py-6">
        <Link href="/#stock-auto" className="text-sm font-bold text-[#6f675e] hover:text-[#151515]">
          ← Volver
        </Link>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <VehicleGallery
            vehicle={{
              title,
              imagen_hero: images[0] || vehicle.imagen_hero || vehicle.imagen_url,
              imagen_url: vehicle.imagen_url,
              galeria: images,
            }}
          />

          <aside className="space-y-5">
            <div className="rounded-[30px] border border-black/10 bg-[#fffdf8] p-8 shadow-[0_22px_70px_rgba(21,21,21,.10)]">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-[#8a7760]">
                GoMotorsCo
              </p>

              <h1 className="mt-4 text-5xl font-black tracking-[-0.06em] text-[#151515]">
                {title}
              </h1>

              <p className="mt-4 text-base text-[#6f675e]">
                {brand} · {model}
              </p>

              <div className="mt-7 rounded-[24px] border border-black/10 bg-[#f6f1e8] p-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8a7760]">
                  Precio
                </p>
                <p className="mt-2 text-4xl font-black tracking-[-0.04em]">
                  {money(vehicle.precio || vehicle.precio_desde)}
                </p>
              </div>

              <ul className="mt-7 space-y-3 text-base font-semibold text-[#151515]">
                <li>✓ Financiación disponible</li>
                <li>✓ Recibimos vehículo en parte de pago</li>
                <li>✓ Evaluación inicial sin compromiso</li>
              </ul>

              <div className="mt-7 grid gap-3">
                <Link
                  href={`/preaprobacion?vehiculo=${encodeURIComponent(title)}`}
                  className="rounded-full bg-[#151515] px-6 py-4 text-center text-sm font-black text-white"
                >
                  Iniciar pre-aprobación con este vehículo
                </Link>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Hola, quiero información sobre ${title}`)}`}
                  target="_blank"
                  className="rounded-full border border-black/15 bg-white px-6 py-4 text-center text-sm font-black text-[#151515]"
                >
                  Hablar por WhatsApp
                </a>
              </div>
            </div>

            <VehicleLeadForm vehicleTitle={title} />
          </aside>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-[22px] border border-black/10 bg-[#fffdf8] p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8a7760]">Marca</p>
            <p className="mt-2 text-lg font-black">{brand}</p>
          </div>

          <div className="rounded-[22px] border border-black/10 bg-[#fffdf8] p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8a7760]">Modelo</p>
            <p className="mt-2 text-lg font-black">{model}</p>
          </div>

          <div className="rounded-[22px] border border-black/10 bg-[#fffdf8] p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8a7760]">Estado</p>
            <p className="mt-2 text-lg font-black">Disponible para evaluación</p>
          </div>
        </section>

        <section className="mt-8 rounded-[26px] border border-black/10 bg-[#fffdf8] p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8a7760]">
            Descripción
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
            Información comercial
          </h2>
          <p className="mt-4 max-w-5xl text-base leading-8 text-[#6f675e]">
            {description}
          </p>
        </section>
      </div>
    </main>
  );
}
