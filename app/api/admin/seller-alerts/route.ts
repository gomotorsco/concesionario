import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("seller_alerts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ alerts: [], message: error.message }, { status: 500 });
  }

  return NextResponse.json({ alerts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const vendedor_id = String(body.vendedor_id || body.vendedorId || "").trim();
  const titulo = String(body.titulo || body.title || "Alerta comercial").trim();
  const mensaje = String(body.mensaje || body.message || "").trim();
  const tipo = String(body.tipo || body.priority || "info").trim();

  if (!vendedor_id || !mensaje) {
    return NextResponse.json(
      { message: "Vendedor y mensaje son obligatorios." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("seller_alerts")
    .insert({
      vendedor_id,
      titulo,
      mensaje,
      tipo,
      estado: "pendiente",
      status: "pendiente",
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, alert: data });
}
