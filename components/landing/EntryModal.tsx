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
      <div className="relative w-full max-w-md mx-auto rounded-3xl bg-white text-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-slate-700 hover:bg-black/20"
        >
          <span className="sr-only">Cerrar</span>✕
        </button>

        <div className="px-5 pt-10 pb-5">
          <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1 text-center">
            Reservá tu cupo para el Plan Nacional
          </h2>

          <p className="text-[12px] font-semibold text-red-600 mb-4 text-center">
            Últimos cupos disponibles
          </p>

          <div className="border border-slate-200 rounded-2xl bg-slate-50 px-3 py-3">
            <LeadForm />
          </div>
        </div>
      </div>
    </div>
  );
}
