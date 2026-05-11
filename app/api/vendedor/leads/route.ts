import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const vendedorId = req.nextUrl.searchParams.get("vendedor_id");

  if (!vendedorId) return NextResponse.json({ leads: [] });

  const { data, error } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .eq("vendedor_id", vendedorId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ message: error.message, leads: [] }, { status: 500 });

  return NextResponse.json({ leads: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const body = await req.json();

  if (!body.id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  const payload: any = {
    estado: body.estado,
    notas: body.notas,
    updated_at: new Date().toISOString(),
  };

  if (body.seguimiento_fecha) {
    payload.seguimiento_fecha = body.seguimiento_fecha;
  }

  const { data: lead, error } = await supabaseAdmin
    .from("landing_leads")
    .update(payload)
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  if (body.estado === "seguimiento" && body.seguimiento_fecha && lead?.vendedor_id) {
    await getSupabaseAdmin()!.from("seller_alerts").insert({
      vendedor_id: lead.vendedor_id,
      title: "Seguimiento programado",
      message: `Dar seguimiento a ${lead.nombre || "lead"} por ${lead.vehiculo || lead.vehiculo_interes || "vehículo"}`,
      priority: "seguimiento",
    });
  }

  return NextResponse.json({ ok: true, lead });
}

export async function POST(req: NextRequest) {
  return PATCH(req);
}
