import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const vendedorId = req.cookies.get("seller_session")?.value;

    if (!vendedorId) {
      return NextResponse.json([], { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("landing_leads")
      .select("*")
      .eq("vendedor_id", vendedorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}
