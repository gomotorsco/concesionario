import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "lead-documents";
const MAX_FILES_PER_LEAD = 50;

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const vendedorId = req.cookies.get("vendedor_id")?.value;
  const leadId = req.nextUrl.searchParams.get("lead_id");

  if (!vendedorId) return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  if (!leadId) return NextResponse.json({ message: "lead_id requerido." }, { status: 400 });

  const { data: lead, error: leadError } = await supabaseAdmin
    .from("landing_leads")
    .select("id, vendedor_id")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) return NextResponse.json({ message: "Lead no encontrado." }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("lead_documents")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, documents: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const formData = await req.formData();
  const leadId = String(formData.get("lead_id") || "");
  const category = String(formData.get("category") || "otro");
  const file = formData.get("file") as File | null;

  if (!leadId) return NextResponse.json({ message: "lead_id requerido." }, { status: 400 });
  if (!file) return NextResponse.json({ message: "Archivo requerido." }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ message: "Solo se permiten imágenes JPG/PNG/WEBP o PDF." }, { status: 400 });
  }

  const { count } = await supabaseAdmin
    .from("lead_documents")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", leadId);

  if ((count ?? 0) >= MAX_FILES_PER_LEAD) {
    return NextResponse.json({ message: "Este lead ya tiene el máximo de 50 documentos." }, { status: 400 });
  }

  const { data: lead, error: leadError } = await supabaseAdmin
    .from("landing_leads")
    .select("id, vendedor_id")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) return NextResponse.json({ message: "Lead no encontrado." }, { status: 404 });

  const ext = file.name.split(".").pop() || "file";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `leads/${leadId}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return NextResponse.json({ message: uploadError.message }, { status: 500 });

  const { data: publicData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);

  const { data: doc, error: insertError } = await supabaseAdmin
    .from("lead_documents")
    .insert({
      lead_id: Number(leadId),
      vendedor_id: lead.vendedor_id,
      uploaded_by: vendedorId,
      category,
      file_name: file.name || `documento.${ext}`,
      file_url: publicData.publicUrl,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      status: "enviado",
    })
    .select("*")
    .single();

  if (insertError) return NextResponse.json({ message: insertError.message }, { status: 500 });

  await supabaseAdmin
    .from("landing_leads")
    .update({
      estado: "documentos_enviados",
      funnel_stage: "documentos_enviados",
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  await supabaseAdmin.from("lead_events").insert({
    lead_id: Number(leadId),
    vendedor_id: vendedorId,
    type: "documento_subido",
    message: `Documento subido: ${file.name}`,
    meta: { category, file_type: file.type, file_url: publicData.publicUrl },
  });

  return NextResponse.json({ ok: true, document: doc });
}
