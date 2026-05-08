import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("seller_training")
    .select("*")
    .eq("active", true)
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ items: [], message: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [] });
}
