"use client";

import { useEffect, useState } from "react";
import LeadForm from "@/components/landing/LeadForm";

export default function EntryModal() {
  const [open, setOpen] = useState(false);

  // Mostrar solo una vez por sesión, con delay de ~10 segundos
  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = window.sessionStorage.getItem("entry-modal-dismissed");
    if (dismissed) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 10000); // 10.000 ms = 10 segundos

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function close() {
    setOpen(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("entry-modal-dismissed", "1");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      {/* CARD centrada, con margen y scroll interno en mobile */}
      <div className="relative w-full max-w-md mx-auto rounded-3xl bg-white text-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* BOTÓN CERRAR */}
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-slate-700 hover:bg-black/20"
        >
          <span className="sr-only">Cerrar</span>
          ✕
        </button>

        {/* CONTENIDO */}
        <div className="px-5 pt-10 pb-5">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 mb-2 text-center">
            Consulta de acceso a tu 0km
          </p>

          <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-2 text-center">
            Solicitá acceso a tu próximo 0km en cuotas
          </h2>

          <p className="text-[12px] text-slate-600 mb-3 text-center">
            Ingresá tus datos para recibir{" "}
            <span className="font-semibold">información oficial</span> sobre financiación,
            requisitos y modelos disponibles. Al completar el formulario obtenés:
          </p>

          <ul className="text-[12px] text-slate-700 mb-3 space-y-1">
            <li>• <span className="font-semibold">Planes vigentes actualizados</span></li>
            <li>• <span className="font-semibold">Bonificaciones disponibles</span></li>
            <li>• <span className="font-semibold">Requisitos mínimos</span> según tu perfil</li>
            <li>• <span className="font-semibold">Modelos en entrega rápida</span></li>
          </ul>

          <p className="text-[12px] text-slate-600 mb-2 text-center">
            Un asesor <span className="font-semibold">oficial</span> te confirmará disponibilidad y los pasos para avanzar.
          </p>

          <p className="text-[12px] font-semibold text-red-600 mb-4 text-center">
            Quedan pocos cupos habilitados esta semana. Procesamos solicitudes por orden de llegada.
          </p>

          {/* FORMULARIO REAL, SIN TEXTO DE "VERSIÓN RÁPIDA/COMPACTA" */}
          <div className="border border-slate-200 rounded-2xl bg-slate-50 px-3 py-3">
            <div className="space-y-3">
              <LeadForm />
            </div>
          </div>

          {/* LINK AL FORM PRINCIPAL, POR SI QUIERE SALIR */}
          <button
            type="button"
            onClick={() => {
              close();
              if (typeof window !== "undefined") {
                const section = document.querySelector("#form");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
            className="mt-4 w-full rounded-full border border-slate-300 bg-white text-xs font-medium text-slate-700 py-2"
          >
            Ver formulario en pantalla completa
          </button>
        </div>
      </div>
    </div>
  );
}
