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

  const id = req.nextUrl.searchParams.get("id");

  if (!id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ vendedor: data });
}

export async function PATCH(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const body = await req.json();

  if (!body.id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("vendedores")
    .update({
      nombre: body.nombre,
      whatsapp: body.whatsapp,
      zona: body.zona,
      foto_url: body.foto_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
