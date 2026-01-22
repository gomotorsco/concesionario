type InternalEvent = {
  type: string;
  origin?: string;
  vehicle_id?: number;
  vehicle_name?: string;
  meta?: any;
};

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

export function trackGtag(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params || {});
  }
}
