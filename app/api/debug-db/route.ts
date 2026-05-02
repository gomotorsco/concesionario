import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function countTable(table: string) {
  const { count, error } = await supabaseAdmin
    .from(table)
    .select("*", { count: "exact", head: true });

  const { data } = await supabaseAdmin
    .from(table)
    .select("*")
    .limit(5);

  return {
    table,
    count,
    error: error?.message ?? null,
    sample: data ?? [],
  };
}

export async function GET() {
  const vehicles = await countTable("vehicles");
  const scraped = await countTable("scraped_vehicles");
  const sections = await countTable("vehicle_sections");

  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    vehicles,
    scraped_vehicles: scraped,
    vehicle_sections: sections,
  });
}
