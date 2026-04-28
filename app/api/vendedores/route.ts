import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const SAFE_SELECT =
  "id, nombre, email, whatsapp, zona, rol, meta_mensual, meta_conversion, meta_leads_trabajados, fecha_ingreso, notas, activo, last_login, last_activity, created_at, updated_at";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .select(SAFE_SELECT)
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
          email: String(email).trim().toLowerCase(),
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
          updated_at: new Date().toISOString(),
        },
      ])
      .select(SAFE_SELECT)
      .single();

    if (error) {
      console.error("POST /api/vendedores create error", error);
      return NextResponse.json(
        { message: "No se pudo crear el vendedor.", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ vendedor: data });
  }

  if (body.type === "update") {
    const {
      id,
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
      activo,
    } = body;

    if (!id) {
      return NextResponse.json({ message: "id requerido." }, { status: 400 });
    }

    const update: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (nombre !== undefined) update.nombre = String(nombre).trim();
    if (email !== undefined) update.email = String(email).trim().toLowerCase();
    if (password !== undefined && String(password).trim() !== "") update.password = String(password);
    if (whatsapp !== undefined) update.whatsapp = whatsapp ? String(whatsapp).trim() : null;
    if (zona !== undefined) update.zona = zona ? String(zona).trim() : null;
    if (rol !== undefined) update.rol = rol || "vendedor";
    if (fecha_ingreso !== undefined) update.fecha_ingreso = fecha_ingreso || null;
    if (meta_mensual !== undefined) update.meta_mensual = Number(meta_mensual);
    if (meta_conversion !== undefined) update.meta_conversion = Number(meta_conversion);
    if (meta_leads_trabajados !== undefined) update.meta_leads_trabajados = Number(meta_leads_trabajados);
    if (notas !== undefined) update.notas = notas ? String(notas).trim() : null;
    if (activo !== undefined) update.activo = Boolean(activo);

    const { data, error } = await supabaseAdmin
      .from("vendedores")
      .update(update)
      .eq("id", id)
      .select(SAFE_SELECT)
      .single();

    if (error) {
      console.error("POST /api/vendedores update error", error);
      return NextResponse.json(
        { message: "No se pudo actualizar el vendedor.", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ vendedor: data });
  }

  return NextResponse.json({ message: "Tipo no soportado." }, { status: 400 });
}
