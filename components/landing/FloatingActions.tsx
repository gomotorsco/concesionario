"use client";

import { useEffect, useState } from "react";
import { trackGtag, trackInternal } from "@/lib/track";

type Seller = {
  id: string;
  nombre: string;
  whatsapp: string;
  foto_url?: string | null;
  zona?: string | null;
  last_activity?: string | null;
};

type Props = {
  whatsappUrl: string;
};

function buildWa(numberOrUrl: string, name?: string) {
  const base = numberOrUrl.startsWith("http")
    ? numberOrUrl
    : `https://wa.me/${numberOrUrl.replace(/[^\d]/g, "")}`;

  const text = name
    ? `Hola ${name}, quiero información sobre un vehículo en GoMotorsCo.`
    : "Hola, quiero información sobre un vehículo en GoMotorsCo.";

  return `${base}${base.includes("?") ? "&" : "?"}text=${encodeURIComponent(text)}`;
}

export default function FloatingActions({ whatsappUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);

  async function loadSellers() {
    try {
      const res = await fetch("/api/public/online-sellers", { cache: "no-store" });
      const json = await res.json();
      setSellers(json.sellers ?? []);
    } catch {
      setSellers([]);
    }
  }

  useEffect(() => {
    loadSellers();
    const id = setInterval(loadSellers, 60000);
    return () => clearInterval(id);
  }, []);

  function track(origin = "floating") {
    trackGtag("whatsapp_click", { origin });
    trackInternal({ type: "whatsapp_click", origin });
  }

  function handleMainClick() {
    track();

    if (sellers.length > 0) {
      setOpen((v) => !v);
      return;
    }

    window.open(buildWa(whatsappUrl), "_blank", "noopener,noreferrer");
  }

  function openSeller(seller: Seller) {
    track("floating_seller_online");
    window.open(buildWa(seller.whatsapp, seller.nombre), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {open && sellers.length > 0 ? (
        <div className="w-[310px] overflow-hidden rounded-[26px] border border-white/15 bg-[#07110d]/95 text-white shadow-[0_28px_90px_rgba(0,0,0,.35)] backdrop-blur-xl">
          <div className="border-b border-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
              Asesores en línea
            </p>
            <p className="mt-1 text-sm text-white/70">
              Elegí con quién querés hablar ahora.
            </p>
          </div>

          <div className="max-h-[330px] overflow-y-auto p-3">
            {sellers.map((seller) => (
              <button
                key={seller.id}
                onClick={() => openSeller(seller)}
                className="mb-2 flex w-full items-center gap-3 rounded-2xl bg-white/8 p-3 text-left transition hover:bg-white/14"
              >
                <div className="relative">
                  <img
                    src={seller.foto_url || "/logo-gomotorsco.png"}
                    alt={seller.nombre}
                    className="h-12 w-12 rounded-full bg-white object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#07110d] bg-emerald-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">{seller.nombre}</p>
                  <p className="truncate text-xs text-white/55">{seller.zona || "Asesor comercial"}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-emerald-300">En línea ahora</p>
                </div>

                <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-black">
                  WhatsApp
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              track("floating_general_fallback");
              window.open(buildWa(whatsappUrl), "_blank", "noopener,noreferrer");
            }}
            className="w-full border-t border-white/10 px-4 py-3 text-sm font-black text-white/80 hover:bg-white/8"
          >
            Hablar con WhatsApp general
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleMainClick}
        className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-black text-white shadow-[0_12px_24px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400"
      >
        <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-white/10">
          <span className="text-lg">💬</span>
          {sellers.length > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-200" />
          ) : null}
        </span>
        {sellers.length > 0 ? `${sellers.length} asesor${sellers.length === 1 ? "" : "es"} en línea` : "Hablar por WhatsApp"}
      </button>
    </div>
  );
}
