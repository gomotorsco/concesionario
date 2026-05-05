import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("seller_alerts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ alerts: [], message: error.message }, { status: 500 });

  return NextResponse.json({ alerts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const vendedorId = body.vendedor_id || body.vendedorId || body.seller_id;
  const mensaje = String(body.mensaje || body.message || "").trim();
  const titulo = String(body.titulo || body.title || "Alerta comercial").trim();

  if (!vendedorId || !mensaje) {
    return NextResponse.json({ message: "Vendedor y mensaje son obligatorios." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("seller_alerts").insert({
    vendedor_id: Number(vendedorId),
    titulo,
    mensaje,
    tipo: body.tipo || "info",
    estado: "pendiente",
    status: "pendiente",
  });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
