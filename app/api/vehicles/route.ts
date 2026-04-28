import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  const admin = new URL(req.url).searchParams.get("admin") === "1";

  const { data, error } = await supabaseAdmin
    .from("vehicle_sections")
    .select(`
      id,
      title,
      slug,
      type,
      visible,
      vehicles:vehicles(
        id,
        section_id,
        title,
        slug,
        tipo,
        precio,
        cuota_desde,
        moneda,
        imagen_url,
        visible,
        estado
      )
    `)
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ sections: [], message: error.message }, { status: 500 });
  }

  const sections = (data ?? [])
    .filter((s: any) => admin || s.visible !== false)
    .map((s: any) => ({
      ...s,
      vehicles: admin ? (s.vehicles ?? []) : (s.vehicles ?? []).filter((v: any) => v.visible !== false),
    }));

  return NextResponse.json({ sections });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "section") {
    const title = String(body.title || "").trim();
    if (!title) return NextResponse.json({ message: "Título requerido." }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("vehicle_sections")
      .insert([{ title, slug: slugify(title), type: body.sectionType || "autos", visible: true }])
      .select("*")
      .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json({ section: data });
  }

  if (body.type === "vehicle") {
    const title = String(body.title || "").trim();
    if (!body.sectionId || !title) {
      return NextResponse.json({ message: "Sección y título son obligatorios." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("vehicles")
      .insert([{
        section_id: Number(body.sectionId),
        title,
        slug: slugify(title),
        tipo: body.tipo || "auto",
        precio: body.precio ? Number(body.precio) : null,
        cuota_desde: body.cuotaDesde ? Number(body.cuotaDesde) : null,
        moneda: body.moneda || "COP",
        imagen_url: body.imagen1 || body.imagenUrl || null,
        estado: body.estado || "disponible",
        visible: true,
      }])
      .select("*")
      .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json({ vehicle: data });
  }

  return NextResponse.json({ message: "Tipo no soportado." }, { status: 400 });
}
