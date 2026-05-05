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

function parseGallery(value: any) {
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, 15);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).slice(0, 15);
    } catch {}

    return value
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 15);
  }

  return [];
}

function normalizeVehicle(v: any) {
  return {
    ...v,
    imagen_hero: v.imagen_hero || v.imagen_url,
    imagen_url: v.imagen_url || v.imagen_hero,
    precio: v.precio || v.precio_desde,
    moneda: v.moneda || "COP",
    galeria: parseGallery(v.galeria),
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin") === "1";
  const typeFilter = url.searchParams.get("type")
    ? normalizeType(url.searchParams.get("type"))
    : null;

  let vehicleQuery = supabaseAdmin
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (!admin) vehicleQuery = vehicleQuery.eq("visible", true);
  if (typeFilter) vehicleQuery = vehicleQuery.eq("tipo", typeFilter);

  const { data: vehicles, error: vehicleError } = await vehicleQuery;

  if (vehicleError) {
    return NextResponse.json(
      { sections: [], total: 0, message: vehicleError.message },
      { status: 500 }
    );
  }

  let sectionQuery = supabaseAdmin
    .from("vehicle_sections")
    .select("*")
    .order("orden", { ascending: true });

  if (typeFilter) sectionQuery = sectionQuery.eq("type", typeFilter);

  const { data: dbSections } = await sectionQuery;

  const map = new Map<string, any>();

  for (const s of dbSections || []) {
    const title = s.title || s.name;
    if (!title) continue;

    const lower = String(title).toLowerCase();
    if (["autos", "motos", "ciclomotores"].includes(lower)) continue;

    map.set(title, {
      id: s.id,
      title,
      name: title,
      slug: s.slug || slugify(title),
      type: s.type || typeFilter || "auto",
      visible: s.visible !== false,
      orden: s.orden || 0,
      vehicles: [],
    });
  }

  for (const raw of vehicles || []) {
    const v = normalizeVehicle(raw);
    const brand = v.marca || "Sin marca";

    if (!map.has(brand)) {
      map.set(brand, {
        id: "brand-" + slugify(brand),
        title: brand,
        name: brand,
        slug: slugify(brand),
        type: v.tipo || typeFilter || "auto",
        visible: true,
        orden: 999,
        vehicles: [],
      });
    }

    map.get(brand).vehicles.push(v);
  }

  return NextResponse.json({
    sections: Array.from(map.values()),
    total: vehicles?.length ?? 0,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "section") {
    const title = String(body.title || "").trim();
    const inventoryType = normalizeType(body.sectionType || body.inventoryType || body.type_value);

    if (!title) {
      return NextResponse.json({ message: "Nombre de marca requerido." }, { status: 400 });
    }

    const slug = inventoryType + "-" + slugify(title);

    const { data: existing } = await supabaseAdmin
      .from("vehicle_sections")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ section: existing });
    }

    const { data, error } = await supabaseAdmin
      .from("vehicle_sections")
      .insert({
        title,
        slug,
        type: inventoryType,
        visible: true,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ section: data });
  }

  const title = String(body.title || "").trim();

  if (!title) {
    return NextResponse.json({ message: "Nombre requerido." }, { status: 400 });
  }

  const gallery = parseGallery(body.gallery ?? body.galeria);
  const hero =
    body.imagenHero ||
    body.imagen_hero ||
    body.imagenUrl ||
    body.imagen_url ||
    gallery[0] ||
    null;

  const marca = body.marca || null;

  const payload = {
    title,
    slug: slugify((marca || "") + " " + title),
    marca,
    modelo: body.modelo || title,
    version: body.version || null,
    descripcion: body.descripcion || null,
    tipo: normalizeType(body.inventoryType || body.tipo),
    precio: body.precio ? Number(body.precio) : null,
    cuota_desde: body.cuotaDesde ? Number(body.cuotaDesde) : null,
    moneda: "COP",
    imagen_hero: hero,
    imagen_url: hero,
    galeria: gallery,
    visible: true,
    estado: "disponible",
    review_status: "approved",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("vehicles")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ vehicle: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = body.id;

  if (!id) {
    return NextResponse.json({ message: "ID requerido." }, { status: 400 });
  }

  if (body.action === "toggle_visibility") {
    const { data: current, error: readError } = await supabaseAdmin
      .from("vehicles")
      .select("visible")
      .eq("id", id)
      .single();

    if (readError) {
      return NextResponse.json({ message: readError.message }, { status: 500 });
    }

    const { error } = await supabaseAdmin
      .from("vehicles")
      .update({
        visible: !current?.visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  const gallery = parseGallery(body.gallery ?? body.galeria);
  const hero =
    body.imagenHero ||
    body.imagen_hero ||
    body.imagenUrl ||
    body.imagen_url ||
    gallery[0] ||
    null;

  const title = String(body.title || "").trim();

  const payload = {
    title,
    slug: slugify((body.marca || "") + " " + title),
    marca: body.marca || null,
    modelo: body.modelo || null,
    version: body.version || null,
    descripcion: body.descripcion || null,
    precio: body.precio ? Number(body.precio) : null,
    cuota_desde: body.cuotaDesde ? Number(body.cuotaDesde) : null,
    imagen_hero: hero,
    imagen_url: hero,
    galeria: gallery,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("vehicles")
    .update(payload)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID requerido." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
