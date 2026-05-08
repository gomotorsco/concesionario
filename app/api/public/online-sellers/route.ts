import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function cleanPhone(value: string | null | undefined) {
  return String(value || "").replace(/[^\d]/g, "");
}

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .select("id,nombre,whatsapp,foto_url,zona,last_activity")
    .eq("activo", true)
    .not("whatsapp", "is", null)
    .gte("last_activity", since)
    .order("last_activity", { ascending: false });

  if (error) {
    return NextResponse.json({ sellers: [], message: error.message }, { status: 500 });
  }

  const sellers = (data ?? [])
    .map((seller: any) => ({
      ...seller,
      whatsapp: cleanPhone(seller.whatsapp),
    }))
    .filter((seller: any) => seller.whatsapp.length >= 8);

  return NextResponse.json({ sellers });
}
