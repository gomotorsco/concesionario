import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("seller_alerts")
    .select("*, vendedores(nombre, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ ok: false, alerts: [] }, { status: 500 });
  }

  return NextResponse.json({ ok: true, alerts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const vendedorId = body.vendedor_id;
  const title = String(body.title || "").trim();
  const message = String(body.message || "").trim();
  const priority = String(body.priority || "info");

  if (!vendedorId || !title || !message) {
    return NextResponse.json(
      { ok: false, message: "vendedor_id, title y message son obligatorios." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("seller_alerts")
    .insert([
      {
        vendedor_id: vendedorId,
        title,
        message,
        priority,
      },
    ])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, alert: data });
}
