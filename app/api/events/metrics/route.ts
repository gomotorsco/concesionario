import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "7d"; // 7d | 30d
  const days = range === "30d" ? 30 : 7;
  const since = daysAgoISO(days);

  const { data, error } = await supabaseAdmin
    .from("events")
    .select("type, origin, vehicle_id, vehicle_name, created_at")
    .gte("created_at", since);

  if (error) {
    console.error("Metrics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const events = (data ?? []) as any[];

  const totalsByType: Record<string, number> = {};
  const totalsByOrigin: Record<string, number> = {};
  const byDay: Record<string, number> = {};

  const vehicleCounts = new Map<
    string,
    { vehicle_id: number | null; vehicle_name: string | null; count: number }
  >();

  let visits = 0;

  for (const e of events) {
    const type = (e.type || "unknown").toString();
    const origin = (e.origin || "unknown").toString();

    // Totales
    totalsByType[type] = (totalsByType[type] || 0) + 1;
    totalsByOrigin[origin] = (totalsByOrigin[origin] || 0) + 1;

    // Visits (page_view o visit)
    if (type === "page_view" || type === "visit") {
      visits += 1;
    }

    // Serie diaria
    if (e.created_at) {
      const day = new Date(e.created_at).toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    }

    // Top vehículos
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

    // Métricas principales
    visits,
    totalEvents: events.length,

    // Detalles
    totalsByType,
    totalsByOrigin,
    series,
    topVehicles,
  });
}
