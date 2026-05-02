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
  if (["ciclomotor", "ciclomotores", "cuatriciclo", "scooter", "light_vehicle"].includes(raw)) {
    return "ciclomotor";
  }

  return "auto";
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin") === "1";
  const requestedType = url.searchParams.get("type");
  const typeFilter = requestedType ? normalizeType(requestedType) : null;

  const { data: sections, error: sectionError } = await supabaseAdmin
    .from("vehicle_sections")
    .select("*")
    .order("orden", { ascending: true });

  if (sectionError) {
    return NextResponse.json({ sections: [], message: sectionError.message }, { status: 500 });
  }

  let vehiclesQuery = supabaseAdmin
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (!admin) vehiclesQuery = vehiclesQuery.eq("visible", true);
  if (typeFilter) vehiclesQuery = vehiclesQuery.eq("tipo", typeFilter);

  const { data: vehicles, error: vehiclesError } = await vehiclesQuery;

  if (vehiclesError) {
    return NextResponse.json({ sections: [], message: vehiclesError.message }, { status: 500 });
  }

  const normalizedSections = (sections ?? [])
    .filter((s: any) => admin || s.visible !== false)
    .filter((s: any) => !typeFilter || normalizeType(s.type) === typeFilter)
    .map((section: any) => {
      const sectionVehicles = (vehicles ?? []).filter((v: any) => {
        if (v.section_id && Number(v.section_id) === Number(section.id)) return true;

        const sectionBrand = String(section.title || section.name || "").toLowerCase();
        const vehicleBrand = String(v.marca || "").toLowerCase();

        return sectionBrand && vehicleBrand && sectionBrand === vehicleBrand;
      });

      return {
        ...section,
        name: section.name || section.title,
        vehicles: sectionVehicles.map((v: any) => ({
          ...v,
          imagen_url: v.imagen_url || v.imagen_hero,
          imagen_hero: v.imagen_hero || v.imagen_url,
          slug: v.slug || slugify(v.title),
          precio: v.precio || v.precio_desde,
          moneda: v.moneda || "COP",
        })),
      };
    });

  return NextResponse.json({
    sections: normalizedSections,
    total: vehicles?.length ?? 0,
  });
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
      .upsert(
        [
          {
            title,
            name: title,
            slug,
            type: inventoryType,
            visible: true,
          },
        ],
        { onConflict: "slug" }
      )
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

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

    const { data, error } = await supabaseAdmin
      .from("vehicles")
      .insert([
        {
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
          imagen_url: body.imagen1 || body.imagenUrl || null,
          imagen_hero: body.imagen1 || body.imagenUrl || null,
          section_id: sectionId,
          visible: true,
          review_status: "approved",
          estado: "disponible",
        },
      ])
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ vehicle: data });
  }

  return NextResponse.json({ message: "Tipo no soportado." }, { status: 400 });
}
