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
  whatsappUrl: string; // viene desde DB en la landing
};

function formatCurrency(v: Vehicle) {
  if (v.cuota_desde == null) return "";
  const symbol = v.moneda === "ARS" ? "$" : "";
  const amount = new Intl.NumberFormat("es-AR").format(Number(v.cuota_desde));
  return `${symbol}${amount}`;
}

function buildWhatsAppLink(
  baseWhatsAppUrl: string,
  sectionTitle: string,
  vehicle: Vehicle
) {
  const cuota = vehicle.cuota_desde != null ? formatCurrency(vehicle) : null;
  const model = `${sectionTitle} ${vehicle.title}`.trim();

  const text = cuota
    ? `Hola! Quiero reservar mi cupo para ${model}. Vi cuotas desde ${cuota}. ¿Me asesorás?`
    : `Hola! Quiero reservar mi cupo para ${model}. ¿Me asesorás?`;

  // baseWhatsAppUrl es tipo https://wa.me/5411....
  return `${baseWhatsAppUrl}?text=${encodeURIComponent(text)}`;
}

/**
 * Abre el EntryModal (el modal "lindo con logo") disparando un evento global.
 * EntryModal debe escuchar: window.addEventListener("open-entry-modal", ...)
 */
function openEntryModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("open-entry-modal"));
  }
}

export default function VehiclesSection({ sections, whatsappUrl }: Props) {
  // Sin modal interno: evitamos doble modal (EntryModal + modal de autos)
  const [lastClicked, setLastClicked] = useState<{
    sectionTitle: string;
    vehicle: Vehicle;
  } | null>(null);

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
                const vehicleName = `${section.title} ${v.title}`.trim();

                return (
                  <div
                    key={v.id}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:shadow-[0_16px_40px_rgba(15,23,42,0.20)] hover:-translate-y-0.5 transition"
                  >
                    {v.imagen_url && (
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={v.imagen_url}
                          alt={vehicleName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-4 flex flex-col gap-2 flex-1">
                      {/* título + badge tasa */}
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {vehicleName}
                        </h4>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                          Tasa 0%*
                        </span>
                      </div>

                      {/* texto de cuotas */}
                      {v.cuota_desde != null && (
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">Cuotas desde </span>
                          <span className="font-semibold">
                            {formatCurrency(v)}
                          </span>
                        </p>
                      )}

                      {/* CTA principal + alternativa WhatsApp */}
                      <div className="mt-3 space-y-2">
                        {/* botón reserva: abre EntryModal (NO abre modal interno) */}
                        <button
                          type="button"
                          onClick={() => {
                            // Tracking: intención de contacto vía formulario/modal
                            if (
                              typeof window !== "undefined" &&
                              typeof window.gtag === "function"
                            ) {
                              window.gtag("event", "vehicle_interest", {
                                vehicle_id: v.id,
                                vehicle_name: vehicleName,
                                origin: "vehicle_card",
                              });
                            }

                            setLastClicked({
                              sectionTitle: section.title,
                              vehicle: v,
                            });
                            openEntryModal();
                          }}
                          className="w-full inline-flex items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-xs md:text-sm font-semibold text-white hover:bg-blue-700 transition"
                        >
                          Reservá tu cupo
                        </button>

                        {/* alternativa WhatsApp (menos fricción) */}
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            // Tracking: click WhatsApp por vehículo
                            if (
                              typeof window !== "undefined" &&
                              typeof window.gtag === "function"
                            ) {
                              window.gtag("event", "whatsapp_click_vehicle", {
                                vehicle_id: v.id,
                                vehicle_name: vehicleName,
                                origin: "vehicle_card",
                              });
                            }
                          }}
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

      {/*
        Opcional (no visible): si en el futuro querés que EntryModal muestre el modelo seleccionado,
        podés guardar `lastClicked` en sessionStorage acá.
        Por ahora lo dejamos como estado local para potencial uso futuro.
      */}
      {lastClicked ? null : null}
    </>
  );
}
