import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const KEYS = ["anthropic_api_key", "anthropic_model", "commercial_ai_prompt"];

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("config")
    .select("*")
    .in("key", KEYS);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value || "";

  return NextResponse.json({
    settings: {
      anthropic_api_key: map.anthropic_api_key ? "********" : "",
      anthropic_model: map.anthropic_model || "claude-3-5-haiku-20241022",
      commercial_ai_prompt: map.commercial_ai_prompt || "",
      has_key: Boolean(map.anthropic_api_key),
    },
  });
}

export async function PATCH(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const body = await req.json();

  const rows = [
    {
      key: "anthropic_model",
      value: String(body.anthropic_model || "claude-3-5-haiku-20241022"),
      description: "Modelo Claude para IA comercial",
      updated_at: new Date().toISOString(),
    },
    {
      key: "commercial_ai_prompt",
      value: String(body.commercial_ai_prompt || ""),
      description: "Prompt base IA comercial",
      updated_at: new Date().toISOString(),
    },
  ];

  if (body.anthropic_api_key && body.anthropic_api_key !== "********") {
    rows.push({
      key: "anthropic_api_key",
      value: String(body.anthropic_api_key).trim(),
      description: "Claude API key para IA comercial",
      updated_at: new Date().toISOString(),
    });
  }

  const { error } = await supabaseAdmin
    .from("config")
    .upsert(rows, { onConflict: "key" });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
