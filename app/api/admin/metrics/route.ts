import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type SeriesPoint = { date: string; count: number };

function daysAgoISO(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function ensureSeriesKeys(rangeDays: number) {
  // Devuelve array de días YYYY-MM-DD (incluye hoy) para que el gráfico no “salte”
  const out: string[] = [];
  const now = new Date();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "7d"; // 7d | 30d
    const days = range === "30d" ? 30 : 7;
    const since = daysAgoISO(days);

    // Traemos meta porque ahí guardamos device_type + utm + etc
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

    // seriesByType[type][day] = count
    const seriesByTypeDay: Record<string, Record<string, number>> = {};
    const allDays = ensureSeriesKeys(days);

    // Funnel
    let pageViews = 0;
    let modalOpens = 0;
    let whatsappTotal = 0;
    let whatsappVehicle = 0;
    let leadSubmit = 0;

    // Top vehicles (por whatsapp_click_vehicle)
    const vehicleCounts = new Map<
      string,
      { vehicle_id: number | null; vehicle_name: string | null; count: number }
    >();

    // Dispositivos
    const devices: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };

    // UTM / keywords
    const utmSource: Record<string, number> = {};
    const utmCampaign: Record<string, number> = {};
    const utmTerm: Record<string, number> = {};
    const landing: Record<string, number> = {};

    // Orígenes de WhatsApp
    const whatsappByOrigin: Record<string, number> = {};

    for (const e of events) {
      const type = e.type || "unknown";
      const origin = e.origin || "unknown";
      const created_at = e.created_at;
      const meta = e.meta || {};

      totalsByType[type] = (totalsByType[type] || 0) + 1;
      totalsByOrigin[origin] = (totalsByOrigin[origin] || 0) + 1;

      const day = dayKey(created_at);

      // series por type
      if (!seriesByTypeDay[type]) seriesByTypeDay[type] = {};
      seriesByTypeDay[type][day] = (seriesByTypeDay[type][day] || 0) + 1;

      // Funnel
      if (type === "page_view") pageViews += 1;
      if (type === "entry_modal_open") modalOpens += 1;
      if (type === "whatsapp_click") whatsappTotal += 1;
      if (type === "whatsapp_click_vehicle") whatsappVehicle += 1;
      if (type === "lead_submit") leadSubmit += 1;

      // WhatsApp por origen
      if (type === "whatsapp_click" || type === "whatsapp_click_vehicle") {
        whatsappByOrigin[origin] = (whatsappByOrigin[origin] || 0) + 1;
      }

      // Top vehicles
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

      // Device
      const device = (meta.device_type || meta.device || "unknown") as string;
      if (devices[device] === undefined) devices[device] = 0;
      devices[device] += 1;

      // UTM
      const src = meta.utm_source || meta.attrib?.utm_source;
      const camp = meta.utm_campaign || meta.attrib?.utm_campaign;
      const term = meta.utm_term || meta.attrib?.utm_term;
      const land = meta.landing || meta.attrib?.landing || meta.page_path || null;

      if (src) utmSource[String(src)] = (utmSource[String(src)] || 0) + 1;
      if (camp) utmCampaign[String(camp)] = (utmCampaign[String(camp)] || 0) + 1;
      if (term) utmTerm[String(term)] = (utmTerm[String(term)] || 0) + 1;
      if (land) landing[String(land)] = (landing[String(land)] || 0) + 1;
    }

    // seriesByType: array ordenada por fecha, con 0 en días sin eventos
    const seriesByType: Record<string, SeriesPoint[]> = {};
    for (const [type, byDay] of Object.entries(seriesByTypeDay)) {
      seriesByType[type] = allDays.map((d) => ({ date: d, count: byDay[d] || 0 }));
    }

    const topVehicles = Array.from(vehicleCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    function topKV(obj: Record<string, number>, limit = 10) {
      return Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([key, count]) => ({ key, count }));
    }

    const funnel = {
      page_views: pageViews,
      modal_opens: modalOpens,
      whatsapp_total: whatsappTotal,
      whatsapp_vehicle: whatsappVehicle,
      lead_submit: leadSubmit,
      // Conversión simple
      conv_lead_from_pv: pageViews > 0 ? Number(((leadSubmit / pageViews) * 100).toFixed(2)) : 0,
      conv_whatsapp_from_pv: pageViews > 0 ? Number(((whatsappTotal / pageViews) * 100).toFixed(2)) : 0,
    };

    return NextResponse.json({
      range,
      since,
      totalEvents: events.length,
      totalsByType,
      totalsByOrigin,
      seriesByType,
      funnel,
      topVehicles,
      devices,
      whatsappByOrigin,
      topUtmSource: topKV(utmSource, 10),
      topUtmCampaign: topKV(utmCampaign, 10),
      topUtmTerm: topKV(utmTerm, 10),
      topLanding: topKV(landing, 10),
    });
  } catch (err: any) {
    console.error("GET /api/admin/metrics error:", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
