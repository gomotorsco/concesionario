type InternalEvent = {
  type: string;
  origin?: string;
  vehicle_id?: number;
  vehicle_name?: string;
  meta?: Record<string, any>;
};

export function trackGtag(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params || {});
  }
}

export function getDeviceKind(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  const w = Math.min(window.innerWidth || 0, screen.width || 0);

  if (/(ipad|tablet)/.test(ua) || (w >= 600 && w <= 1024 && /android/.test(ua))) return "tablet";
  if (/(mobi|iphone|android)/.test(ua) || w < 600) return "mobile";
  return "desktop";
}

export function readAttributionFromUrl() {
  if (typeof window === "undefined") return {};
  const u = new URL(window.location.href);
  const sp = u.searchParams;

  const keys = [
    "gclid","gbraid","wbraid",
    "utm_source","utm_medium","utm_campaign","utm_term","utm_content",
  ];

  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = sp.get(k);
    if (v) out[k] = v;
  }
  return out;
}

export function persistFirstTouch(attrib: Record<string, string>) {
  if (typeof window === "undefined") return;
  const existing = window.localStorage.getItem("first_touch_attrib");
  if (existing) return;
  window.localStorage.setItem("first_touch_attrib", JSON.stringify(attrib));
}

export function getFirstTouch(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("first_touch_attrib");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function trackInternal(event: InternalEvent) {
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
