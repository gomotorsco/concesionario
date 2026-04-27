import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function monthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function pct(num: number, den: number) {
  if (!den) return 0;
  return Math.round((num / den) * 1000) / 10;
}

function semaforo({
  total,
  nuevos,
  vendidos,
  perdidos,
  conversion,
  progresoMeta,
}: {
  total: number;
  nuevos: number;
  vendidos: number;
  perdidos: number;
  conversion: number;
  progresoMeta: number;
}) {
  if (total === 0) return "gris";
  if (progresoMeta >= 70 || conversion >= 12) return "verde";
  if (total >= 10 && vendidos === 0) return "rojo";
  if (perdidos > vendidos && total >= 5) return "rojo";
  if (nuevos > 10) return "amarillo";
  return "amarillo";
}

export async function GET() {
  const since = monthStartISO();

  const { data: vendedores, error: vendedoresError } = await supabaseAdmin
    .from("vendedores")
    .select("id, nombre, email, meta_mensual, activo, created_at")
    .order("created_at", { ascending: true });

  if (vendedoresError) {
    console.error("commercial-metrics vendedores error", vendedoresError);
    return NextResponse.json({ ok: false, message: vendedoresError.message }, { status: 500 });
  }

  const { data: leads, error: leadsError } = await supabaseAdmin
    .from("landing_leads")
    .select("id, vendedor_id, estado, seguimiento, created_at")
    .gte("created_at", since)
    .neq("estado", "eliminado");

  if (leadsError) {
    console.error("commercial-metrics leads error", leadsError);
    return NextResponse.json({ ok: false, message: leadsError.message }, { status: 500 });
  }

  const allLeads = leads ?? [];
  const sellers = vendedores ?? [];

  const rows = sellers.map((v: any) => {
    const assigned = allLeads.filter((l: any) => l.vendedor_id === v.id);
    const total = assigned.length;
    const nuevos = assigned.filter((l: any) => (l.estado ?? "nuevo") === "nuevo").length;
    const enSeguimiento = assigned.filter((l: any) => (l.estado ?? "") === "en_seguimiento" || (l.seguimiento ?? "").trim() !== "").length;
    const vendidos = assigned.filter((l: any) => (l.estado ?? "") === "vendido").length;
    const perdidos = assigned.filter((l: any) => (l.estado ?? "") === "perdido").length;
    const trabajados = enSeguimiento + vendidos + perdidos;
    const meta = Number(v.meta_mensual ?? 10);

    const conversion = pct(vendidos, total);
    const progresoMeta = pct(vendidos, meta);
    const ratioTrabajo = pct(trabajados, total);

    return {
      id: v.id,
      nombre: v.nombre,
      email: v.email,
      activo: v.activo,
      meta_mensual: meta,
      total_leads: total,
      nuevos,
      en_seguimiento: enSeguimiento,
      vendidos,
      perdidos,
      trabajados,
      sin_trabajar: nuevos,
      conversion,
      progreso_meta: progresoMeta,
      ratio_trabajo: ratioTrabajo,
      ventas_faltantes: Math.max(meta - vendidos, 0),
      semaforo: semaforo({
        total,
        nuevos,
        vendidos,
        perdidos,
        conversion,
        progresoMeta,
      }),
    };
  });

  const sinAsignar = allLeads.filter((l: any) => !l.vendedor_id).length;
  const totalVentas = rows.reduce((acc: number, r: any) => acc + r.vendidos, 0);
  const totalLeads = rows.reduce((acc: number, r: any) => acc + r.total_leads, 0);
  const totalPerdidos = rows.reduce((acc: number, r: any) => acc + r.perdidos, 0);

  const ranking = [...rows].sort((a: any, b: any) => {
    if (b.vendidos !== a.vendidos) return b.vendidos - a.vendidos;
    return b.conversion - a.conversion;
  });

  const alerts: string[] = [];

  if (sinAsignar > 0) alerts.push(`Hay ${sinAsignar} leads sin asignar a vendedores.`);
  for (const r of rows) {
    if (r.total_leads >= 10 && r.vendidos === 0) {
      alerts.push(`${r.nombre} tiene ${r.total_leads} leads este mes y todavía no registra ventas.`);
    }
    if (r.conversion > 0 && r.conversion < 10 && r.total_leads >= 10) {
      alerts.push(`${r.nombre} tiene conversión baja (${r.conversion}%).`);
    }
    if (r.perdidos > r.vendidos && r.total_leads >= 5) {
      alerts.push(`${r.nombre} tiene más leads perdidos que vendidos.`);
    }
    if (r.nuevos >= 8) {
      alerts.push(`${r.nombre} tiene ${r.nuevos} leads nuevos sin trabajar.`);
    }
  }

  return NextResponse.json({
    ok: true,
    since,
    summary: {
      vendedores: rows.length,
      activos: rows.filter((r: any) => r.activo).length,
      total_leads: totalLeads,
      total_ventas: totalVentas,
      total_perdidos: totalPerdidos,
      sin_asignar: sinAsignar,
      conversion_general: pct(totalVentas, totalLeads),
    },
    rows,
    ranking,
    alerts,
  });
}
