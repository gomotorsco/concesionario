export type DeviceKind = "mobile" | "tablet" | "desktop" | "unknown";

export function getDeviceKind(): DeviceKind {
  try {
    if (typeof window === "undefined") return "unknown";
    const ua = navigator.userAgent || "";
    const s = ua.toLowerCase();

    if (/(ipad|tablet|kindle|silk|playbook)/i.test(s)) return "tablet";
    if (/(mobi|android|iphone|ipod)/i.test(s)) return "mobile";
    return "desktop";
  } catch {
    return "unknown";
  }
}

export function getClientMeta() {
  try {
    if (typeof window === "undefined") return {};
    const ua = navigator.userAgent || "";
    const lang = navigator.language || null;

    const device_type = getDeviceKind();

    const page_location = window.location.href;
    const page_path = window.location.pathname + window.location.search;
    const referrer = document.referrer || null;

    return { ua, lang, device_type, page_location, page_path, referrer };
  } catch {
    return {};
  }
}

/**
 * Lee attribution desde URL (UTM/GCLID/FBCLID).
 * Nota: NO persiste por sí sola; usar persistFirstTouch().
 */
export function readAttributionFromUrl() {
  try {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);

    return {
      ts: new Date().toISOString(),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      utm_term: params.get("utm_term"),
      gclid: params.get("gclid"),
      fbclid: params.get("fbclid"),
      referrer: document.referrer || null,
      landing: window.location.pathname + window.location.search,
    };
  } catch {
    return null;
  }
}

/**
 * Persiste primer touch (solo si no existe).
 * Devuelve el objeto persistido (o el existente).
 */
export function persistFirstTouch() {
  try {
    if (typeof window === "undefined") return null;

    const key = "first_touch";
    const existing = window.localStorage.getItem(key);
    if (existing) return JSON.parse(existing);

    const payload = readAttributionFromUrl();
    if (!payload) return null;

    window.localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Compatibilidad con tu código previo.
 * Devuelve el first touch y lo crea si no existe.
 */
export function getFirstTouch() {
  return persistFirstTouch();
}

/**
 * Tracking interno (DB events)
 */
export function trackInternal(event: {
  type: string;
  origin?: string;
  vehicle_id?: number;
  vehicle_name?: string;
  meta?: any;
}) {
  try {
    const meta = { ...(getClientMeta() as any), ...(event.meta || {}) };

    const payload = {
      type: event.type,
      origin: event.origin,
      vehicle_id: event.vehicle_id,
      vehicle_name: event.vehicle_name,
      meta,
    };

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

/**
 * Google gtag wrapper (Ads/GA4)
 */
export function trackGtag(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params || {});
  }
}
