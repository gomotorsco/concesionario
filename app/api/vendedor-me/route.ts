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

  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .select("*")
    .eq("id", vendedorId)
    .maybeSingle();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ message: "Vendedor no encontrado." }, { status: 404 });

  return NextResponse.json({ vendedor: data });
}
