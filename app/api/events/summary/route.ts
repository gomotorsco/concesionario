import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "7d"; // 7d | 30d | 90d
  const days = range === "90d" ? 90 : range === "30d" ? 30 : 7;
  const since = daysAgoISO(days);

  const { data: rows, error } = await supabaseAdmin
    .from("events")
    .select("type, origin, vehicle_id, vehicle_name, created_at, meta")
    .gte("created_at", since);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const events = (rows ?? []) as any[];

  const totalsByType: Record<string, number> = {};
  const totalsByOrigin: Record<string, number> = {};
  const totalsByDevice: Record<string, number> = {};
  const byDayType: Record<string, Record<string, number>> = {};
  const byDayTotal: Record<string, number> = {};

  const vehicleCounts = new Map<
    string,
    { vehicle_id: number | null; vehicle_name: string | null; count: number }
  >();

  for (const e of events) {
    const type = e.type || "unknown";
    const origin = e.origin || "unknown";

    totalsByType[type] = (totalsByType[type] || 0) + 1;
    totalsByOrigin[origin] = (totalsByOrigin[origin] || 0) + 1;

    const device =
      e?.meta?.device_type ||
      e?.meta?.device ||
      e?.meta?.deviceKind ||
      "unknown";
    totalsByDevice[device] = (totalsByDevice[device] || 0) + 1;

    const day = new Date(e.created_at).toISOString().slice(0, 10);
    byDayTotal[day] = (byDayTotal[day] || 0) + 1;
    byDayType[day] = byDayType[day] || {};
    byDayType[day][type] = (byDayType[day][type] || 0) + 1;

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
    .map(([date, total]) => ({
      date,
      total,
      byType: byDayType[date] || {},
    }));

  return NextResponse.json({
    range,
    since,
    totalsByType,
    totalsByOrigin,
    totalsByDevice,
    series,
    topVehicles,
    totalEvents: events.length,
  });
}
