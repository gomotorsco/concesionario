import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function minutesDiff(a?: string, b?: string) {
  if (!a || !b) return null;
  return Math.floor((new Date(a).getTime() - new Date(b).getTime()) / 60000);
}

export async function POST() {
  const now = new Date().toISOString();

  // 1. obtener vendedores activos
  const { data: vendedores } = await supabaseAdmin
    .from("vendedores")
    .select("*")
    .eq("activo", true);

  if (!vendedores || vendedores.length === 0) {
    return NextResponse.json({ ok: true, message: "Sin vendedores" });
  }

  // 2. leads sin asignar
  const { data: leads } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .is("vendedor_id", null)
    .eq("estado", "nuevo")
    .order("created_at", { ascending: true })
    .limit(100);

  let assigned = 0;

  const unassignedLeads = leads ?? [];

  for (let i = 0; i < unassignedLeads.length; i++) {
    const lead = unassignedLeads[i];
    const vendedor = vendedores[i % vendedores.length];

    await supabaseAdmin
      .from("landing_leads")
      .update({
        vendedor_id: vendedor.id,
        assigned_at: now,
        updated_at: now,
      })
      .eq("id", lead.id);

    await supabaseAdmin.from("system_alerts").insert([
      {
        vendedor_id: vendedor.id,
        type: "nuevo_lead",
        message: `Nuevo lead asignado: ${lead.nombre}`,
        priority: "alta",
      },
    ]);

    assigned++;
  }

  // 3. SLA check
  const { data: activos } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .neq("estado", "vendido")
    .neq("estado", "perdido");

  for (const lead of activos ?? []) {
    const created = lead.created_at;
    const last = lead.last_activity_at || lead.created_at;

    const minutos = minutesDiff(now, last);

    if (lead.estado === "nuevo" && minutos && minutos > 5) {
      await supabaseAdmin
        .from("landing_leads")
        .update({ sla_violated: true })
        .eq("id", lead.id);

      await supabaseAdmin.from("system_alerts").insert([
        {
          vendedor_id: lead.vendedor_id,
          type: "sla_alert",
          message: "Lead sin contactar hace más de 5 minutos",
          priority: "alta",
        },
      ]);
    }

    if (lead.estado === "en_seguimiento" && minutos && minutos > 1440) {
      await supabaseAdmin.from("system_alerts").insert([
        {
          vendedor_id: lead.vendedor_id,
          type: "seguimiento_alert",
          message: "Lead en seguimiento sin actividad hace 24h",
          priority: "media",
        },
      ]);
    }
  }

  return NextResponse.json({
    ok: true,
    assigned,
  });
}
