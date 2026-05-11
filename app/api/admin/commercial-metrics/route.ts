import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function getMonthInfo() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startISO: start.toISOString(),
    totalDays: end.getDate(),
    currentDay: now.getDate(),
    remainingDays: Math.max(end.getDate() - now.getDate(), 0),
  };
}

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { ok: false, message: "Faltan variables de Supabase." },
      { status: 500 }
    );
  }

  const { startISO, totalDays, currentDay, remainingDays } = getMonthInfo();

  const { data: vendedores, error: vendedoresError } = await supabaseAdmin
    .from("vendedores")
    .select("*");

  if (vendedoresError) {
    return NextResponse.json(
      { ok: false, message: vendedoresError.message },
      { status: 500 }
    );
  }

  const { data: leads, error: leadsError } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .gte("created_at", startISO);

  if (leadsError) {
    return NextResponse.json(
      { ok: false, message: leadsError.message },
      { status: 500 }
    );
  }

  const rows = (vendedores ?? []).map((v: any) => {
    const sellerLeads = (leads ?? []).filter(
      (l: any) => String(l.vendedor_id || "") === String(v.id)
    );

    const vendidos = sellerLeads.filter(
      (l: any) => (l.estado || l.status) === "vendido"
    ).length;

    const nuevos = sellerLeads.filter(
      (l: any) => (l.estado || l.status) === "nuevo"
    ).length;

    const perdidos = sellerLeads.filter(
      (l: any) => (l.estado || l.status) === "perdido"
    ).length;

    const metaMensual = Number(v.meta_mensual || v.meta_ventas || 10);

    const ritmoActual =
      vendidos / Math.max(currentDay, 1);

    const ritmoNecesario =
      metaMensual / totalDays;

    const proyeccionFinal =
      Math.round(ritmoActual * totalDays);

    let probabilidad: "alta" | "media" | "baja" = "baja";

    if (proyeccionFinal >= metaMensual) {
      probabilidad = "alta";
    } else if (proyeccionFinal >= metaMensual * 0.7) {
      probabilidad = "media";
    }

    let semaforo: "verde" | "amarillo" | "rojo" | "gris" = "gris";

    if (probabilidad === "alta") {
      semaforo = "verde";
    } else if (probabilidad === "media") {
      semaforo = "amarillo";
    } else {
      semaforo = "rojo";
    }

    return {
      id: v.id,
      nombre: v.nombre || "Sin nombre",
      email: v.email || null,
      activo: v.activo ?? true,

      total_leads: sellerLeads.length,
      nuevos,
      vendidos,
      perdidos,

      meta_mensual: metaMensual,

      ritmo_actual: Number(ritmoActual.toFixed(2)),
      ritmo_necesario: Number(ritmoNecesario.toFixed(2)),

      proyeccion_final: proyeccionFinal,

      probabilidad,
      semaforo,
    };
  });

  return NextResponse.json({
    ok: true,
    month: {
      totalDays,
      currentDay,
      remainingDays,
    },
    rows,
  });
}
