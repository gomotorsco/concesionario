export function trackAdsConversion(sendTo: string) {
  if (typeof window === "undefined") return;
  // @ts-expect-error injected at runtime
  if (typeof window.gtag !== "function") return;

  // @ts-expect-error injected at runtime
  window.gtag("event", "conversion", { send_to: sendTo });
}
