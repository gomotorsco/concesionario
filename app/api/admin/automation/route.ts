import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function hoursSince(date?: string | null) {
  if (!date) return 9999;
  return (Date.now() - new Date(date).getTime()) / 1000 / 60 / 60;
}

async function createAlert(vendedor_id: string, title: string, message: string, priority = "warning") {
  const { data: existing } = await supabaseAdmin
    .from("seller_alerts")
    .select("id")
    .eq("vendedor_id", vendedor_id)
    .eq("title", title)
    .eq("read", false)
    .limit(1);

  if (existing && existing.length > 0) return;

  await supabaseAdmin.from("seller_alerts").insert([
    {
      vendedor_id,
      title,
      message,
      priority,
    },
  ]);
}

export async function POST() {
  try {
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("landing_leads")
      .select("id, nombre, vendedor_id, estado, created_at, last_activity_at")
      .neq("estado", "eliminado");

    if (leadsError) {
      return NextResponse.json({ ok: false, message: leadsError.message }, { status: 500 });
    }

    const { data: vendedores, error: vendedoresError } = await supabaseAdmin
      .from("vendedores")
      .select("id, nombre, last_activity, activo")
      .eq("activo", true);

    if (vendedoresError) {
      return NextResponse.json({ ok: false, message: vendedoresError.message }, { status: 500 });
    }

    let alertsCreated = 0;

    for (const l of leads ?? []) {
      if (!l.vendedor_id) continue;

      const baseDate = l.last_activity_at ?? l.created_at;
      const h = hoursSince(baseDate);

      if ((l.estado ?? "nuevo") === "nuevo" && h >= 24) {
        await createAlert(
          l.vendedor_id,
          "Lead nuevo sin contactar",
          `El lead ${l.nombre} lleva más de 24 horas sin actividad. Contactalo o actualizá el estado.`,
          "urgent"
        );
        alertsCreated++;
      }

      if ((l.estado ?? "") === "en_seguimiento" && h >= 48) {
        await createAlert(
          l.vendedor_id,
          "Seguimiento vencido",
          `El lead ${l.nombre} lleva más de 48 horas sin actualización. Hacé seguimiento.`,
          "warning"
        );
        alertsCreated++;
      }
    }

    for (const v of vendedores ?? []) {
      const h = hoursSince(v.last_activity);

      if (h >= 24) {
        await createAlert(
          v.id,
          "Actividad comercial pendiente",
          `No registrás actividad comercial reciente. Revisá tus leads y actualizá seguimientos.`,
          "warning"
        );
        alertsCreated++;
      }
    }

    return NextResponse.json({
      ok: true,
      checked_leads: leads?.length ?? 0,
      checked_vendedores: vendedores?.length ?? 0,
      alerts_created: alertsCreated,
    });
  } catch (err) {
    console.error("POST /api/admin/automation error", err);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
