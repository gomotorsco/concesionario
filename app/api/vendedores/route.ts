import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/vendedores error", error);
    return NextResponse.json({ vendedores: [] }, { status: 500 });
  }

  return NextResponse.json({ vendedores: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "create") {
    const {
      nombre,
      email,
      password,
      whatsapp,
      zona,
      rol,
      fecha_ingreso,
      meta_mensual,
      meta_conversion,
      meta_leads_trabajados,
      notas,
    } = body;

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { message: "Nombre, email y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("vendedores")
      .insert([
        {
          nombre: String(nombre).trim(),
          email: String(email).trim(),
          password: String(password),
          whatsapp: whatsapp ? String(whatsapp).trim() : null,
          zona: zona ? String(zona).trim() : null,
          rol: rol || "vendedor",
          fecha_ingreso: fecha_ingreso || null,
          meta_mensual: Number(meta_mensual || 10),
          meta_conversion: Number(meta_conversion || 10),
          meta_leads_trabajados: Number(meta_leads_trabajados || 50),
          notas: notas ? String(notas).trim() : null,
          activo: true,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/vendedores create error", error);
      return NextResponse.json({ message: error.message, details: error.details, code: error.code }, { status: 500 });
    }

    return NextResponse.json({ vendedor: data });
  }

  if (body.type === "update") {
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: "id requerido." }, { status: 400 });
    }

    const update: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    [
      "nombre",
      "email",
      "whatsapp",
      "zona",
      "rol",
      "fecha_ingreso",
      "notas",
    ].forEach((key) => {
      if (body[key] !== undefined) update[key] = body[key] || null;
    });

    if (body.password !== undefined && body.password !== "") {
      update.password = String(body.password);
    }

    if (body.meta_mensual !== undefined) update.meta_mensual = Number(body.meta_mensual);
    if (body.meta_conversion !== undefined) update.meta_conversion = Number(body.meta_conversion);
    if (body.meta_leads_trabajados !== undefined) update.meta_leads_trabajados = Number(body.meta_leads_trabajados);
    if (body.activo !== undefined) update.activo = Boolean(body.activo);

    const { data, error } = await supabaseAdmin
      .from("vendedores")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/vendedores update error", error);
      return NextResponse.json(
        { message: "No se pudo actualizar el vendedor." },
        { status: 500 }
      );
    }

    return NextResponse.json({ vendedor: data });
  }

  return NextResponse.json({ message: "Tipo no soportado." }, { status: 400 });
}
