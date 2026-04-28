import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data: settings } = await supabaseAdmin
    .from("ai_assistant_settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .single();

  const { data: faqs } = await supabaseAdmin
    .from("ai_assistant_faqs")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({
    settings: settings ?? null,
    faqs: faqs ?? [],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "update_settings") {
    const update = {
      assistant_name: body.assistant_name || "Asistente Comercial",
      tone: body.tone || "profesional",
      main_prompt: body.main_prompt || "",
      fallback_message: body.fallback_message || "",
      whatsapp_number: body.whatsapp_number || null,
      enabled: body.enabled !== false,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabaseAdmin
      .from("ai_assistant_settings")
      .select("id")
      .order("id", { ascending: true })
      .limit(1)
      .single();

    if (existing?.id) {
      const { data, error } = await supabaseAdmin
        .from("ai_assistant_settings")
        .update(update)
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, settings: data });
    }

    const { data, error } = await supabaseAdmin
      .from("ai_assistant_settings")
      .insert([update])
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, settings: data });
  }

  if (body.type === "create_faq") {
    const question = String(body.question || "").trim();
    const answer = String(body.answer || "").trim();

    if (!question || !answer) {
      return NextResponse.json(
        { ok: false, message: "Pregunta y respuesta son obligatorias." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("ai_assistant_faqs")
      .insert([
        {
          question,
          answer,
          category: body.category || "general",
          active: body.active !== false,
        },
      ])
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, faq: data });
  }

  if (body.type === "update_faq") {
    if (!body.id) {
      return NextResponse.json({ ok: false, message: "id requerido." }, { status: 400 });
    }

    const update: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.question !== undefined) update.question = body.question;
    if (body.answer !== undefined) update.answer = body.answer;
    if (body.category !== undefined) update.category = body.category;
    if (body.active !== undefined) update.active = Boolean(body.active);

    const { data, error } = await supabaseAdmin
      .from("ai_assistant_faqs")
      .update(update)
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, faq: data });
  }

  return NextResponse.json({ ok: false, message: "Tipo no soportado." }, { status: 400 });
}
