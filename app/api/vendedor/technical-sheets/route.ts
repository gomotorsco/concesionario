import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("technical_sheets")
    .select("*")
    .eq("visible", true)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ sheets: [], message: error.message }, { status: 500 });

  return NextResponse.json({ sheets: data ?? [] });
}
