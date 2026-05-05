import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const vendedorId = req.nextUrl.searchParams.get("vendedor_id") || req.nextUrl.searchParams.get("id") || "1";

  const { data, error } = await supabaseAdmin
    .from("seller_alerts")
    .select("*")
    .eq("vendedor_id", vendedorId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ alerts: [], alertas: [], message: error.message }, { status: 500 });

  return NextResponse.json({ alerts: data ?? [], alertas: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  if (!body.id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("seller_alerts")
    .update({
      estado: "leida",
      status: "leida",
      read_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
