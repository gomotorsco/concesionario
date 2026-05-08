import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("sales_quotes")
    .select("id, text, author, type")
    .eq("active", true);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const quotes = data ?? [];

  if (!quotes.length) {
    return NextResponse.json({
      quote: {
        text: "Cada lead atendido con intención puede convertirse en una venta.",
        author: "GoMotorsCo Sales System",
        type: "motivacion",
      },
    });
  }

  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return NextResponse.json({ quote });
}
