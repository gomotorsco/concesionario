"use client";

import { useEffect } from "react";
import {
  getDeviceKind,
  persistFirstTouch,
  readAttributionFromUrl,
  trackInternal,
  trackGtag,
} from "@/lib/track";

export default function ClientAnalytics() {
  useEffect(() => {
    // Evitar doble conteo por re-mounts
    const key = "pv_sent_" + location.pathname + location.search;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const attrib = readAttributionFromUrl() || undefined;
    persistFirstTouch(attrib);

    const device = getDeviceKind();

    // GA/Ads event
    trackGtag("page_view", {
      page_location: window.location.href,
      page_path: window.location.pathname,
      device,
      ...(attrib || {}),
    });

    // Internal event
    trackInternal({
      type: "page_view",
      origin: "landing",
      meta: {
        device_type: device,
        href: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer || null,
        viewport: { w: window.innerWidth, h: window.innerHeight },
        ...(attrib ? attrib : {}),
      },
    });
  }, []);

  return <span data-client-analytics="1" className="hidden" />;
}
