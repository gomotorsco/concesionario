import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("seller_quick_messages")
    .select("*")
    .eq("vendedor_id", vendedorId)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, messages: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const body = await req.json();
  const title = String(body.title || "").trim();
  const message = String(body.message || "").trim();
  const sort_order = Number(body.sort_order || 1);

  if (!title) return NextResponse.json({ message: "Título requerido." }, { status: 400 });
  if (!message) return NextResponse.json({ message: "Mensaje requerido." }, { status: 400 });

  const { count } = await supabaseAdmin
    .from("seller_quick_messages")
    .select("id", { count: "exact", head: true })
    .eq("vendedor_id", vendedorId)
    .eq("active", true);

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ message: "Máximo 5 mensajes activos por vendedor." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("seller_quick_messages")
    .insert({
      vendedor_id: vendedorId,
      title,
      message,
      sort_order,
      active: true,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, message: data });
}

export async function PATCH(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const body = await req.json();

  if (!body.id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  const patch: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.message !== undefined) patch.message = String(body.message).trim();
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order);
  if (body.active !== undefined) patch.active = Boolean(body.active);

  const { data, error } = await supabaseAdmin
    .from("seller_quick_messages")
    .update(patch)
    .eq("id", body.id)
    .eq("vendedor_id", vendedorId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, message: data });
}
