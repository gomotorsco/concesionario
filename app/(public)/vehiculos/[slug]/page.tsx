import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { VehicleLeadForm } from "./VehicleLeadForm";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params;

  const { data: vehicle, error } = await supabaseAdmin
    .from("vehicles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !vehicle) {
    notFound();
  }

  const images = [
    vehicle.imagen_url,
    vehicle.imagen_url_2,
    vehicle.imagen_url_3,
  ].filter(Boolean);

  const vehicleName = vehicle.title || `${vehicle.marca ?? ""} ${vehicle.modelo ?? ""}`.trim();

  const whatsappText = encodeURIComponent(
    `Hola, me interesa este vehículo: ${vehicleName}`
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <a href="/" className="text-xs text-zinc-400 hover:text-white">
          ← Volver al inicio
        </a>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
              {images[0] ? (
                <img src={images[0]} alt={vehicleName} className="h-[420px] w-full object-cover" />
              ) : (
                <div className="flex h-[420px] items-center justify-center bg-zinc-900 text-zinc-500">
                  Sin imagen
                </div>
              )}
            </div>

            {images.length > 1 ? (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {images.slice(1).map((img: string) => (
                  <img key={img} src={img} alt={vehicleName} className="h-44 rounded-xl object-cover" />
                ))}
              </div>
            ) : null}

            <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <h1 className="text-3xl font-bold">{vehicleName}</h1>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Spec label="Marca" value={vehicle.marca} />
                <Spec label="Modelo" value={vehicle.modelo} />
                <Spec label="Año" value={vehicle.anio} />
                <Spec label="Km" value={vehicle.km ? `${Number(vehicle.km).toLocaleString("es-CO")} km` : null} />
                <Spec label="Transmisión" value={vehicle.transmision} />
                <Spec label="Combustible" value={vehicle.combustible} />
                <Spec label="Estado" value={vehicle.estado} />
                <Spec label="Tipo" value={vehicle.tipo} />
              </div>

              <div className="mt-6">
                <p className="text-sm text-zinc-400">Precio</p>
                <p className="text-3xl font-semibold text-emerald-300">
                  {vehicle.precio
                    ? `${vehicle.moneda ?? "COP"} ${Number(vehicle.precio).toLocaleString("es-CO")}`
                    : "Precio a consultar"}
                </p>
                {vehicle.cuota_desde ? (
                  <p className="mt-1 text-sm text-blue-300">
                    Cuota desde {vehicle.moneda ?? "COP"} {Number(vehicle.cuota_desde).toLocaleString("es-CO")}
                  </p>
                ) : null}
              </div>

              {vehicle.descripcion ? (
                <div className="mt-6">
                  <p className="text-sm text-zinc-400">Descripción</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-200">
                    {vehicle.descripcion}
                  </p>
                </div>
              ) : null}
            </section>
          </div>

          <aside className="space-y-4">
            <VehicleLeadForm vehicleId={vehicle.id} vehicleName={vehicleName} />

            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              className="block rounded-2xl bg-emerald-600 px-5 py-4 text-center text-sm font-semibold text-white"
            >
              Consultar por WhatsApp
            </a>

            <a
              href={`/preaprobacion?vehiculo=${encodeURIComponent(vehicleName)}`}
              className="block rounded-2xl border border-blue-500/40 bg-blue-950/20 px-5 py-4 text-center text-sm font-semibold text-blue-100"
            >
              Solicitar preaprobación
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Spec({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black p-3">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className="text-sm font-medium text-zinc-100">{value || "—"}</p>
    </div>
  );
}
