import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function daysAgoISO(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "7d"; // 7d | 30d | 90d
  const days = range === "30d" ? 30 : range === "90d" ? 90 : 7;
  const since = daysAgoISO(days);

  const { data: rows, error } = await supabaseAdmin
    .from("events")
    .select("type, origin, vehicle_id, vehicle_name, created_at, meta")
    .gte("created_at", since);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const events = rows ?? [];

  const totalsByType: Record<string, number> = {};
  const totalsByOrigin: Record<string, number> = {};
  const byDay: Record<string, number> = {};

  // device breakdown si viene en meta.device_type
  const totalsByDevice: Record<string, number> = {};

  // UTM breakdown si viene en meta.utm_source/utm_campaign
  const totalsByUtmSource: Record<string, number> = {};
  const totalsByUtmCampaign: Record<string, number> = {};

  const vehicleCounts = new Map<
    string,
    { vehicle_id: number | null; vehicle_name: string | null; count: number }
  >();

  for (const e of events as any[]) {
    const type = e.type || "unknown";
    const origin = e.origin || "unknown";

    totalsByType[type] = (totalsByType[type] || 0) + 1;
    totalsByOrigin[origin] = (totalsByOrigin[origin] || 0) + 1;

    const day = new Date(e.created_at).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;

    const meta = e.meta || {};
    const device = meta.device_type || meta.device || null;
    if (device) totalsByDevice[String(device)] = (totalsByDevice[String(device)] || 0) + 1;

    const utm_source = meta.utm_source || meta.attrib?.utm_source || null;
    const utm_campaign = meta.utm_campaign || meta.attrib?.utm_campaign || null;
    if (utm_source) totalsByUtmSource[String(utm_source)] = (totalsByUtmSource[String(utm_source)] || 0) + 1;
    if (utm_campaign) totalsByUtmCampaign[String(utm_campaign)] = (totalsByUtmCampaign[String(utm_campaign)] || 0) + 1;

    // Top vehicles por whatsapp_click_vehicle (o tu evento de CTA)
    if (type === "whatsapp_click_vehicle") {
      const key = `${e.vehicle_id ?? "null"}::${e.vehicle_name ?? ""}`;
      const curr = vehicleCounts.get(key) || {
        vehicle_id: e.vehicle_id ?? null,
        vehicle_name: e.vehicle_name ?? null,
        count: 0,
      };
      curr.count += 1;
      vehicleCounts.set(key, curr);
    }
  }

  const topVehicles = Array.from(vehicleCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const series = Object.entries(byDay)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    range,
    since,
    totalsByType,
    totalsByOrigin,
    totalsByDevice,
    totalsByUtmSource,
    totalsByUtmCampaign,
    series,
    topVehicles,
    totalEvents: events.length,
  });
}
