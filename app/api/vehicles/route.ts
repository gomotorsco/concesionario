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
    return value.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 15);
  }
  return [];
}

export async function GET(req: NextRequest) {
  console.log("VERSION: FIX-VEHICLES-NEW");
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin") === "1";
  const type = url.searchParams.get("type");

  let vq = supabaseAdmin
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });
  if (!admin) vq = vq.eq("visible", true);
  if (type) vq = vq.eq("tipo", normalizeType(type));

  const { data: vehicles, error } = await vq;
  if (error) return NextResponse.json({ sections: [], message: error.message }, { status: 500 });

  let sq = supabaseAdmin.from("vehicle_sections").select("*").order("id", { ascending: true });
  if (type) sq = sq.eq("type", normalizeType(type));

  const { data: sectionsDb } = await sq;

  const map = new Map<string, any>();

  for (const s of sectionsDb || []) {
    const title = s.title || s.name;
    if (!title) continue;
    if (["autos", "motos", "ciclomotores"].includes(String(title).toLowerCase())) continue;

    map.set(title, {
      id: s.id,
      title,
      name: title,
      slug: s.slug || slugify(title),
      type: s.type || normalizeType(type),
      visible: s.visible !== false,
      vehicles: [],
    });
  }

  for (const v of vehicles || []) {
      if (!v.section_id) continue;

      for (const section of map.values()) {
        if (String(section.id) === String(v.section_id)) {
          section.vehicles.push({
            ...v,
            galeria: parseGallery(v.galeria),
            imagen_hero: v.imagen_hero || v.imagen_url,
            imagen_url: v.imagen_url || v.imagen_hero,
          });
          break;
        }
      }
    }

    map.get(brand).vehicles.push({
      ...v,
      galeria: parseGallery(v.galeria),
      imagen_hero: v.imagen_hero || v.imagen_url,
      imagen_url: v.imagen_url || v.imagen_hero,
    });
  }

  return NextResponse.json({ sections: Array.from(map.values()), total: vehicles?.length ?? 0 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "section") {
    const title = String(body.title || "").trim();
    const inventoryType = normalizeType(body.sectionType || body.inventoryType || body.type_value);
    if (!title) return NextResponse.json({ message: "Nombre de marca requerido." }, { status: 400 });

    const slug = inventoryType + "-" + slugify(title);

    const { data: existing } = await supabaseAdmin
      .from("vehicle_sections")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) return NextResponse.json({ section: existing });

    const { data, error } = await supabaseAdmin
      .from("vehicle_sections")
      .insert({ title, name: title, slug, type: inventoryType, visible: true })
      .select("*")
      .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ section: data });
  }

  const title = String(body.title || "").trim();
  if (!title) return NextResponse.json({ message: "Nombre requerido." }, { status: 400 });

  const gallery = parseGallery(body.gallery ?? body.galeria);
  const hero = body.imagenHero || body.imagen_hero || body.imagenUrl || body.imagen_url || gallery[0] || null;

  const payload = {
    title,
    slug: slugify((body.marca || "") + " " + title),
    marca: body.marca || null,
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

  const { data, error } = await supabaseAdmin.from("vehicles").insert(payload).select("*").single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ vehicle: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = body.id;

  if (!id) return NextResponse.json({ message: "ID requerido." }, { status: 400 });

  if (body.action === "toggle_visibility") {
    const { data: current, error: readError } = await supabaseAdmin
      .from("vehicles")
      .select("visible")
      .eq("id", id)
      .maybeSingle();

    if (readError) return NextResponse.json({ message: readError.message }, { status: 500 });
    if (!current) return NextResponse.json({ message: "Vehículo no encontrado." }, { status: 404 });

    const { data, error } = await supabaseAdmin
      .from("vehicles")
      .update({ visible: !current.visible, updated_at: new Date().toISOString() })
      .eq("id", id)
      ;

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ message: "No se encontró el vehículo para pausar/activar." }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  const title = String(body.title || "").trim();
  const gallery = parseGallery(body.gallery ?? body.galeria);
  const hero = body.imagenHero || body.imagen_hero || body.imagenUrl || body.imagen_url || gallery[0] || null;

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

  const { data, error } = await supabaseAdmin
    .from("vehicles")
    .update(payload)
    .eq("id", id)
    ;

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ message: "No se encontró el vehículo para editar." }, { status: 404 });

  return NextResponse.json({ ok: true });
}


export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID requerido." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("vehicles")
    .delete()
    .eq("id", id)
    .select("id,title,source,external_id");

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: data || [] });
}

