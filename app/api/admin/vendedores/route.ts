import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(req: NextRequest) {
  const id = Number(new URL(req.url).searchParams.get("id"));

  if (!id) {
    return NextResponse.json({ message: "ID requerido." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("vendedores")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
