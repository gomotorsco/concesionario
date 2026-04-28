"use client";

import { useEffect, useState } from "react";

type Vehicle = {
  id: number;
  title: string;
  slug: string;
  cuota_desde: number | null;
  moneda: string | null;
  imagen_url: string | null;
};

type Section = {
  id: number;
  title: string;
  vehicles: Vehicle[];
};

type Props = {
  whatsappUrl: string;
};

export default function VehiclesGrid({ whatsappUrl }: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/vehicles");
      const json = await res.json();
      setSections(json.sections ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando vehículos...</p>;
  }

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <div key={section.id}>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">
            {section.title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.vehicles.map((v) => {
              const wa = `${whatsappUrl}?text=${encodeURIComponent(
                `Hola, me interesa ${v.title}`
              )}`;

              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
                >
                  {v.imagen_url && (
                    <img
                      src={v.imagen_url}
                      className="h-52 w-full object-cover"
                    />
                  )}

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="font-semibold text-lg">{v.title}</h3>

                    {v.cuota_desde && (
                      <p className="text-sm text-slate-600">
                        Desde {v.moneda ?? "COP"}{" "}
                        {Number(v.cuota_desde).toLocaleString()}
                      </p>
                    )}

                    <div className="mt-auto space-y-2">
                      <a
                        href={`/vehiculos/${v.slug}`}
                        className="block text-center bg-blue-600 text-white py-2 rounded-xl font-semibold"
                      >
                        Ver vehículo
                      </a>

                      <a
                        href={`/preaprobacion?vehiculo=${encodeURIComponent(v.title)}`}
                        className="block text-center border border-blue-600 text-blue-600 py-2 rounded-xl font-semibold"
                      >
                        Solicitar preaprobación
                      </a>

                      <a
                        href={wa}
                        target="_blank"
                        className="block text-center border border-green-500 text-green-600 py-2 rounded-xl"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
