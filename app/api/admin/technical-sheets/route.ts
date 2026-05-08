import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("technical_sheets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ sheets: [], message: error.message }, { status: 500 });

  return NextResponse.json({ sheets: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const formData = await req.formData();

  const file = formData.get("file") as File | null;
  const title = String(formData.get("title") || "").trim();
  const brand = String(formData.get("brand") || "").trim();
  const model = String(formData.get("model") || "").trim();
  const vehicle_type = String(formData.get("vehicle_type") || "auto").trim();
  const yearRaw = String(formData.get("year") || "").trim();
  const tags = String(formData.get("tags") || "").trim();

  if (!file || !title) {
    return NextResponse.json({ message: "Título y PDF son obligatorios." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "pdf";
  const safe = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const path = `technical-sheets/${Date.now()}-${safe}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from("vehicle-images")
    .upload(path, buffer, {
      contentType: file.type || "application/pdf",
      upsert: true,
    });

  if (uploadError) return NextResponse.json({ message: uploadError.message }, { status: 500 });

  const { data: publicUrl } = supabaseAdmin.storage.from("vehicle-images").getPublicUrl(path);

  const { data, error } = await supabaseAdmin
    .from("technical_sheets")
    .insert({
      title,
      brand,
      model,
      vehicle_type,
      year: yearRaw ? Number(yearRaw) : null,
      tags,
      file_url: publicUrl.publicUrl,
      visible: true,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, sheet: data });
}

export async function PATCH(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const body = await req.json();

  if (!body.id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("technical_sheets")
    .update({
      visible: body.visible,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, sheet: data });
}
