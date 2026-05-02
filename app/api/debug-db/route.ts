import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { count, error } = await supabaseAdmin
    .from("vehicles")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    vehiclesCount: count,
    error: error?.message ?? null,
  });
}
