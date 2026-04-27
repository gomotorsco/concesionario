import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .select("id, nombre, email, meta_mensual, activo, created_at")
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
    const { nombre, email, password, meta_mensual } = body;

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
          meta_mensual: Number(meta_mensual || 10),
          activo: true,
        },
      ])
      .select("id, nombre, email, meta_mensual, activo, created_at")
      .single();

    if (error) {
      console.error("POST /api/vendedores create error", error);
      return NextResponse.json(
        { message: "No se pudo crear el vendedor." },
        { status: 500 }
      );
    }

    return NextResponse.json({ vendedor: data });
  }

  if (body.type === "update") {
    const { id, nombre, email, meta_mensual, activo } = body;

    if (!id) {
      return NextResponse.json({ message: "id requerido." }, { status: 400 });
    }

    const update: Record<string, any> = {};

    if (nombre !== undefined) update.nombre = String(nombre).trim();
    if (email !== undefined) update.email = String(email).trim();
    if (meta_mensual !== undefined) update.meta_mensual = Number(meta_mensual);
    if (activo !== undefined) update.activo = Boolean(activo);

    const { data, error } = await supabaseAdmin
      .from("vendedores")
      .update(update)
      .eq("id", id)
      .select("id, nombre, email, meta_mensual, activo, created_at")
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
