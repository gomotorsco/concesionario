import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function hoursSince(date?: string | null) {
  if (!date) return 9999;
  return (Date.now() - new Date(date).getTime()) / 1000 / 60 / 60;
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("landing_leads")
    .select("id, nombre, telefono, vendedor_id, estado, seguimiento, created_at, last_activity_at, vehicle_name")
    .neq("estado", "eliminado")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json({ ok: false, actions: [], message: error.message }, { status: 500 });
  }

  const actions = (data ?? []).flatMap((l: any) => {
    const items: any[] = [];
    const h = hoursSince(l.last_activity_at ?? l.created_at);

    if (!l.vendedor_id) {
      items.push({
        lead_id: l.id,
        priority: "alta",
        action: "Asignar vendedor",
        reason: "Lead sin responsable comercial.",
        nombre: l.nombre,
        telefono: l.telefono,
        vehicle_name: l.vehicle_name,
      });
    }

    if ((l.estado ?? "nuevo") === "nuevo" && h >= 24) {
      items.push({
        lead_id: l.id,
        priority: "alta",
        action: "Contactar ahora",
        reason: "Lead nuevo sin actividad por más de 24 horas.",
        nombre: l.nombre,
        telefono: l.telefono,
        vehicle_name: l.vehicle_name,
      });
    }

    return items;
  });

  return NextResponse.json({ ok: true, actions });
}
