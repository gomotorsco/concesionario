import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    error: error?.message ?? null,
    leads: data ?? [],
  });
}
