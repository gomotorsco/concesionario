import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) return NextResponse.json({ alerts: [] }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("seller_alerts")
    .select("*")
    .eq("vendedor_id", vendedorId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ alerts: [], message: error.message }, { status: 500 });

  return NextResponse.json({ alerts: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const vendedorId = req.cookies.get("vendedor_id")?.value;
  const body = await req.json();

  if (!vendedorId) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const { error } = await supabaseAdmin
    .from("seller_alerts")
    .update({
      estado: "leida",
      status: "leida",
      read_at: new Date().toISOString(),
    })
    .eq("id", body.id)
    .eq("vendedor_id", vendedorId);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
