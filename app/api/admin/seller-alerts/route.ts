import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("seller_alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ ok: false, alerts: [], message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, alerts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.vendedor_id || !body.title || !body.message) {
    return NextResponse.json({ ok: false, message: "vendedor_id, title y message requeridos." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("seller_alerts")
    .insert([{
      vendedor_id: body.vendedor_id,
      title: String(body.title),
      message: String(body.message),
      priority: body.priority || "info",
      read: false,
    }])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, alert: data });
}
