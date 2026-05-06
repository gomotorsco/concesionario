import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeType(value: any) {
  const raw = String(value || "auto").toLowerCase();
  if (raw.includes("moto")) return "moto";
  if (raw.includes("ciclo") || raw.includes("cuatri") || raw.includes("scooter")) return "ciclomotor";
  return "auto";
}

function gallery(value: any) {
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, 15);
  return [];
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin") === "1";
  const type = normalizeType(url.searchParams.get("type") || "auto");

  let q = supabaseAdmin
    .from("vehicles")
    .select("*")
    .eq("tipo", type)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!admin) q = q.eq("visible", true);

  const { data, error } = await q;
  if (error) return NextResponse.json({ sections: [], total: 0, message: error.message }, { status: 500 });

  const map = new Map<string, any[]>();

  for (const v of data || []) {
    const marca = v.marca || "Sin marca";
    if (!map.has(marca)) map.set(marca, []);

    const imgs = gallery(v.galeria);
    const hero = v.imagen_hero || v.imagen_url || imgs[0] || "";

    map.get(marca)!.push({
      ...v,
      galeria: imgs,
      imagen_hero: hero,
      imagen_url: hero,
    });
  }

  const sections = Array.from(map.entries()).map(([marca, vehicles], index) => ({
    id: marca,
    title: marca,
    name: marca,
    slug: slugify(marca),
    type,
    visible: true,
    orden: index + 1,
    vehicles,
  }));

  return NextResponse.json({ sections, total: data?.length ?? 0 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "section") {
    return NextResponse.json({ ok: true });
  }

  const title = String(body.title || "").trim();
  const marca = String(body.marca || "").trim();
  const tipo = normalizeType(body.inventoryType || body.tipo);

  if (!title) return NextResponse.json({ message: "Nombre requerido." }, { status: 400 });
  if (!marca) return NextResponse.json({ message: "Marca requerida." }, { status: 400 });

  const imgs = gallery(body.gallery || body.galeria);
  const hero = body.imagenHero || imgs[0] || null;

  const { data, error } = await supabaseAdmin
    .from("vehicles")
    .insert({
      title,
      slug: slugify(marca + " " + title),
      marca,
      modelo: body.modelo || title,
      version: body.version || null,
      descripcion: body.descripcion || null,
      tipo,
      precio: body.precio ? Number(body.precio) : null,
      cuota_desde: body.cuotaDesde ? Number(body.cuotaDesde) : null,
      imagen_hero: hero,
      imagen_url: hero,
      galeria: imgs,
      visible: true,
      deleted_at: null,
      estado: "disponible",
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ vehicle: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = body.id;

  if (!id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  if (body.action === "toggle_visibility") {
    const { data: current } = await supabaseAdmin.from("vehicles").select("visible").eq("id", id).maybeSingle();
    if (!current) return NextResponse.json({ message: "Vehículo no encontrado." }, { status: 404 });

    const { error } = await supabaseAdmin
      .from("vehicles")
      .update({ visible: !current.visible, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const title = String(body.title || "").trim();
  const marca = String(body.marca || "").trim();
  const imgs = gallery(body.gallery || body.galeria);
  const hero = body.imagenHero || imgs[0] || null;

  const { data, error } = await supabaseAdmin
    .from("vehicles")
    .update({
      title,
      slug: slugify(marca + " " + title),
      marca,
      modelo: body.modelo || title,
      version: body.version || null,
      descripcion: body.descripcion || null,
      precio: body.precio ? Number(body.precio) : null,
      cuota_desde: body.cuotaDesde ? Number(body.cuotaDesde) : null,
      imagen_hero: hero,
      imagen_url: hero,
      galeria: imgs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ message: "Vehículo no encontrado." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("vehicles")
    .update({ deleted_at: new Date().toISOString(), visible: false })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ message: "Vehículo no encontrado." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
