import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function normalizeRange(range: string) {
  // soporta: 1d | 7d | 30d | 90d
  if (range === "1d") return { range: "1d", days: 1 };
  if (range === "30d") return { range: "30d", days: 30 };
  if (range === "90d") return { range: "90d", days: 90 };
  return { range: "7d", days: 7 };
}

function inferDeviceTypeFromUA(ua?: string | null): "mobile" | "tablet" | "desktop" | "unknown" {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/(ipad|tablet|kindle|silk|playbook)/i.test(s)) return "tablet";
  if (/(mobi|android|iphone|ipod)/i.test(s)) return "mobile";
  return "desktop";
}

export async function GET(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  try {
    const url = new URL(req.url);
    const rawRange = url.searchParams.get("range") || "7d";
    const { range, days } = normalizeRange(rawRange);
    const since = daysAgoISO(days);

    const { data: rows, error } = await supabaseAdmin
      .from("events")
      .select("type, origin, vehicle_id, vehicle_name, created_at, meta")
      .gte("created_at", since);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const events = (rows ?? []) as any[];

    // Totales por type/origin/device
    const totalsByType: Record<string, number> = {};
    const totalsByOrigin: Record<string, number> = {};
    const totalsByDevice: Record<string, number> = {};

    // Serie diaria (total)
    const byDayTotal: Record<string, number> = {};
    // Serie diaria por type
    const byDayByType: Record<string, Record<string, number>> = {};

    // Top vehicles por whatsapp_click_vehicle
    const vehicleCounts = new Map<
      string,
      { vehicle_id: number | null; vehicle_name: string | null; count: number }
    >();

    for (const e of events) {
      const type = (e.type as string) || "unknown";
      const origin = (e.origin as string) || "unknown";

      totalsByType[type] = (totalsByType[type] || 0) + 1;
      totalsByOrigin[origin] = (totalsByOrigin[origin] || 0) + 1;

      const createdAt = e.created_at ? new Date(e.created_at) : new Date();
      const day = createdAt.toISOString().slice(0, 10);

      byDayTotal[day] = (byDayTotal[day] || 0) + 1;
      byDayByType[day] = byDayByType[day] || {};
      byDayByType[day][type] = (byDayByType[day][type] || 0) + 1;

      const meta = e.meta || {};
      const device =
        meta.device_type ||
        inferDeviceTypeFromUA(meta.ua || meta.user_agent || null);

      totalsByDevice[device] = (totalsByDevice[device] || 0) + 1;

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

    const series = Object.entries(byDayTotal)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));

    // seriesByType: [{date, totals:{type:count}}]
    const seriesByType = Object.entries(byDayByType)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, totals]) => ({ date, totals }));

    return NextResponse.json({
      range,
      since,
      totalsByType,
      totalsByOrigin,
      totalsByDevice,
      series,
      seriesByType,
      topVehicles,
      totalEvents: events.length,
    });
  } catch (err: any) {
    console.error("GET /api/events/stats error:", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
