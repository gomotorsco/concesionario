"use client";

import { useEffect, useState } from "react";
import LeadForm from "@/components/landing/LeadForm";

export default function EntryModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.sessionStorage.getItem("entry-modal-dismissed");
    if (dismissed) return;

    const timer = window.setTimeout(() => setOpen(true), 10000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Close */}
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow hover:bg-white"
        >
          <span className="sr-only">Cerrar</span>✕
        </button>

        {/* Header / Banner */}
        <div className="relative px-6 pt-6 pb-5">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800" />
          <div className="relative">
            <div className="mx-auto mb-3 inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
              ÚLTIMOS CUPOS DISPONIBLES
            </div>

            <h2 className="text-center text-lg font-semibold text-white leading-snug">
              Reservá tu cupo para el Plan Nacional
            </h2>

            <p className="mt-2 text-center text-xs text-white/80">
              Completá el formulario y un asesor te contacta.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {/* Form container */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {/* Tip: en LeadForm, idealmente pasá className para controlar spacing */}
            <LeadForm />
          </div>

          {/* Trust footer (mínimo, opcional) */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sitio seguro · Atención por WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
}
