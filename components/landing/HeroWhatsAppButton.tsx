"use client";

import { trackGtag, trackInternal, getFirstTouch } from "@/lib/track";

const SEND_TO_WHATSAPP = "AW-17876395056/WHATSAPP_CONVERSION_LABEL"; // <-- CAMBIAR

export default function HeroWhatsAppButton({ whatsappUrl }: { whatsappUrl: string }) {
  const onClick = () => {
    const firstTouch = getFirstTouch();

    trackInternal({
      type: "whatsapp_click",
      origin: "hero",
      meta: { attribution: firstTouch },
    });

    // Evento general
    trackGtag("whatsapp_click", { origin: "hero", ...(firstTouch || {}) });

    // Conversión Ads (cuando tengas el label real)
    trackGtag("conversion", { send_to: SEND_TO_WHATSAPP });
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="px-7 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-sm font-medium text-white shadow-[0_18px_40px_rgba(16,185,129,0.45)] transition"
    >
      WhatsApp
    </a>
  );
}
