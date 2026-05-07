import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function countTable(
  supabaseAdmin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  table: string
) {
  const { count, error } = await supabaseAdmin
    .from(table)
    .select("*", { count: "exact", head: true });

  return {
    table,
    count: error ? null : count,
    error: error?.message ?? null,
  };
}

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const results = await Promise.all([
    countTable(supabaseAdmin, "vehicles"),
    countTable(supabaseAdmin, "landing_leads"),
    countTable(supabaseAdmin, "vendedores"),
    countTable(supabaseAdmin, "config"),
  ]);

  return NextResponse.json({
    ok: true,
    results,
  });
}
