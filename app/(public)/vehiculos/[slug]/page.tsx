import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { VehicleLeadForm } from "./VehicleLeadForm";

type Props = {
  params: Promise<{ slug: string }>;
};

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
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto max-w-7xl px-4 py-10">
        <a href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Volver
        </a>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* GALERÍA */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-white/10">
              {vehicle.imagen_url ? (
                <img src={vehicle.imagen_url} className="h-[420px] w-full object-cover" />
              ) : (
                <div className="h-[420px] flex items-center justify-center text-zinc-500">
                  Sin imagen
                </div>
              )}
            </div>
          </div>

          {/* PANEL DERECHO */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black">{name}</h1>

              <p className="mt-2 text-zinc-400">
                {vehicle.marca} · {vehicle.modelo} · {vehicle.anio}
              </p>
            </div>

            {/* PRECIO */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-zinc-500">Precio</p>
              <p className="text-3xl font-bold text-emerald-400">
                {price
                  ? `${vehicle.moneda ?? "COP"} ${Number(price).toLocaleString()}`
                  : "Consultar"}
              </p>
            </div>

            {/* BENEFICIOS */}
            <div className="space-y-2 text-sm text-zinc-300">
              <p>✔ Financiación disponible</p>
              <p>✔ Recibimos vehículo en parte de pago</p>
              <p>✔ Evaluación inicial sin costo</p>
            </div>

            {/* BOTONES */}
            <div className="space-y-3">
              <a
                href={`/preaprobacion?vehiculo=${encodeURIComponent(name)}`}
                className="block text-center bg-blue-600 py-3 rounded-xl font-bold"
              >
                Solicitar preaprobación
              </a>

              <a
                href={`https://wa.me/?text=${wa}`}
                target="_blank"
                className="block text-center border border-green-500 text-green-400 py-3 rounded-xl"
              >
                WhatsApp
              </a>
            </div>

            {/* FORMULARIO */}
            <VehicleLeadForm vehicleId={vehicle.id} vehicleName={name} />
          </div>
        </div>

        {/* DETALLES */}
        <section className="mt-12 grid gap-6 md:grid-cols-4">
          <Spec label="Marca" value={vehicle.marca} />
          <Spec label="Modelo" value={vehicle.modelo} />
          <Spec label="Año" value={vehicle.anio} />
          <Spec label="Km" value={vehicle.km} />
        </section>

        {vehicle.descripcion && (
          <section className="mt-10">
            <h2 className="text-xl font-bold">Descripción</h2>
            <p className="mt-3 text-zinc-300">{vehicle.descripcion}</p>
          </section>
        )}
      </section>
    </main>
  );
}

function Spec({ label, value }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-semibold">{value || "—"}</p>
    </div>
  );
}
