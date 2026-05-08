import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

const { data: vendedores, error: vendedoresError } = await supabaseAdmin
    .from("vendedores")
    .select("*")
    .eq("activo", true);

  if (vendedoresError) {
    return NextResponse.json(
      { message: vendedoresError.message },
      { status: 500 }
    );
  }

  const { data: leads, error: leadsError } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .is("vendedor_id", null)
    .order("created_at", { ascending: true })
    .limit(20);

  if (leadsError) {
    return NextResponse.json(
      { message: leadsError.message },
      { status: 500 }
    );
  }

  if (!vendedores?.length || !leads?.length) {
    return NextResponse.json({
      ok: true,
      assigned: 0,
      message: "No hay vendedores activos o leads pendientes.",
    });
  }

  let assigned = 0;

  for (const [index, lead] of leads.entries()) {
    const vendedor = vendedores[index % vendedores.length];

    const { error } = await supabaseAdmin
      .from("landing_leads")
      .update({
        vendedor_id: vendedor.id,
        estado: lead.estado || "nuevo",
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    if (!error) {
      assigned++;

      await supabaseAdmin.from("system_alerts").insert([
        {
          titulo: "Lead asignado automáticamente",
          message: `Lead #${lead.id} asignado a ${
            vendedor.nombre || vendedor.email || "vendedor"
          }.`,
          tipo: "assignment",
          estado: "pendiente",
        },
      ]);
    }
  }

  return NextResponse.json({ ok: true, assigned });
}

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Assignment engine activo.",
  });
}