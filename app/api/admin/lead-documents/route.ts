import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const leadId = req.nextUrl.searchParams.get("lead_id");

  if (!leadId) {
    return NextResponse.json({ message: "lead_id requerido." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("lead_documents")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, documents: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const body = await req.json();

  const id = body.id;
  const status = body.status;
  const notes = body.notes ?? null;

  if (!id) {
    return NextResponse.json({ message: "id requerido." }, { status: 400 });
  }

  if (!["aprobado", "rechazado", "enviado"].includes(status)) {
    return NextResponse.json({ message: "Estado inválido." }, { status: 400 });
  }

  const { data: doc, error: docError } = await supabaseAdmin
    .from("lead_documents")
    .update({
      status,
      notes,
      approved_at: status === "aprobado" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (docError) {
    return NextResponse.json({ message: docError.message }, { status: 500 });
  }

  if (doc?.lead_id) {
    const { data: lead } = await supabaseAdmin
      .from("landing_leads")
      .select("id, nombre, vendedor_id")
      .eq("id", doc.lead_id)
      .single();

    if (lead?.vendedor_id) {
      await supabaseAdmin.from("seller_alerts").insert({
        vendedor_id: lead.vendedor_id,
        lead_id: lead.id,
        title: status === "aprobado" ? "Documento aprobado" : "Documento rechazado",
        message:
          status === "aprobado"
            ? `Documento aprobado para ${lead.nombre || "lead"}.`
            : `Documento rechazado para ${lead.nombre || "lead"}. Revisar y volver a cargar.`,
        type: "documento",
        priority: status === "aprobado" ? "normal" : "alta",
        read: false,
        titulo: status === "aprobado" ? "Documento aprobado" : "Documento rechazado",
        mensaje:
          status === "aprobado"
            ? `Documento aprobado para ${lead.nombre || "lead"}.`
            : `Documento rechazado para ${lead.nombre || "lead"}. Revisar y volver a cargar.`,
        tipo: "documento",
        estado: "pendiente",
        status: "pendiente",
        scheduled_at: new Date().toISOString(),
      });

      await supabaseAdmin.from("lead_events").insert({
        lead_id: lead.id,
        vendedor_id: lead.vendedor_id,
        type: status === "aprobado" ? "documento_aprobado" : "documento_rechazado",
        message:
          status === "aprobado"
            ? `Documento aprobado: ${doc.file_name}`
            : `Documento rechazado: ${doc.file_name}`,
        meta: {
          document_id: doc.id,
          file_name: doc.file_name,
          file_url: doc.file_url,
          status,
          notes,
        },
      });

      if (status === "aprobado") {
        await supabaseAdmin
          .from("landing_leads")
          .update({
            estado: "documentos_aprobados",
            funnel_stage: "documentos_aprobados",
            updated_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
          })
          .eq("id", lead.id);
      }
    }
  }

  return NextResponse.json({ ok: true, document: doc });
}
