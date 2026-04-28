import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("vehicle_sections")
    .select(`
      id,
      title,
      slug,
      visible,
      vehicles:vehicles(
        id,
        title,
        slug,
        cuota_desde,
        moneda,
        imagen_url
      )
    `)
    .eq("visible", true)
    .eq("vehicles.visible", true);

  if (error) {
    console.error("GET /api/vehicles error", error);
    return NextResponse.json({ sections: [] }, { status: 500 });
  }

  return NextResponse.json({ sections: data ?? [] });
}
