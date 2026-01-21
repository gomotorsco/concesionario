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
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function trackGtag(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params || {});
  }
}
