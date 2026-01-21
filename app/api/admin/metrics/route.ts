import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function daysFromRange(range: string) {
  if (range === "1d") return 1;
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  return 7; // default 7d
}

function daysAgoISO(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function isoDay(ts: string | Date) {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  return d.toISOString().slice(0, 10);
}

function buildDayBuckets(sinceISO: string, days: number) {
  // Incluye el día de hoy. Para 7d: hoy + 6 previos.
  const since = new Date(sinceISO);
  const buckets: string[] = [];
  const today = new Date();
  // Normalizamos a día UTC
  today.setUTCHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() - (days - 1));
  // Aseguramos no empezar antes de "since"
  if (start < since) {
    // ok, keep start as computed (sinceISO viene aproximado)
  }

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    buckets.push(d.toISOString().slice(0, 10));
  }
  return buckets;
}

type Row = {
  type: string | null;
  origin: string | null;
  vehicle_id: number | null;
  vehicle_name: string | null;
  created_at: string;
  meta?: any;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "7d";
  const days = daysFromRange(range);
  const since = daysAgoISO(days);

  // Traemos meta para device_type, utm, etc.
  const { data: rows, error } = await supabaseAdmin
    .from("events")
    .select("type, origin, vehicle_id, vehicle_name, created_at, meta")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const events = (rows ?? []) as Row[];

  // Totales
  const totalsByType: Record<string, number> = {};
  const totalsByOrigin: Record<string, number> = {};
  const totalsByDevice: Record<string, number> = {};

  // Top vehicles por whatsapp_click_vehicle
  const vehicleCounts = new Map<
    string,
    { vehicle_id: number | null; vehicle_name: string | null; count: number }
  >();

  // Serie por día: total + por type
  const daysList = buildDayBuckets(since, days);

  // Inicializamos con ceros para que el gráfico tenga continuidad
  const seriesByDay: Record<
    string,
    { date: string; total: number; byType: Record<string, number> }
  > = {};

  for (const day of daysList) {
    seriesByDay[day] = { date: day, total: 0, byType: {} };
  }

  for (const e of events) {
    const type = (e.type || "unknown").toString();
    const origin = (e.origin || "unknown").toString();

    totalsByType[type] = (totalsByType[type] || 0) + 1;
    totalsByOrigin[origin] = (totalsByOrigin[origin] || 0) + 1;

    // Device desde meta.device_type (mobile/tablet/desktop)
    const device =
      (e.meta?.device_type as string | undefined) ||
      (e.meta?.device as string | undefined) ||
      "unknown";
    totalsByDevice[device] = (totalsByDevice[device] || 0) + 1;

    // Serie por día
    const day = isoDay(e.created_at);
    if (!seriesByDay[day]) {
      // Por si cae algún evento en un día fuera de buckets (diferencias de UTC)
      seriesByDay[day] = { date: day, total: 0, byType: {} };
    }

    seriesByDay[day].total += 1;
    seriesByDay[day].byType[type] = (seriesByDay[day].byType[type] || 0) + 1;

    // Top vehicles (si se trackea ese tipo)
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

  // Convertimos la serie a array ordenado
  const series = Object.values(seriesByDay).sort((a, b) =>
    a.date < b.date ? -1 : 1
  );

  return NextResponse.json({
    range,
    since,
    totalEvents: events.length,

    totalsByType,
    totalsByOrigin,
    totalsByDevice,

    // Serie diaria: total y desglose por type
    series,

    topVehicles,
  });
}
