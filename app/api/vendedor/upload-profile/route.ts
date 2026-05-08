import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ message: "Archivo requerido." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "png";
  const path = `seller-profiles/${vendedorId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from("vehicle-images")
    .upload(path, buffer, {
      contentType: file.type || "image/png",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ message: uploadError.message }, { status: 500 });
  }

  const { data: publicUrl } = supabaseAdmin.storage
    .from("vehicle-images")
    .getPublicUrl(path);

  const foto_url = publicUrl.publicUrl;

  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .update({
      foto_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vendedorId)
    .select("id, nombre, email, whatsapp, foto_url, zona, activo")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: foto_url, vendedor: data });
}
