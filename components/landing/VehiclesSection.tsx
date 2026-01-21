"use client";

import { useState } from "react";
import LeadForm from "@/components/landing/LeadForm";
import { trackGtag, trackInternal } from "@/lib/track";

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

  return `${baseWhatsAppUrl}?text=${encodeURIComponent(text)}`;
}

function openEntryModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("open-entry-modal"));
  }
}

function getAttributionFromUrl() {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const sp = url.searchParams;

  const utm = {
    utm_source: sp.get("utm_source"),
    utm_medium: sp.get("utm_medium"),
    utm_campaign: sp.get("utm_campaign"),
    utm_term: sp.get("utm_term"),
    utm_content: sp.get("utm_content"),
    gclid: sp.get("gclid"),
    referrer: document.referrer || null,
    landing_path: window.location.pathname,
  };

  return utm;
}

export default function VehiclesSection({ sections, whatsappUrl }: Props) {
  const [lastClicked, setLastClicked] = useState<{
    sectionTitle: string;
    vehicle: Vehicle;
  } | null>(null);

  const saveSelectedVehicleContext = (sectionTitle: string, v: Vehicle) => {
    if (typeof window === "undefined") return;
    const model = `${sectionTitle} ${v.title}`.trim();

    const payload = {
      vehicle_id: v.id,
      vehicle_name: model,
      origin: "vehicle_card",
      attribution: getAttributionFromUrl(),
      ts: Date.now(),
    };

    // Contexto para LeadForm (submit)
    window.sessionStorage.setItem("selected_vehicle_ctx", JSON.stringify(payload));
  };

  return (
    <>
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id}>
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              {section.title}
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              {section.vehicles.map((v) => {
                const model = `${section.title} ${v.title}`.trim();
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
                          alt={model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {model}
                        </h4>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                          Tasa 0%*
                        </span>
                      </div>

                      {v.cuota_desde != null && (
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">Cuotas desde </span>
                          <span className="font-semibold">{formatCurrency(v)}</span>
                        </p>
                      )}

                      <div className="mt-3 space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setLastClicked({ sectionTitle: section.title, vehicle: v });

                            // Guardar contexto para el formulario
                            saveSelectedVehicleContext(section.title, v);

                            // Tracking modal open asociado al vehículo
                            trackGtag("entry_modal_open", {
                              origin: "vehicle_card_button",
                              vehicle_id: v.id,
                              vehicle_name: model,
                            });
                            trackInternal({
                              type: "entry_modal_open",
                              origin: "vehicle_card_button",
                              vehicle_id: v.id,
                              vehicle_name: model,
                              meta: { ...getAttributionFromUrl() },
                            });

                            openEntryModal();
                          }}
                          className="w-full inline-flex items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-xs md:text-sm font-semibold text-white hover:bg-blue-700 transition"
                        >
                          Reservá tu cupo
                        </button>

                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            // Guardar contexto por si luego envía el form
                            saveSelectedVehicleContext(section.title, v);

                            // Tracking WhatsApp por vehículo
                            trackGtag("whatsapp_click_vehicle", {
                              origin: "vehicle_card",
                              vehicle_id: v.id,
                              vehicle_name: model,
                            });
                            trackInternal({
                              type: "whatsapp_click_vehicle",
                              origin: "vehicle_card",
                              vehicle_id: v.id,
                              vehicle_name: model,
                              meta: { ...getAttributionFromUrl(), href: waLink },
                            });

                            // Si querés convertir en Google Ads también (opcional):
                            // trackGtag("conversion", { send_to: "AW-XXXX/XXXX" });
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

      {lastClicked ? null : null}
    </>
  );
}
