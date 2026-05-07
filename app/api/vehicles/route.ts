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

  if (
    raw.includes("ciclo") ||
    raw.includes("cuatri") ||
    raw.includes("scooter") ||
    raw.includes("movilidad")
  ) {
    return "ciclomotor";
  }

  if (raw.includes("moto")) return "moto";

  return "auto";
}

function parsePrice(value: any) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;

  const clean = String(value).replace(/[^\d]/g, "");
  if (!clean) return null;

  return Number(clean);
}

function parseGallery(value: any) {
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, 15);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).slice(0, 15);
    } catch {}
  }

  return [];
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin") === "1";
  const typeParam = url.searchParams.get("type");

  let q = supabaseAdmin
    .from("vehicles")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (typeParam) q = q.eq("tipo", normalizeType(typeParam));
  if (!admin) q = q.eq("visible", true);

  const { data, error } = await q;

  if (error) {
    return NextResponse.json({ sections: [], total: 0, message: error.message }, { status: 500 });
  }

  const map = new Map<string, any>();

  for (const v of data || []) {
    const marca = v.marca || "Sin marca";
    const tipo = normalizeType(v.tipo);

    const key = tipo + "::" + marca;

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        title: marca,
        name: marca,
        slug: slugify(marca),
        type: tipo,
        visible: true,
        orden: map.size + 1,
        vehicles: [],
      });
    }

    const galeria = parseGallery(v.galeria);
    const hero = v.imagen_hero || v.imagen_url || galeria[0] || "";

    map.get(key).vehicles.push({
      ...v,
      tipo,
      galeria,
      imagen_hero: hero,
      imagen_url: hero,
      precio: parsePrice(v.precio),
      precio_desde: parsePrice(v.precio || v.precio_desde),
      moneda: v.moneda || "COP",
    });
  }

  return NextResponse.json({
    sections: Array.from(map.values()),
    total: data?.length ?? 0,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "section") {
    return NextResponse.json({ ok: true });
  }

  const title = String(body.title || "").trim();
  const marca = String(body.marca || "").trim();
  const tipo = normalizeType(body.inventoryType || body.tipo);
  const galeria = parseGallery(body.gallery || body.galeria);
  const hero = body.imagenHero || body.imagen_hero || body.imagenUrl || body.imagen_url || galeria[0] || null;
  const precio = parsePrice(body.precio);
  const cuotaDesde = parsePrice(body.cuotaDesde);

  if (!title) return NextResponse.json({ message: "Nombre requerido." }, { status: 400 });
  if (!marca) return NextResponse.json({ message: "Marca requerida." }, { status: 400 });

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
      precio,
      cuota_desde: cuotaDesde,
      imagen_hero: hero,
      imagen_url: hero,
      galeria,
      hero_title: body.heroTitle || title,
      hero_subtitle: body.heroSubtitle || body.descripcion || null,
      block1_title: body.block1Title || null,
      block1_text: body.block1Text || null,
      block1_image: body.block1Image || galeria[1] || hero,
      block2_title: body.block2Title || null,
      block2_text: body.block2Text || null,
      block2_image: body.block2Image || galeria[2] || hero,
      block3_title: body.block3Title || null,
      block3_text: body.block3Text || null,
      block3_image: body.block3Image || galeria[3] || hero,
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
    const { data: current } = await supabaseAdmin
      .from("vehicles")
      .select("visible")
      .eq("id", id)
      .maybeSingle();

    if (!current) return NextResponse.json({ message: "Vehículo no encontrado." }, { status: 404 });

    const { error } = await supabaseAdmin
      .from("vehicles")
      .update({
        visible: !current.visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  }

  const title = String(body.title || "").trim();
  const marca = String(body.marca || "").trim();
  const galeria = parseGallery(body.gallery || body.galeria);
  const hero = body.imagenHero || body.imagen_hero || body.imagenUrl || body.imagen_url || galeria[0] || null;
  const precio = parsePrice(body.precio);
  const cuotaDesde = parsePrice(body.cuotaDesde);

  const { data, error } = await supabaseAdmin
    .from("vehicles")
    .update({
      title,
      slug: slugify(marca + " " + title),
      marca,
      modelo: body.modelo || title,
      version: body.version || null,
      descripcion: body.descripcion || null,
      precio,
      cuota_desde: cuotaDesde,
      imagen_hero: hero,
      imagen_url: hero,
      galeria,
      hero_title: body.heroTitle || title,
      hero_subtitle: body.heroSubtitle || body.descripcion || null,
      block1_title: body.block1Title || null,
      block1_text: body.block1Text || null,
      block1_image: body.block1Image || galeria[1] || hero,
      block2_title: body.block2Title || null,
      block2_text: body.block2Text || null,
      block2_image: body.block2Image || galeria[2] || hero,
      block3_title: body.block3Title || null,
      block3_text: body.block3Text || null,
      block3_image: body.block3Image || galeria[3] || hero,
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
    .update({
      deleted_at: new Date().toISOString(),
      visible: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ message: "Vehículo no encontrado." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
