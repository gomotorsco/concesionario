import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const body = await req.json();

  const payload = {
    whatsapp: String(body.whatsapp || "").trim(),
    zona: String(body.zona || "").trim(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .update(payload)
    .eq("id", vendedorId)
    .select("id, nombre, email, whatsapp, foto_url, zona, activo")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, vendedor: data });
}
