import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AlertInput = {
  vendedor_id: string;
  lead_id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
};

async function createAlert(supabaseAdmin: any, alert: AlertInput) {
  const { data: existing } = await supabaseAdmin
    .from("seller_alerts")
    .select("id")
    .eq("vendedor_id", alert.vendedor_id)
    .eq("lead_id", alert.lead_id)
    .eq("type", alert.type)
    .in("status", ["pendiente", "nueva"])
    .maybeSingle();

  if (existing) return false;

  const { error } = await supabaseAdmin.from("seller_alerts").insert({
    vendedor_id: alert.vendedor_id,
    lead_id: alert.lead_id,

    title: alert.title,
    message: alert.message,
    type: alert.type,
    priority: alert.priority,
    read: false,

    titulo: alert.title,
    mensaje: alert.message,
    tipo: alert.type,
    estado: "pendiente",
    status: "pendiente",

    created_at: new Date().toISOString(),
  });

  if (error) throw error;
  return true;
}

function hoursSince(date?: string | null) {
  if (!date) return 9999;
  return (Date.now() - new Date(date).getTime()) / 36e5;
}

function leadName(lead: any) {
  return lead.nombre || "Lead";
}

function vehicleName(lead: any) {
  return lead.vehiculo || lead.vehiculo_interes || lead.vehicle_name || "un vehículo";
}

export async function POST() {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: leads, error } = await supabaseAdmin
    .from("landing_leads")
    .select("id,nombre,telefono,whatsapp,estado,vendedor_id,lead_score,temperatura,last_activity_at,next_follow_up_at,seguimiento_fecha,created_at,vehiculo,vehiculo_interes,vehicle_name,cuota_mensual,tiene_cuota_inicial,valor_cuota_inicial")
    .not("vendedor_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  let created = 0;

  for (const lead of leads ?? []) {
    const vendedor_id = String(lead.vendedor_id);
    const lead_id = Number(lead.id);
    const estado = String(lead.estado || "nuevo").toLowerCase();
    const score = Number(lead.lead_score || 0);
    const temperatura = String(lead.temperatura || "").toLowerCase();

    const inactiveHours = hoursSince(lead.last_activity_at || lead.created_at);
    const followUpDate = lead.next_follow_up_at || lead.seguimiento_fecha;
    const followUpOverdue = followUpDate && new Date(followUpDate).getTime() < Date.now();

    if ((temperatura === "caliente" || score >= 70) && inactiveHours >= 2 && !["vendido", "perdido", "eliminado"].includes(estado)) {
      if (await createAlert(supabaseAdmin, {
        vendedor_id,
        lead_id,
        title: "Lead caliente sin responder",
        message: `${leadName(lead)} está interesado en ${vehicleName(lead)} y lleva más de 2 horas sin actividad. Contactalo ahora.`,
        type: "hot_lead_idle",
        priority: "high",
      })) created++;
    }

    if (estado === "nuevo" && inactiveHours >= 1) {
      if (await createAlert(supabaseAdmin, {
        vendedor_id,
        lead_id,
        title: "Lead nuevo pendiente",
        message: `${leadName(lead)} todavía no fue trabajado. Primer contacto recomendado por WhatsApp.`,
        type: "new_lead_pending",
        priority: "medium",
      })) created++;
    }

    if (followUpOverdue && !["vendido", "perdido", "eliminado"].includes(estado)) {
      if (await createAlert(supabaseAdmin, {
        vendedor_id,
        lead_id,
        title: "Seguimiento vencido",
        message: `Tenías seguimiento pendiente con ${leadName(lead)} por ${vehicleName(lead)}. Retomá el contacto.`,
        type: "followup_overdue",
        priority: "high",
      })) created++;
    }

    if ((lead.cuota_mensual || lead.tiene_cuota_inicial || lead.valor_cuota_inicial) && !["vendido", "perdido", "eliminado"].includes(estado)) {
      if (await createAlert(supabaseAdmin, {
        vendedor_id,
        lead_id,
        title: "Cliente con interés financiero",
        message: `${leadName(lead)} dejó datos de financiación. Recomendado enviar simulación o pedir documentos.`,
        type: "finance_interest",
        priority: "medium",
      })) created++;
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: leads?.length ?? 0,
    created,
    message: `Alertas inteligentes generadas: ${created}`,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Motor de alertas inteligentes activo.",
  });
}
