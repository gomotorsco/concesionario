import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const vendedorId = req.cookies.get("seller_session")?.value;

  if (!vendedorId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { data } = await supabaseAdmin
    .from("system_alerts")
    .select("*")
    .eq("vendedor_id", vendedorId)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ ok: true, alerts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  await supabaseAdmin
    .from("system_alerts")
    .update({ read: true })
    .eq("id", body.id);

  return NextResponse.json({ ok: true });
}
