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
  if (["moto", "motos", "motorcycle"].includes(raw)) return "moto";
  if (["ciclomotor", "ciclomotores", "cuatriciclo", "cuatriciclos", "scooter", "light_vehicle"].includes(raw)) return "ciclomotor";
  return "auto";
}

function normalizeVehicle(v: any) {
  return {
    ...v,
    imagen_url: v.imagen_url || v.imagen_hero,
    imagen_hero: v.imagen_hero || v.imagen_url,
    slug: v.slug || slugify(v.title),
    precio: v.precio || v.precio_desde,
    moneda: v.moneda || "COP",
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin") === "1";
  const typeFilter = url.searchParams.get("type") ? normalizeType(url.searchParams.get("type")) : null;

  let vehiclesQuery = supabaseAdmin
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (!admin) vehiclesQuery = vehiclesQuery.eq("visible", true);
  if (typeFilter) vehiclesQuery = vehiclesQuery.eq("tipo", typeFilter);

  const { data: vehicles, error } = await vehiclesQuery;

  if (error) {
    return NextResponse.json({ sections: [], total: 0, message: error.message }, { status: 500 });
  }

  const rows = vehicles ?? [];
  const brandMap = new Map<string, any[]>();

  for (const vehicle of rows) {
    const brand = vehicle.marca || "Sin marca";
    if (!brandMap.has(brand)) brandMap.set(brand, []);
    brandMap.get(brand)!.push(normalizeVehicle(vehicle));
  }

  const sections = Array.from(brandMap.entries())
    .filter(([brand]) => !["autos", "motos", "ciclomotores"].includes(brand.toLowerCase()))
    .map(([brand, brandVehicles], index) => ({
      id: index + 1,
      title: brand,
      name: brand,
      slug: slugify(brand),
      type: typeFilter || normalizeType(brandVehicles[0]?.tipo),
      visible: true,
      orden: index + 1,
      vehicles: brandVehicles,
    }));

  return NextResponse.json({ sections, total: rows.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "section") {
    const title = String(body.title || "").trim();
    const inventoryType = normalizeType(body.sectionType || body.type_value || body.inventoryType);

    if (!title) {
      return NextResponse.json({ message: "Nombre de marca requerido." }, { status: 400 });
    }

    const slug = `${inventoryType}-${slugify(title)}`;

    const { data, error } = await supabaseAdmin
      .from("vehicle_sections")
      .upsert([{ title, name: title, slug, type: inventoryType, visible: true }], { onConflict: "slug" })
      .select("*")
      .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ section: data });
  }

  if (body.type === "vehicle") {
    const title = String(body.title || "").trim();
    const inventoryType = normalizeType(body.tipo || body.inventoryType);
    const sectionId = body.sectionId ? Number(body.sectionId) : null;

    if (!title) {
      return NextResponse.json({ message: "Nombre del modelo requerido." }, { status: 400 });
    }

    let marca = body.marca || null;

    if (sectionId && !marca) {
      const { data: section } = await supabaseAdmin
        .from("vehicle_sections")
        .select("title,name")
        .eq("id", sectionId)
        .single();

      marca = section?.title || section?.name || null;
    }

    const gallery = Array.isArray(body.gallery)
      ? body.gallery
      : String(body.gallery || "")
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean);

    const hero = body.imagen1 || body.imagenUrl || gallery[0] || null;

    const { data, error } = await supabaseAdmin
      .from("vehicles")
      .insert([{
        title,
        slug: slugify(`${marca || ""} ${title}`),
        marca,
        modelo: body.modelo || title,
        version: body.version || null,
        descripcion: body.descripcion || null,
        tipo: inventoryType,
        categoria: body.categoria || null,
        precio: body.precio ? Number(body.precio) : null,
        cuota_desde: body.cuotaDesde ? Number(body.cuotaDesde) : null,
        moneda: "COP",
        imagen_url: hero,
        imagen_hero: hero,
        galeria: gallery,
        section_id: sectionId,
        visible: true,
        review_status: "approved",
        estado: "disponible",
      }])
      .select("*")
      .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ vehicle: data });
  }

  return NextResponse.json({ message: "Tipo no soportado." }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = Number(body.id);

  if (!id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  if (body.action === "toggle_visibility") {
    const { data: current } = await supabaseAdmin
      .from("vehicles")
      .select("visible")
      .eq("id", id)
      .single();

    const { error } = await supabaseAdmin
      .from("vehicles")
      .update({ visible: !current?.visible, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const gallery = Array.isArray(body.gallery)
    ? body.gallery
    : String(body.gallery || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

  const hero = body.imagenHero || body.imagenUrl || gallery[0] || null;

  const { error } = await supabaseAdmin
    .from("vehicles")
    .update({
      title: body.title,
      slug: slugify(`${body.marca || ""} ${body.title || ""}`),
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
    })
    .eq("id", id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = Number(new URL(req.url).searchParams.get("id"));

  if (!id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  const { error } = await supabaseAdmin.from("vehicles").delete().eq("id", id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
