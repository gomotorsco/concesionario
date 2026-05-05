import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Archivo requerido." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const path = `profiles/${Date.now()}-${safeName(file.name)}`;

  const { error } = await supabaseAdmin.storage
    .from("seller-profiles")
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from("seller-profiles").getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl });
}
