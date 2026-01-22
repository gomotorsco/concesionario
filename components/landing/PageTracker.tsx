"use client";

import { useEffect } from "react";
import { trackInternal } from "@/lib/track";

function getDevice() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("tablet") || ua.includes("ipad")) return "tablet";
  if (ua.includes("mobi") || ua.includes("android")) return "mobile";
  return "desktop";
}

export default function PageTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const meta = {
      path: url.pathname,
      ref: document.referrer || null,
      device: getDevice(),
      utm_source: url.searchParams.get("utm_source"),
      utm_medium: url.searchParams.get("utm_medium"),
      utm_campaign: url.searchParams.get("utm_campaign"),
      utm_term: url.searchParams.get("utm_term"),
      utm_content: url.searchParams.get("utm_content"),
      gclid: url.searchParams.get("gclid"),
    };

    trackInternal({ type: "page_view", origin: "landing", meta });
  }, []);

  return null;
}
