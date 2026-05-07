import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Usamos la misma tabla/columnas que en lib/config.ts
const TABLE = "config";
const KEY_COLUMN = "key";
const VALUE_COLUMN = "value";
const KEY = "whatsapp_number";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select(`${VALUE_COLUMN}`)
    .eq(KEY_COLUMN, KEY)
    .maybeSingle();

  if (error) {
    console.error("GET /api/config/whatsapp error", error);
    return NextResponse.json({ number: null }, { status: 500 });
  }

  // @ts-ignore
  const raw = data ? (data[VALUE_COLUMN] as string | null) : null;
  return NextResponse.json({ number: raw ?? null });
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const rawNumber: string = (body.number ?? "").toString().trim();

  const { error } = await supabaseAdmin
    .from(TABLE)
    .upsert(
      {
        [KEY_COLUMN]: KEY,
        [VALUE_COLUMN]: rawNumber,
      },
      { onConflict: KEY_COLUMN }
    );

  if (error) {
    console.error("POST /api/config/whatsapp error", error);
    return NextResponse.json(
      { message: "No se pudo guardar el número de WhatsApp." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, number: rawNumber });
}
