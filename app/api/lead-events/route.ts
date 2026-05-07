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

  const url = new URL(req.url);
  const leadId = url.searchParams.get("lead_id");

  if (!leadId) {
    return NextResponse.json({ ok: false, events: [] }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("lead_events")
    .select("*")
    .eq("lead_id", Number(leadId))
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, events: [] }, { status: 500 });
  }

  return NextResponse.json({ ok: true, events: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const body = await req.json();

  if (!body.lead_id || !body.type || !body.message) {
    return NextResponse.json(
      { ok: false, message: "lead_id, type y message son obligatorios" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("lead_events")
    .insert([
      {
        lead_id: Number(body.lead_id),
        vendedor_id: body.vendedor_id || null,
        type: String(body.type),
        message: String(body.message),
        meta: body.meta ?? {},
      },
    ])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  await supabaseAdmin
    .from("landing_leads")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", Number(body.lead_id));

  return NextResponse.json({ ok: true, event: data });
}
