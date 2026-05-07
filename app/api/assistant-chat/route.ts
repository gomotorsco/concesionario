import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scoreMatch(query: string, question: string, answer: string) {
  const q = normalize(query);
  const text = normalize(`${question} ${answer}`);
  const words = q.split(/\s+/).filter((w) => w.length > 3);

  let score = 0;

  for (const w of words) {
    if (text.includes(w)) score += 1;
  }

  return score;
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          ok: false,
          reply: "Faltan variables de Supabase en el servidor.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json(
        {
          ok: false,
          reply: "Escribí tu consulta para poder ayudarte.",
        },
        { status: 400 }
      );
    }

    const { data: settings } = await supabaseAdmin
      .from("ai_assistant_settings")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .single();

    if (settings && settings.enabled === false) {
      return NextResponse.json({
        ok: true,
        reply:
          settings.fallback_message ||
          "Te paso con un asesor comercial.",
      });
    }

    const { data: faqs } = await supabaseAdmin
      .from("ai_assistant_faqs")
      .select("*")
      .eq("active", true);

    const items = faqs ?? [];

    let best: any = null;
    let bestScore = 0;

    for (const faq of items) {
      const s = scoreMatch(message, faq.question, faq.answer);

      if (s > bestScore) {
        best = faq;
        bestScore = s;
      }
    }

    if (best && bestScore > 0) {
      return NextResponse.json({
        ok: true,
        reply: best.answer,
        matched: best.question,
      });
    }

    const fallback =
      settings?.fallback_message ||
      "Para confirmarte ese dato exacto, te paso con un asesor comercial.";

    return NextResponse.json({
      ok: true,
      reply: fallback,
    });
  } catch (err) {
    console.error("POST /api/assistant-chat error", err);

    return NextResponse.json(
      {
        ok: false,
        reply:
          "Ocurrió un error. Te recomendamos hablar con un asesor.",
      },
      { status: 500 }
    );
  }
}