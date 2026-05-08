import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ vendedores: [], message: error.message }, { status: 500 });
  }

  return NextResponse.json({ vendedores: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    if (body.type === "create") {
      const nombre = String(body.nombre || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "").trim();

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
            nombre,
            email,
            password,
            whatsapp: body.whatsapp ? String(body.whatsapp).trim() : null,
            zona: body.zona ? String(body.zona).trim() : null,
            rol: body.rol || "vendedor",
            fecha_ingreso: body.fecha_ingreso || new Date().toISOString().slice(0, 10),
            meta_mensual: Number(body.meta_mensual || 10),
            meta_conversion: Number(body.meta_conversion || 10),
            meta_leads_trabajados: Number(body.meta_leads_trabajados || 50),
            notas: body.notas ? String(body.notas).trim() : null,
            activo: true,
          },
        ])
        .select("*")
        .single();

      if (error) {
        return NextResponse.json(
          { message: error.message, details: error.details, code: error.code },
          { status: 500 }
        );
      }

      return NextResponse.json({ vendedor: data });
    }

    if (body.type === "reset_password") {
      const id = body.id;
      const password = String(body.password || "").trim();

      if (!id || !password) {
        return NextResponse.json({ message: "id y password requeridos." }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from("vendedores")
        .update({
          password,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
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

      ["nombre", "email", "whatsapp", "zona", "rol", "fecha_ingreso", "notas"].forEach((key) => {
        if (body[key] !== undefined) update[key] = body[key] || null;
      });

      if (body.email !== undefined) update.email = String(body.email).trim().toLowerCase();
      if (body.password !== undefined && body.password !== "") update.password = String(body.password);
      if (body.meta_mensual !== undefined) update.meta_mensual = Number(body.meta_mensual);
      if (body.meta_conversion !== undefined) update.meta_conversion = Number(body.meta_conversion);
      if (body.meta_leads_trabajados !== undefined) update.meta_leads_trabajados = Number(body.meta_leads_trabajados);
      if (body.activo !== undefined) update.activo = Boolean(body.activo);
      if (body.fecha_baja !== undefined) update.fecha_baja = body.fecha_baja;
      if (body.motivo_baja !== undefined) update.motivo_baja = body.motivo_baja || null;
      if (body.fecha_baja !== undefined) update.fecha_baja = body.fecha_baja;
      if (body.motivo_baja !== undefined) update.motivo_baja = body.motivo_baja || null;

      const { data, error } = await supabaseAdmin
        .from("vendedores")
        .update(update)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ message: error.message, details: error.details, code: error.code }, { status: 500 });
      }

      return NextResponse.json({ vendedor: data });
    }

    return NextResponse.json({ message: "Tipo no soportado." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Error interno." }, { status: 500 });
  }
}
