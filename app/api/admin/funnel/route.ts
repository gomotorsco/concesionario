import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function pct(num: number, den: number) {
  if (!den) return 0;
  return Math.round((num / den) * 1000) / 10;
}

function scoreLead(l: any) {
  let score = 40;

  if (l.telefono) score += 20;
  if (l.email) score += 10;
  if (l.vehicle_name) score += 15;
  if ((l.seguimiento ?? "").trim()) score += 10;
  if (l.estado === "vendido") score = 100;
  if (l.estado === "perdido") score = Math.min(score, 25);

  return Math.max(0, Math.min(score, 100));
}

function temperatura(score: number) {
  if (score >= 75) return "caliente";
  if (score >= 45) return "tibio";
  return "frio";
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("landing_leads")
      .select("*")
      .neq("estado", "eliminado")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    const leads = (data ?? []).map((l: any) => {
      const score = scoreLead(l);
      return {
        ...l,
        funnel_stage: l.funnel_stage ?? l.estado ?? "nuevo",
        lead_score: l.lead_score ?? score,
        temperatura: l.temperatura ?? temperatura(score),
        computed_score: score,
        computed_temperatura: temperatura(score),
      };
    });

    const stages = ["nuevo", "contacto", "en_seguimiento", "negociacion", "vendido", "perdido"];

    const funnel = stages.map((stage) => {
      const count = leads.filter((l: any) => (l.funnel_stage ?? l.estado) === stage).length;
      return { stage, count };
    });

    const total = leads.length;
    const vendidos = leads.filter((l: any) => l.estado === "vendido").length;
    const perdidos = leads.filter((l: any) => l.estado === "perdido").length;
    const calientes = leads.filter((l: any) => l.computed_temperatura === "caliente").length;
    const sinTocar = leads.filter((l: any) => !l.last_activity_at && l.estado === "nuevo").length;

    return NextResponse.json({
      ok: true,
      summary: {
        total,
        vendidos,
        perdidos,
        calientes,
        sin_tocar: sinTocar,
        conversion: pct(vendidos, total),
      },
      funnel,
      hotLeads: leads
        .filter((l: any) => l.computed_temperatura === "caliente")
        .slice(0, 20),
    });
  } catch (err) {
    console.error("GET /api/admin/funnel error", err);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
