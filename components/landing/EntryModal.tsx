"use client";

import { useEffect, useState } from "react";
import LeadForm from "@/components/landing/LeadForm";

export default function EntryModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = window.sessionStorage.getItem("entry-modal-dismissed");
    if (dismissed) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, []);

  function close() {
    setOpen(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("entry-modal-dismissed", "1");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3">
      <div className="relative w-full max-w-lg mx-auto rounded-2xl bg-white text-slate-900 shadow-xl p-4">
        
        <button
          onClick={close}
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/10 hover:bg-black/20"
        >
          ✕
        </button>

        <p className="text-[10px] tracking-widest text-center text-slate-500 font-semibold mb-1">
          CONSULTA DE ACCESO A TU 0KM
        </p>

        <h2 className="text-[15px] font-semibold text-center mb-2">
          Solicitá acceso a tu próximo 0km en cuotas
        </h2>

        <p className="text-[11px] text-center text-slate-600 mb-2 leading-tight">
          Ingresá tus datos para recibir financiación, requisitos y modelos en entrega rápida.
        </p>

        <p className="text-[11px] font-semibold text-center text-red-600 mb-3 leading-tight">
          Quedan pocos cupos habilitados esta semana.
        </p>

        {/* FORMULARIO COMPACTO */}
        <div className="space-y-2">
          <LeadForm compact />
        </div>

      </div>
    </div>
  );
}
