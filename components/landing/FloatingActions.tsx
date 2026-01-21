"use client";

import { trackGtag, trackInternal } from "@/lib/track";

type Props = {
  whatsappUrl: string;
};

export default function FloatingActions({ whatsappUrl }: Props) {
  const handleWhatsAppClick = () => {
    // Google (Ads/GA4)
    trackGtag("whatsapp_click", { origin: "floating" });

    // Métricas internas (DB)
    trackInternal({ type: "whatsapp_click", origin: "floating" });

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        type="button"
        onClick={handleWhatsAppClick}
        className="flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium px-4 py-2 shadow-[0_12px_24px_rgba(16,185,129,0.35)]"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 border border-white/30">
          <span className="text-lg">💬</span>
        </span>
        Hablar por WhatsApp
      </button>
    </div>
  );
}
