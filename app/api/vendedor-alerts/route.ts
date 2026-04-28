import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const vendedorId = req.cookies.get("seller_session")?.value;

  if (!vendedorId) {
    return NextResponse.json({ ok: false, alerts: [] }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("seller_alerts")
    .select("*")
    .eq("vendedor_id", vendedorId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ ok: false, alerts: [] }, { status: 500 });
  }

  return NextResponse.json({ ok: true, alerts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const vendedorId = req.cookies.get("seller_session")?.value;

  if (!vendedorId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await req.json();
  const id = body.id;

  if (!id) {
    return NextResponse.json({ ok: false, message: "id requerido" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("seller_alerts")
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("vendedor_id", vendedorId);

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
