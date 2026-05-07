import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `config/${Date.now()}-${file.name}`;

    const { data, error } = await getSupabaseAdmin()!!.storage
      .from("public-assets")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Error subiendo imagen:", error);
      return NextResponse.json(
        { error: "Error al subir la imagen" },
        { status: 500 }
      );
    }

    const publicUrl =
      getSupabaseAdmin()!!.storage.from("public-assets").getPublicUrl(data.path)
        .data.publicUrl;

    return NextResponse.json({ url: publicUrl });
  } catch (e: any) {
    console.error("Excepción en /api/upload-image:", e);
    return NextResponse.json(
      { error: "Error inesperado al subir la imagen" },
      { status: 500 }
    );
  }
}
