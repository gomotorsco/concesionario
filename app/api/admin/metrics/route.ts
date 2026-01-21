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

  // 1) Totales por type/origin
  const { data: rows, error: err1 } = await supabaseAdmin
    .from("events")
    .select("type, origin, vehicle_id, vehicle_name, created_at")
    .gte("created_at", since);

  if (err1) {
    return NextResponse.json({ error: err1.message }, { status: 500 });
  }

  const events = rows ?? [];

  // Totales simples
  const totalsByType: Record<string, number> = {};
  const totalsByOrigin: Record<string, number> = {};

  // Top vehicles por whatsapp_click_vehicle
  const vehicleCounts = new Map<string, { vehicle_id: number | null; vehicle_name: string | null; count: number }>();

  // Serie por día
  const byDay: Record<string, number> = {};

  for (const e of events) {
    const type = (e as any).type || "unknown";
    const origin = (e as any).origin || "unknown";

    totalsByType[type] = (totalsByType[type] || 0) + 1;
    totalsByOrigin[origin] = (totalsByOrigin[origin] || 0) + 1;

    const day = new Date((e as any).created_at).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;

    if (type === "whatsapp_click_vehicle") {
      const key = `${(e as any).vehicle_id ?? "null"}::${(e as any).vehicle_name ?? ""}`;
      const curr = vehicleCounts.get(key) || {
        vehicle_id: (e as any).vehicle_id ?? null,
        vehicle_name: (e as any).vehicle_name ?? null,
        count: 0,
      };
      curr.count += 1;
      vehicleCounts.set(key, curr);
    }
  }

  const topVehicles = Array.from(vehicleCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Ordenar serie por día
  const series = Object.entries(byDay)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    range,
    since,
    totalsByType,
    totalsByOrigin,
    series,
    topVehicles,
    totalEvents: events.length,
  });
}
