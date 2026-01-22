export function getClientMeta() {
  try {
    if (typeof window === "undefined") return {};
    const ua = navigator.userAgent || "";
    const lang = navigator.language || null;

    const s = ua.toLowerCase();
    const device_type =
      /(ipad|tablet|kindle|silk|playbook)/i.test(s)
        ? "tablet"
        : /(mobi|android|iphone|ipod)/i.test(s)
        ? "mobile"
        : "desktop";

    const page_location = window.location.href;
    const page_path = window.location.pathname + window.location.search;
    const referrer = document.referrer || null;

    return { ua, lang, device_type, page_location, page_path, referrer };
  } catch {
    return {};
  }
}

export function getFirstTouch() {
  try {
    if (typeof window === "undefined") return null;

    const key = "first_touch";
    const existing = window.localStorage.getItem(key);
    if (existing) return JSON.parse(existing);

    const params = new URLSearchParams(window.location.search);
    const payload = {
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

    window.localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

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

export function trackGtag(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params || {});
  }
}
