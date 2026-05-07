import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function createAlert(
  supabaseAdmin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  vendedor_id: string,
  title: string,
  message: string,
  priority = "warning"
) {
  const { data: existing } = await supabaseAdmin
    .from("seller_alerts")
    .select("id")
    .eq("vendedor_id", vendedor_id)
    .eq("titulo", title)
    .eq("estado", "pendiente")
    .maybeSingle();

  if (existing) return;

  await supabaseAdmin.from("seller_alerts").insert([
    {
      vendedor_id,
      titulo: title,
      mensaje: message,
      tipo: priority,
      estado: "pendiente",
      status: "pendiente",
    },
  ]);
}

export async function POST() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin()!!;

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const { data: vendedores, error } = await supabaseAdmin
    .from("vendedores")
    .select("*");

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  let created = 0;

  for (const vendedor of vendedores ?? []) {
    if (!vendedor?.id) continue;

    await createAlert(
      supabaseAdmin,
      String(vendedor.id),
      "Revisión comercial pendiente",
      "Revisá tus leads asignados y actualizá el estado comercial.",
      "warning"
    );

    created++;
  }

  return NextResponse.json({ ok: true, created });
}

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Automation engine activo.",
  });
}
