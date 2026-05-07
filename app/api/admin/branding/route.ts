import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ branding: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .upsert({
      id: 1,
      business_name: body.business_name,
      slogan: body.slogan,
      whatsapp: body.whatsapp,
      email: body.email,
      city: body.city,
      address: body.address,
      logo_url: body.logo_url,
      primary_color: body.primary_color,
      secondary_color: body.secondary_color,
      hero_title: body.hero_title,
      hero_subtitle: body.hero_subtitle,
      seo_title: body.seo_title,
      seo_description: body.seo_description,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ branding: data });
}
