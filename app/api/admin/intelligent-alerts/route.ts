import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function hoursSince(date?: string | null) {
  if (!date) return 9999;
  return (Date.now() - new Date(date).getTime()) / 36e5;
}

function isPast(date?: string | null) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

async function createUniqueAlert(supabaseAdmin: any, payload: any) {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString();

  const { data: existing } = await supabaseAdmin
    .from("seller_alerts")
    .select("id")
    .eq("vendedor_id", payload.vendedor_id)
    .eq("lead_id", payload.lead_id)
    .eq("titulo", payload.titulo)
    .gte("created_at", since)
    .maybeSingle();

  if (existing) return false;

  await supabaseAdmin.from("seller_alerts").insert({
    vendedor_id: payload.vendedor_id,
    lead_id: payload.lead_id,
    titulo: payload.titulo,
    mensaje: payload.mensaje,
    tipo: payload.tipo,
    estado: "pendiente",
    status: "pendiente",
    scheduled_at: payload.scheduled_at ?? null,
    created_at: new Date().toISOString(),
  });

  return true;
}

export async function POST() {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: leads, error } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .not("vendedor_id", "is", null)
    .is("deleted_at", null)
    .limit(500);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  let created = 0;
  let scored = 0;

  for (const lead of leads ?? []) {
    const estado = lead.estado || lead.status || "nuevo";
    if (["vendido", "perdido", "eliminado"].includes(estado)) continue;

    const last = lead.last_activity_at || lead.updated_at || lead.created_at;
    const h = hoursSince(last);
    const followAt = lead.next_follow_up_at || lead.seguimiento_fecha || lead.llamada_fecha;

    let score = 20;
    if (lead.telefono || lead.whatsapp) score += 10;
    if (lead.vehiculo || lead.vehiculo_interes || lead.vehicle_name) score += 10;
    if (lead.cuota_mensual) score += 20;
    if (lead.valor_cuota_inicial || lead.cuota_inicial) score += 15;
    if (estado === "nuevo") score += 10;
    if (estado === "seguimiento_atrasado") score += 25;
    if (h > 24) score -= 15;

    const temperatura = score >= 70 ? "caliente" : score >= 45 ? "tibio" : "normal";

    await supabaseAdmin
      .from("landing_leads")
      .update({
        lead_score: score,
        temperatura,
        prioridad: temperatura === "caliente" ? "caliente" : lead.prioridad || "normal",
      })
      .eq("id", lead.id);

    scored++;

    if (estado === "nuevo" && h >= 2) {
      if (await createUniqueAlert(supabaseAdmin, {
        vendedor_id: lead.vendedor_id,
        lead_id: lead.id,
        titulo: "Lead nuevo sin responder",
        mensaje: `${lead.nombre || "Lead"} lleva más de 2 horas sin actividad. Contactar ahora.`,
        tipo: "urgente",
      })) created++;
    }

    if (followAt && isPast(followAt)) {
      await supabaseAdmin
        .from("landing_leads")
        .update({ estado: "seguimiento_atrasado", status: "seguimiento_atrasado" })
        .eq("id", lead.id);

      if (await createUniqueAlert(supabaseAdmin, {
        vendedor_id: lead.vendedor_id,
        lead_id: lead.id,
        titulo: "Seguimiento vencido",
        mensaje: `${lead.nombre || "Lead"} tiene seguimiento vencido. Prioridad inmediata.`,
        tipo: "urgente",
        scheduled_at: followAt,
      })) created++;
    }

    if (temperatura === "caliente") {
      if (await createUniqueAlert(supabaseAdmin, {
        vendedor_id: lead.vendedor_id,
        lead_id: lead.id,
        titulo: "Lead caliente",
        mensaje: `${lead.nombre || "Lead"} tiene alta intención comercial. Recomendado llamar hoy.`,
        tipo: "caliente",
      })) created++;
    }

    if (lead.visita_fecha && !isPast(lead.visita_fecha) && hoursSince(lead.visita_fecha) > -2) {
      if (await createUniqueAlert(supabaseAdmin, {
        vendedor_id: lead.vendedor_id,
        lead_id: lead.id,
        titulo: "Visita próxima",
        mensaje: `${lead.nombre || "Lead"} tiene visita cercana al concesionario.`,
        tipo: "visita",
        scheduled_at: lead.visita_fecha,
      })) created++;
    }
  }

  return NextResponse.json({ ok: true, scanned: leads?.length ?? 0, scored, alerts_created: created });
}

export async function GET() {
  return POST();
}
