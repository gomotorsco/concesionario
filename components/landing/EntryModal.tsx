"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LeadForm from "@/components/landing/LeadForm";
import { trackGtag, trackInternal } from "@/lib/track";

import logo from "./logo.png";

export default function EntryModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = window.sessionStorage.getItem("entry-modal-dismissed");
    if (!dismissed) {
      const timer = window.setTimeout(() => {
        trackGtag("entry_modal_open", { origin: "auto_delay_10s" });
        trackInternal({ type: "entry_modal_open", origin: "auto_delay_10s" });
        setOpen(true);
      }, 10000);

      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onOpen = () => {
      trackGtag("entry_modal_open", { origin: "manual_event" });
      trackInternal({ type: "entry_modal_open", origin: "manual_event" });
      setOpen(true);
    };

    window.addEventListener("open-entry-modal", onOpen);
    return () => window.removeEventListener("open-entry-modal", onOpen);
  }, []);

  function close() {
    trackGtag("entry_modal_close", { origin: "close_button" });
    trackInternal({ type: "entry_modal_close", origin: "close_button" });

    setOpen(false);
    window.sessionStorage.setItem("entry-modal-dismissed", "1");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow hover:bg-white"
        >
          <span className="sr-only">Cerrar</span>✕
        </button>

        <div className="relative px-6 pt-6 pb-5">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800" />
          <div className="relative">
            <div className="mb-3 flex justify-center">
              <div className="rounded-2xl bg-white/10 px-3 py-2 ring-1 ring-white/15">
                <Image
                  src={logo}
                  alt="Logo"
                  width={140}
                  height={40}
                  priority
                  className="h-8 w-auto"
                />
              </div>
            </div>

            <div className="mx-auto mb-3 inline-flex w-full items-center justify-center">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
                ÚLTIMOS CUPOS DISPONIBLES
              </span>
            </div>

            <h2 className="text-center text-lg font-semibold text-white leading-snug">
              Reservá tu cupo para el Plan Nacional
            </h2>

            <p className="mt-2 text-center text-xs text-white/80">
              Completá el formulario y un asesor te contacta.
            </p>
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <LeadForm />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sitio seguro · Atención por WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
}
