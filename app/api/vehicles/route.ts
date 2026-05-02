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

export async function GET(req: NextRequest) {
  const admin = new URL(req.url).searchParams.get("admin") === "1";

  const { data: sections, error: sectionError } = await supabaseAdmin
    .from("vehicle_sections")
    .select("*")
    .order("orden", { ascending: true });

  if (sectionError) {
    return NextResponse.json(
      { sections: [], message: sectionError.message },
      { status: 500 }
    );
  }

  const query = supabaseAdmin
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (!admin) {
    query.eq("visible", true);
  }

  const { data: vehicles, error: vehiclesError } = await query;

  if (vehiclesError) {
    return NextResponse.json(
      { sections: [], message: vehiclesError.message },
      { status: 500 }
    );
  }

  const allSections = sections?.length
    ? sections
    : [
        { id: 1, title: "Autos", slug: "autos", type: "auto", visible: true, orden: 1 },
        { id: 2, title: "Motos", slug: "motos", type: "moto", visible: true, orden: 2 },
        { id: 3, title: "Ciclomotores", slug: "ciclomotores", type: "ciclomotor", visible: true, orden: 3 },
      ];

  const result = allSections
    .filter((s: any) => admin || s.visible !== false)
    .map((section: any) => {
      const sectionType = String(section.type || section.slug || "").toLowerCase();

      const sectionVehicles = (vehicles ?? []).filter((v: any) => {
        const tipo = String(v.tipo || "").toLowerCase();

        if (section.slug === "autos" || sectionType === "auto" || sectionType === "autos") {
          return !tipo || tipo === "auto" || tipo === "autos" || tipo === "car";
        }

        if (section.slug === "motos" || sectionType === "moto" || sectionType === "motos") {
          return tipo === "moto" || tipo === "motos" || tipo === "motorcycle";
        }

        if (section.slug === "ciclomotores" || sectionType === "ciclomotor") {
          return tipo === "ciclomotor" || tipo === "scooter";
        }

        return v.section_id === section.id;
      });

      return {
        ...section,
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
    sections: result,
    total: vehicles?.length ?? 0,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "section") {
    const title = String(body.title || "").trim();

    if (!title) {
      return NextResponse.json({ message: "Título requerido." }, { status: 400 });
    }

    const slug = slugify(title);

    const { data, error } = await supabaseAdmin
      .from("vehicle_sections")
      .insert([
        {
          title,
          name: title,
          slug,
          type: body.sectionType || body.type_value || "auto",
          visible: true,
        },
      ])
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ section: data });
  }

  if (body.type === "vehicle") {
    const title = String(body.title || "").trim();

    if (!title) {
      return NextResponse.json({ message: "Título requerido." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("vehicles")
      .insert([
        {
          title,
          slug: slugify(title),
          marca: body.marca || null,
          modelo: body.modelo || null,
          tipo: body.tipo || "auto",
          categoria: body.categoria || null,
          precio: body.precio ? Number(body.precio) : null,
          cuota_desde: body.cuotaDesde ? Number(body.cuotaDesde) : null,
          moneda: "COP",
          imagen_url: body.imagen1 || body.imagenUrl || null,
          imagen_hero: body.imagen1 || body.imagenUrl || null,
          section_id: body.sectionId ? Number(body.sectionId) : null,
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
