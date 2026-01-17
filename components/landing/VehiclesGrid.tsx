"use client";

import { useEffect, useState } from "react";

type Vehicle = {
  id: number;
  title: string;
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
  whatsappUrl: string; // viene desde la landing (DB -> buildWhatsAppUrl)
};

export default function VehiclesGrid({ whatsappUrl }: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/vehicles");
        const json = await res.json();
        setSections(json.sections ?? []);
      } catch (e) {
        console.error("Error cargando vehículos", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading && sections.length === 0) {
    return <p className="text-sm text-slate-500">Cargando autos disponibles...</p>;
  }

  if (sections.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Todavía no hay autos cargados en el panel interno.
      </p>
    );
  }

  const buildWhatsAppLink = (modelTitle: string) => {
    const text = `Hola! Quiero reservar mi cupo y recibir info por ${modelTitle}.`;
    return `${whatsappUrl}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.id}>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">{section.title}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.vehicles?.map((v) => (
              <article
                key={v.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col"
              >
                {v.imagen_url && (
                  <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.imagen_url}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h4 className="text-base font-semibold text-slate-900">{v.title}</h4>

                  {v.cuota_desde != null && (
                    <p className="text-sm text-slate-700">
                      Cuota desde{" "}
                      <span className="font-semibold">
                        {v.moneda ?? "ARS"} {Number(v.cuota_desde).toLocaleString("es-AR")}
                      </span>
                    </p>
                  )}

                  <div className="mt-auto space-y-2 pt-2">
                    <a
                      href="#form"
                      className="w-full inline-flex justify-center items-center rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold py-2.5 transition-colors"
                    >
                      Reservá tu cupo
                    </a>

                    <a
                      href={buildWhatsAppLink(v.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex justify-center items-center rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm font-semibold py-2.5 transition-colors"
                    >
                      Reservar por WhatsApp
                    </a>

                    <p className="text-[11px] text-slate-500">
                      Ejemplo ilustrativo. Los valores finales dependen del plan, cupo disponible y
                      condiciones vigentes.
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
