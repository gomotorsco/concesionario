import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
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
    await supabaseAdmin.from("seller_alerts").insert({
      vendedor_id: lead.vendedor_id,
      lead_id: lead.id,
      titulo: "Seguimiento programado",
      mensaje: `Dar seguimiento a ${lead.nombre || "lead"} por ${lead.vehiculo || lead.vehiculo_interes || "vehículo"}`,
      tipo: "seguimiento",
      estado: "pendiente",
      status: "pendiente",
      scheduled_at: body.seguimiento_fecha,
    });
  }

  return NextResponse.json({ ok: true, lead });
}
