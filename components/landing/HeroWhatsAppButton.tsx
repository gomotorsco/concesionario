"use client";

import Link from "next/link";
import { trackGtag, trackInternal } from "@/lib/track";

type Props = {
  whatsappUrl: string;
};

export default function HeroWhatsAppButton({ whatsappUrl }: Props) {
  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      onClick={() => {
        trackGtag("whatsapp_click", { origin: "hero" });
        trackInternal({ type: "whatsapp_click", origin: "hero" });
      }}
      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white shadow-[0_18px_38px_rgba(37,211,102,0.55)] hover:bg-[#20bd5a] transition"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-current"
        >
          <path d="M20.52 3.48A11.8 11.8 0 0 0 12.01 0C5.73 0 .61 5.12.61 11.4c0 2.01.53 3.97 1.55 5.7L0 24l7.09-2.19a11.37 11.37 0 0 0 4.92 1.13h.01c6.28 0 11.4-5.12 11.4-11.4 0-3.05-1.19-5.91-3.4-8.06ZM12.01 21.3c-1.57 0-3.1-.42-4.44-1.21l-.32-.19-4.21 1.3 1.37-4.09-.21-.33A9.3 9.3 0 0 1 2.3 11.4c0-5.35 4.35-9.7 9.71-9.7 2.59 0 5.02 1.01 6.85 2.85a9.58 9.58 0 0 1 2.84 6.86c0 5.35-4.35 9.7-9.69 9.7Z" />
        </svg>
      </span>
      Hablar por WhatsApp
    </Link>
  );
}
