import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
const supabaseAdmin = getSupabaseAdmin()!;

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function pct(num: number, den: number) {
  if (!den) return 0;
  return Math.round((num / den) * 1000) / 10; // 1 decimal
}

export async function GET(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") || "7d") as "7d" | "30d";
  const days = range === "30d" ? 30 : 7;
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
  const devices: Record<string, number> = {};
  const whatsappByOrigin: Record<string, number> = {};

  const byTypeByDay: Record<string, Record<string, number>> = {};
  const topVehiclesMap = new Map<
    string,
    { vehicle_id: number | null; vehicle_name: string | null; count: number }
  >();

  const countMap = new Map<string, number>();
  const bump = (m: Map<string, number>, k: string | null | undefined) => {
    const key = (k && String(k).trim()) || "(none)";
    m.set(key, (m.get(key) || 0) + 1);
  };

  const utmSource = new Map<string, number>();
  const utmCampaign = new Map<string, number>();
  const utmTerm = new Map<string, number>();
  const landing = new Map<string, number>();

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
    devices[String(device)] = (devices[String(device)] || 0) + 1;

    if (type === "whatsapp_click" || type === "whatsapp_click_vehicle") {
      whatsappByOrigin[origin] = (whatsappByOrigin[origin] || 0) + 1;
    }

    // series por día por type
    const day = new Date(e.created_at).toISOString().slice(0, 10);
    byTypeByDay[type] = byTypeByDay[type] || {};
    byTypeByDay[type][day] = (byTypeByDay[type][day] || 0) + 1;

    // top vehicles
    if (type === "whatsapp_click_vehicle") {
      const key = `${e.vehicle_id ?? "null"}::${e.vehicle_name ?? ""}`;
      const curr = topVehiclesMap.get(key) || {
        vehicle_id: e.vehicle_id ?? null,
        vehicle_name: e.vehicle_name ?? null,
        count: 0,
      };
      curr.count += 1;
      topVehiclesMap.set(key, curr);
    }

    // attribution (UTM + landing)
    const meta = e.meta || {};
    bump(utmSource, meta.utm_source);
    bump(utmCampaign, meta.utm_campaign);
    bump(utmTerm, meta.utm_term);
    bump(landing, meta.page_path || meta.landing || meta.path);
  }

  // seriesByType: { [type]: [{date,count}] }
  const seriesByType: Record<string, { date: string; count: number }[]> = {};
  for (const [type, byDay] of Object.entries(byTypeByDay)) {
    seriesByType[type] = Object.entries(byDay)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));
  }

  const page_views = totalsByType.page_view || 0;
  const modal_opens =
    (totalsByType.entry_modal_open || 0) + (totalsByType.cta_open_modal_vehicle || 0);
  const whatsapp_total = (totalsByType.whatsapp_click || 0) + (totalsByType.whatsapp_click_vehicle || 0);
  const whatsapp_vehicle = totalsByType.whatsapp_click_vehicle || 0;
  const lead_submit = totalsByType.lead_submit || 0;

  const topVehicles = Array.from(topVehiclesMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  const topFromMap = (m: Map<string, number>) =>
    Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([key, count]) => ({ key, count }));

  return NextResponse.json({
    range,
    since,
    totalEvents: events.length,
    totalsByType,
    totalsByOrigin,
    seriesByType,
    funnel: {
      page_views,
      modal_opens,
      whatsapp_total,
      whatsapp_vehicle,
      lead_submit,
      conv_lead_from_pv: pct(lead_submit, page_views),
      conv_whatsapp_from_pv: pct(whatsapp_total, page_views),
    },
    topVehicles,
    devices,
    whatsappByOrigin,
    topUtmSource: topFromMap(utmSource),
    topUtmCampaign: topFromMap(utmCampaign),
    topUtmTerm: topFromMap(utmTerm),
    topLanding: topFromMap(landing),
  });
}
