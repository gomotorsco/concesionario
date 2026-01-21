"use client";

import { useEffect } from "react";
import { getDeviceKind, persistFirstTouch, readAttributionFromUrl, trackInternal, trackGtag } from "@/lib/track";

export default function ClientAnalytics() {
  useEffect(() => {
    // Evitar doble conteo por hot reload / re-mounts
    const key = "pv_sent_" + location.pathname + location.search;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const attrib = readAttributionFromUrl();
    persistFirstTouch(attrib);

    const device = getDeviceKind();

    trackGtag("page_view", {
      page_location: window.location.href,
      page_path: window.location.pathname,
      device,
      ...attrib,
    });

    trackInternal({
      type: "page_view",
      origin: "landing",
      meta: {
        href: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer || null,
        device,
        ua: navigator.userAgent,
        viewport: { w: window.innerWidth, h: window.innerHeight },
        attrib,
      },
    });
  }, []);

  return null;
}
