import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("seller_training")
    .select("*")
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ items: [], message: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const body = await req.json();

  const type = String(body.type || "consejo").trim();
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();
  const youtube_url = String(body.youtube_url || "").trim();
  const category = String(body.category || "ventas").trim();
  const orden = Number(body.orden || 1);
  const active = body.active !== false;

  if (!title) {
    return NextResponse.json({ message: "El título es obligatorio." }, { status: 400 });
  }

  if (type === "video" && !youtube_url) {
    return NextResponse.json({ message: "El link de YouTube es obligatorio para videos." }, { status: 400 });
  }

  const payload = {
    type,
    title,
    content,
    youtube_url: youtube_url || null,
    category,
    orden,
    active,
    updated_at: new Date().toISOString(),
  };

  if (body.id) {
    const { data, error } = await supabaseAdmin
      .from("seller_training")
      .update(payload)
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, item: data });
  }

  const { data, error } = await supabaseAdmin
    .from("seller_training")
    .insert(payload)
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const id = req.nextUrl.searchParams.get("id");

  if (!id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("seller_training")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
