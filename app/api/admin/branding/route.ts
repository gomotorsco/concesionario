import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("site_branding")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ branding: null });
  }

  return NextResponse.json({ branding: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const update = {
    business_name: body.business_name || "Concesionario",
    slogan: body.slogan || null,
    whatsapp: body.whatsapp || null,
    email: body.email || null,
    address: body.address || null,
    city: body.city || null,
    primary_color: body.primary_color || "#2563eb",
    secondary_color: body.secondary_color || "#16a34a",
    logo_url: body.logo_url || null,
    hero_title: body.hero_title || null,
    hero_subtitle: body.hero_subtitle || null,
    seo_title: body.seo_title || null,
    seo_description: body.seo_description || null,
    enabled: body.enabled !== false,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabaseAdmin
    .from("site_branding")
    .select("id")
    .order("id", { ascending: true })
    .limit(1)
    .single();

  if (existing?.id) {
    const { data, error } = await supabaseAdmin
      .from("site_branding")
      .update(update)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, branding: data });
  }

  const { data, error } = await supabaseAdmin
    .from("site_branding")
    .insert([update])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, branding: data });
}
