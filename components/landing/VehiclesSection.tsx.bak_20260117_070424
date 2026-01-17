"use client";

import { useState } from "react";
import LeadForm from "@/components/landing/LeadForm";

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

type Props = {
  sections: Section[];
  whatsappUrl: string; // viene desde DB en la landing y se pasa acá
};

type SelectedVehicle = {
  sectionTitle: string;
  vehicle: Vehicle;
};

function formatCurrency(v: Vehicle) {
  if (v.cuota_desde == null) return "";
  const symbol = v.moneda === "ARS" ? "$" : "";
  const amount = new Intl.NumberFormat("es-AR").format(Number(v.cuota_desde));
  return `${symbol}${amount}`;
}

function buildWhatsAppLink(baseWhatsAppUrl: string, sectionTitle: string, vehicle: Vehicle) {
  const cuota = vehicle.cuota_desde != null ? formatCurrency(vehicle) : null;
  const model = `${sectionTitle} ${vehicle.title}`.trim();

  const text = cuota
    ? `Hola! Quiero reservar mi cupo para ${model}. Vi cuotas desde ${cuota}. ¿Me asesorás?`
    : `Hola! Quiero reservar mi cupo para ${model}. ¿Me asesorás?`;

  // baseWhatsAppUrl es tipo https://wa.me/5411....
  return `${baseWhatsAppUrl}?text=${encodeURIComponent(text)}`;
}

export default function VehiclesSection({ sections, whatsappUrl }: Props) {
  const [selected, setSelected] = useState<SelectedVehicle | null>(null);

  const handleReserve = (sectionTitle: string, vehicle: Vehicle) => {
    setSelected({ sectionTitle, vehicle });
  };

  const handleClose = () => {
    setSelected(null);
  };

  return (
    <>
      {/* Grilla de secciones + cards */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id}>
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              {section.title}
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              {section.vehicles.map((v) => {
                const waLink = buildWhatsAppLink(whatsappUrl, section.title, v);

                return (
                  <div
                    key={v.id}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:shadow-[0_16px_40px_rgba(15,23,42,0.20)] hover:-translate-y-0.5 transition"
                  >
                    {v.imagen_url && (
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={v.imagen_url}
                          alt={`${section.title} ${v.title}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-4 flex flex-col gap-2 flex-1">
                      {/* título + badge tasa */}
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {section.title} {v.title}
                        </h4>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                          Tasa 0%*
                        </span>
                      </div>

                      {/* texto de cuotas */}
                      {v.cuota_desde != null && (
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">Cuotas desde </span>
                          <span className="font-semibold">{formatCurrency(v)}</span>
                        </p>
                      )}

                      {/* CTA principal + alternativa WhatsApp */}
                      <div className="mt-3 space-y-2">
                        {/* botón reserva (abre modal con form) */}
                        <button
                          type="button"
                          onClick={() => handleReserve(section.title, v)}
                          className="w-full inline-flex items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-xs md:text-sm font-semibold text-white hover:bg-blue-700 transition"
                        >
                          Reservá tu cupo
                        </button>

                        {/* alternativa WhatsApp (menos fricción) */}
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-3 py-2 text-xs md:text-sm font-semibold transition"
                        >
                          Reservar por WhatsApp
                        </a>

                        <p className="text-[11px] text-slate-500">
                          Formulario o WhatsApp. Te contactamos sin compromiso.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de reserva */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2 sm:px-4">
          <div
            className="
              w-full max-w-sm sm:max-w-md md:max-w-lg
              rounded-2xl bg-white shadow-xl relative
              p-4 sm:p-5
              max-h-[85vh] md:max-h-[70vh]
              overflow-y-auto
            "
          >
            {/* botón cerrar */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>

            {/* header */}
            <div className="mb-2 pr-7">
              <h2 className="text-lg font-semibold text-gray-900">Reservá tu cupo</h2>
              <p className="text-sm text-gray-600">
                {selected.sectionTitle} {selected.vehicle.title} · Cuotas desde{" "}
                {selected.vehicle.cuota_desde != null && (
                  <span className="font-semibold">{formatCurrency(selected.vehicle)}</span>
                )}
              </p>
            </div>

            {/* mini foto + texto */}
            <div className="flex gap-3 mb-3">
              {selected.vehicle.imagen_url && (
                <img
                  src={selected.vehicle.imagen_url}
                  alt={`${selected.sectionTitle} ${selected.vehicle.title}`}
                  className="h-16 w-24 sm:h-20 sm:w-32 rounded-lg object-cover"
                />
              )}
              <p className="text-xs text-gray-500">
                Completá tus datos para reservar tu cupo. Si preferís, también podés
                reservar por WhatsApp y te respondemos más rápido.
              </p>
            </div>

            {/* CTA WhatsApp dentro del modal */}
            <a
              href={buildWhatsAppLink(whatsappUrl, selected.sectionTitle, selected.vehicle)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mb-3 inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-2 text-sm font-semibold transition"
            >
              Reservar por WhatsApp
            </a>

            {/* formulario */}
            <div className="mt-1">
              <LeadForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
