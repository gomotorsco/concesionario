import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { VehicleLeadForm } from "./VehicleLeadForm";
import VehicleGallery from "./VehicleGallery";

type Props = {
  params: Promise<{ slug: string }>;
};

function money(value: any) {
  if (!value) return "Consultar";
  return `$ ${Number(value).toLocaleString("es-CO")}`;
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params;

  const { data: vehicle } = await supabaseAdmin
    .from("vehicles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!vehicle) return notFound();

  const name = vehicle.title;
  const price = vehicle.precio || vehicle.cuota_desde;
  const wa = encodeURIComponent(`Hola, me interesa este vehículo: ${name}`);

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#151515]">
      <section className="mx-auto max-w-7xl px-5 py-8">
        <a href="/" className="text-sm font-semibold text-[#6f675e] hover:text-black">
          ← Volver
        </a>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[30px] border border-black/10 bg-[#fffdf8] p-3 shadow-[0_24px_70px_rgba(21,21,21,.12)]">
            {vehicle.imagen_url ? (
              <img src={vehicle.imagen_url} alt={name} className="h-[520px] w-full rounded-[22px] object-cover" />
            ) : (
              <div className="flex h-[520px] items-center justify-center rounded-[22px] bg-[#eee6da] text-[#6f675e]">
                Sin imagen
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-black/10 bg-[#fffdf8]/90 p-6 shadow-[0_20px_60px_rgba(21,21,21,.10)]">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#6f675e]">
                GoMotorsCo
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">{name}</h1>

              <p className="mt-3 text-sm text-[#6f675e]">
                {[vehicle.marca, vehicle.modelo, vehicle.anio].filter(Boolean).join(" · ") || "Vehículo disponible"}
              </p>

              <div className="mt-6 rounded-2xl border border-black/10 bg-[#f6f1e8] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f675e]">Precio</p>
                <p className="mt-1 text-3xl font-black">{money(price)}</p>
              </div>

              <div className="mt-5 grid gap-2 text-sm font-medium text-[#3a332d]">
                <p>✔ Financiación disponible</p>
                <p>✔ Recibimos vehículo en parte de pago</p>
                <p>✔ Evaluación inicial sin compromiso</p>
              </div>

              <div className="mt-6 grid gap-3">
                <a href={`/preaprobacion?vehiculo=${encodeURIComponent(name)}`} className="rounded-full bg-[#151515] px-5 py-3 text-center text-sm font-black text-white">
                  Solicitar preaprobación
                </a>
                <a href={`https://wa.me/?text=${wa}`} target="_blank" className="rounded-full border border-black/15 bg-white px-5 py-3 text-center text-sm font-black text-[#151515]">
                  WhatsApp
                </a>
              </div>
            </div>

            <VehicleLeadForm vehicleId={vehicle.id} vehicleName={name} />
          </aside>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <Spec label="Marca" value={vehicle.marca} />
          <Spec label="Modelo" value={vehicle.modelo} />
          <Spec label="Año" value={vehicle.anio} />
          <Spec label="Km" value={vehicle.km ? `${Number(vehicle.km).toLocaleString("es-CO")} km` : null} />
        </section>

        {vehicle.descripcion ? (
          <section className="mt-8 rounded-[28px] border border-black/10 bg-[#fffdf8] p-6">
            <h2 className="text-xl font-black">Descripción</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-[#6f675e]">{vehicle.descripcion}</p>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function Spec({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#fffdf8] p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f675e]">{label}</p>
      <p className="mt-1 font-black">{value || "—"}</p>
    </div>
  );
}
