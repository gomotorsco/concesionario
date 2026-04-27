import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error, count } = await supabaseAdmin
    .from("landing_leads")
    .select("*", { count: "exact" })
    .neq("estado", "eliminado")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("GET /api/dashboard error", error);
    return NextResponse.json(
      { visits: 0, leads: 0, conversion: 0, recent: [] },
      { status: 500 }
    );
  }

  const leads = (data ?? []).map((l: any) => ({
    ...l,
    telefono_numero: l.telefono_numero ?? l.telefono ?? "",
    estado: l.estado ?? "nuevo",
    seguimiento: l.seguimiento ?? "",
    visto: Boolean(l.visto),
    vendedor_id: l.vendedor_id ?? null,
    vehicle_id: l.vehicle_id ?? null,
    vehicle_name: l.vehicle_name ?? null,
  }));

  const visits = 0;
  const leadsCount = count ?? leads.length;
  const conversion = visits > 0 ? Number(((leadsCount / visits) * 100).toFixed(1)) : 0;

  return NextResponse.json({
    visits,
    leads: leadsCount,
    conversion,
    recent: leads,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "update_lead") {
    const {
      id,
      nombre,
      email,
      telefono,
      seguimiento,
      visto,
      estado,
      vendedor_id,
      vehicle_id,
      vehicle_name,
    } = body;

    if (!id) {
      return NextResponse.json(
        { message: "id de lead requerido." },
        { status: 400 }
      );
    }

    const update: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (nombre !== undefined) update.nombre = nombre;
    if (email !== undefined) update.email = email;
    if (telefono !== undefined) update.telefono = telefono;
    if (seguimiento !== undefined) update.seguimiento = seguimiento;
    if (visto !== undefined) update.visto = visto;
    if (estado !== undefined) update.estado = estado;
    if (vendedor_id !== undefined) update.vendedor_id = vendedor_id || null;
    if (vehicle_id !== undefined) update.vehicle_id = vehicle_id || null;
    if (vehicle_name !== undefined) update.vehicle_name = vehicle_name || null;

    const { data, error } = await supabaseAdmin
      .from("landing_leads")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/dashboard update_lead error", error);
      return NextResponse.json(
        { message: "No se pudo actualizar el lead." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      lead: {
        ...data,
        telefono_numero: data.telefono_numero ?? data.telefono ?? "",
      },
    });
  }

  if (body.type === "delete_lead") {
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { message: "id de lead requerido." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("landing_leads")
      .update({
        estado: "eliminado",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("POST /api/dashboard delete_lead error", error);
      return NextResponse.json(
        { message: "No se pudo eliminar el lead." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ message: "Tipo no soportado." }, { status: 400 });
}
