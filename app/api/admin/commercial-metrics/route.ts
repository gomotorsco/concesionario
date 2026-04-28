import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function getMonthInfo() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const totalDays = end.getDate();
  const currentDay = now.getDate();
  const remainingDays = totalDays - currentDay;

  return {
    startISO: start.toISOString(),
    totalDays,
    currentDay,
    remainingDays,
  };
}

function pct(num: number, den: number) {
  if (!den) return 0;
  return Math.round((num / den) * 1000) / 10;
}

function probabilidad(proyeccion: number, meta: number) {
  if (proyeccion >= meta) return "alta";
  if (proyeccion >= meta * 0.7) return "media";
  return "baja";
}

function semaforoPredictivo(proyeccion: number, meta: number) {
  if (proyeccion >= meta) return "verde";
  if (proyeccion >= meta * 0.7) return "amarillo";
  return "rojo";
}

export async function GET() {
  try {
    const { startISO, totalDays, currentDay, remainingDays } = getMonthInfo();

    const { data: vendedores } = await supabaseAdmin
      .from("vendedores")
      .select("*");

    const { data: leads } = await supabaseAdmin
      .from("landing_leads")
      .select("*")
      .gte("created_at", startISO)
      .neq("estado", "eliminado");

    const allLeads = leads ?? [];

    const rows = (vendedores ?? []).map((v: any) => {
      const assigned = allLeads.filter((l: any) => l.vendedor_id === v.id);

      const total = assigned.length;
      const nuevos = assigned.filter((l: any) => (l.estado ?? "nuevo") === "nuevo").length;
      const vendidos = assigned.filter((l: any) => l.estado === "vendido").length;
      const perdidos = assigned.filter((l: any) => l.estado === "perdido").length;

      const meta = Number(v.meta_mensual ?? 10);

      // 🔥 PROYECCIÓN
      const ritmoActual = currentDay > 0 ? vendidos / currentDay : 0;
      const ritmoNecesario = remainingDays > 0 ? (meta - vendidos) / remainingDays : 0;

      const proyeccionFinal = Math.round(ritmoActual * totalDays);

      const prob = probabilidad(proyeccionFinal, meta);
      const semaforo = semaforoPredictivo(proyeccionFinal, meta);

      return {
        id: v.id,
        nombre: v.nombre,
        meta_mensual: meta,
        vendidos,
        total_leads: total,
        nuevos,
        perdidos,

        ritmo_actual: Number(ritmoActual.toFixed(2)),
        ritmo_necesario: Number(ritmoNecesario.toFixed(2)),
        proyeccion_final: proyeccionFinal,

        probabilidad: prob,
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
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false });
  }
}
