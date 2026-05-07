import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { whatsappNumber: "", message: "Supabase admin no está configurado." },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("config")
    .select("*")
    .eq("key", "whatsapp_number")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { whatsappNumber: "", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    whatsappNumber: data?.value ?? "",
  });
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Supabase admin no está configurado." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const whatsappNumber = String(body.whatsappNumber || "").trim();

  if (!whatsappNumber) {
    return NextResponse.json(
      { message: "El número de WhatsApp es obligatorio." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("config").upsert(
    {
      key: "whatsapp_number",
      value: whatsappNumber,
      description: "Número principal de WhatsApp del sitio.",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, whatsappNumber });
}