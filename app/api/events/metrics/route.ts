import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function clampRange(range: string) {
  if (range === "90d") return { range: "90d", days: 90 };
  if (range === "30d") return { range: "30d", days: 30 };
  return { range: "7d", days: 7 };
}

type Row = {
  type: string | null;
  origin: string | null;
  vehicle_id: number | null;
  vehicle_name: string | null;
  created_at: string;
  meta: any;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const rawRange = url.searchParams.get("range") || "7d"; // 7d | 30d | 90d
    const { range, days } = clampRange(rawRange);
    const since = daysAgoISO(days);

    const { data: rows, error } = await supabaseAdmin
      .from("events")
      .select("type, origin, vehicle_id, vehicle_name, created_at, meta")
      .gte("created_at", since);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const events: Row[] = (rows as Row[]) ?? [];

    // Totales y series
    const totalsByType: Record<string, number> = {};
    const totalsByOrigin: Record<string, number> = {};
    const byDay: Record<string, number> = {};

    // Breakdown: device / utm_campaign / utm_source
    const totalsByDevice: Record<string, number> = {};
    const totalsByCampaign: Record<string, number> = {};
    const totalsBySource: Record<string, number> = {};

    // Top vehicles por whatsapp_click_vehicle
    const vehicleCounts = new Map<
      string,
      { vehicle_id: number | null; vehicle_name: string | null; count: number }
    >();

    // Funnel
    const funnel = {
      page_view: 0,
      entry_modal_open: 0,
      whatsapp_click: 0,
      whatsapp_click_vehicle: 0,
      lead_submit: 0,
    };

    for (const e of events) {
      const type = (e.type || "unknown") as string;
      const origin = (e.origin || "unknown") as string;

      totalsByType[type] = (totalsByType[type] || 0) + 1;
      totalsByOrigin[origin] = (totalsByOrigin[origin] || 0) + 1;

      const day = new Date(e.created_at).toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;

      const meta = (e.meta || {}) as any;
      const device = (meta.device_type || meta.device || "unknown") as string;
      totalsByDevice[device] = (totalsByDevice[device] || 0) + 1;

      const campaign =
        meta.utm_campaign || meta.attribution?.utm_campaign || "unknown";
      const source = meta.utm_source || meta.attribution?.utm_source || "unknown";

      totalsByCampaign[String(campaign)] =
        (totalsByCampaign[String(campaign)] || 0) + 1;
      totalsBySource[String(source)] = (totalsBySource[String(source)] || 0) + 1;

      // Funnel counters
      if (type in funnel) {
        (funnel as any)[type] += 1;
      }

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

    // Helpers: top lists (ordenados)
    function topN(obj: Record<string, number>, n = 10) {
      return Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([key, count]) => ({ key, count }));
    }

    return NextResponse.json({
      range,
      since,
      totalEvents: events.length,
      totalsByType,
      totalsByOrigin,
      totalsByDevice,
      totalsByCampaign,
      totalsBySource,
      topLists: {
        devices: topN(totalsByDevice, 10),
        campaigns: topN(totalsByCampaign, 10),
        sources: topN(totalsBySource, 10),
        origins: topN(totalsByOrigin, 15),
        types: topN(totalsByType, 15),
      },
      funnel,
      series,
      topVehicles,
    });
  } catch (err: any) {
    console.error("GET /api/events/metrics error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
