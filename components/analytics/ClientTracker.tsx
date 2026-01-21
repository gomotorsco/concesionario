"use client";

import { useEffect } from "react";
import { trackInternal } from "@/lib/track";

function getDeviceType() {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w <= 768) return "mobile";
  if (w <= 1024) return "tablet";
  return "desktop";
}

function getQueryParams() {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);

  const pick = (k: string) => sp.get(k) || null;

  return {
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    utm_content: pick("utm_content"),
    utm_term: pick("utm_term"),
    gclid: pick("gclid"),
  };
}

type Props = {
  origin?: string;
};

export default function ClientTracker({ origin = "landing" }: Props) {
  useEffect(() => {
    try {
      const meta = {
        path: window.location.pathname,
        search: window.location.search,
        referrer: document.referrer || null,
        device_type: getDeviceType(),
        ua: navigator.userAgent || null,
        ...getQueryParams(),
      };

      trackInternal({
        type: "page_view",
        origin,
        meta,
      });
    } catch {
      // no-op
    }
  }, [origin]);

  return null;
}
