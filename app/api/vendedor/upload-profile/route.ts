import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Archivo requerido." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const path = `profiles/${Date.now()}-${safeName(file.name)}`;

  const { error } = await getSupabaseAdmin()!.storage
    .from("seller-profiles")
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const { data } = getSupabaseAdmin()!.storage.from("seller-profiles").getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl });
}
