export type DeviceKind = "mobile" | "tablet" | "desktop" | "unknown";

/* =========================
   DEVICE
========================= */
export function getDeviceKind(): DeviceKind {
  try {
    if (typeof window === "undefined") return "unknown";
    const ua = navigator.userAgent.toLowerCase();

    if (/ipad|tablet|kindle|silk|playbook/.test(ua)) return "tablet";
    if (/mobi|android|iphone|ipod/.test(ua)) return "mobile";
    return "desktop";
  } catch {
    return "unknown";
  }
}

/* =========================
   ATTRIBUTION
========================= */
export function readAttributionFromUrl() {
  try {
    if (typeof window === "undefined") return null;
    const p = new URLSearchParams(window.location.search);

    return {
      ts: new Date().toISOString(),
      utm_source: p.get("utm_source"),
      utm_medium: p.get("utm_medium"),
      utm_campaign: p.get("utm_campaign"),
      utm_content: p.get("utm_content"),
      utm_term: p.get("utm_term"),
      gclid: p.get("gclid"),
      fbclid: p.get("fbclid"),
      referrer: document.referrer || null,
      landing: window.location.pathname + window.location.search,
    };
  } catch {
    return null;
  }
}

/**
 * Persiste first-touch.
 * ✔ acepta attribution opcional
 * ✔ no pisa si ya existe
 */
export function persistFirstTouch(attrib?: any) {
  try {
    if (typeof window === "undefined") return null;

    const key = "first_touch";
    const existing = window.localStorage.getItem(key);
    if (existing) return JSON.parse(existing);

    const payload = attrib ?? readAttributionFromUrl();
    if (!payload) return null;

    window.localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Compatibilidad con código previo
 */
export function getFirstTouch() {
  return persistFirstTouch();
}

/* =========================
   CLIENT META
========================= */
export function getClientMeta() {
  try {
    if (typeof window === "undefined") return {};
    return {
      device_type: getDeviceKind(),
      lang: navigator.language || null,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.search,
      referrer: document.referrer || null,
      ua: navigator.userAgent || null,
    };
  } catch {
    return {};
  }
}

/* =========================
   INTERNAL TRACKING
========================= */
export function trackInternal(event: {
  type: string;
  origin?: string;
  vehicle_id?: number;
  vehicle_name?: string;
  meta?: any;
}) {
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        ...event,
        meta: { ...getClientMeta(), ...(event.meta || {}) },
      }),
    }).catch(() => {});
  } catch {}
}

/* =========================
   GTAG
========================= */
export function trackGtag(event: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", event, params || {});
  }
}
