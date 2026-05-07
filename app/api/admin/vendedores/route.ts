import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Supabase admin no está configurado." },
      { status: 500 }
    );
  }

  const id = Number(new URL(req.url).searchParams.get("id"));

  if (!id) {
    return NextResponse.json(
      { message: "ID requerido." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("vendedores")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}