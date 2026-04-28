import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error, count } = await supabaseAdmin
    .from("landing_leads")
    .select("*", { count: "exact" })
    .neq("estado", "eliminado")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json(
      {
        visits: 0,
        leads: 0,
        conversion: 0,
        recent: [],
        message: error.message,
      },
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

  return NextResponse.json({
    visits: 0,
    leads: count ?? leads.length,
    conversion: 0,
    recent: leads,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "update_lead") {
      const id = body.id;

      if (!id) {
        return NextResponse.json(
          { message: "id de lead requerido." },
          { status: 400 }
        );
      }

      const update: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (body.nombre !== undefined) update.nombre = body.nombre;
      if (body.email !== undefined) update.email = body.email;

      if (body.telefono !== undefined) {
        update.telefono = body.telefono;
      }

      if (body.seguimiento !== undefined) {
        update.seguimiento = body.seguimiento;
        update.funnel_stage = "en_seguimiento";
      }

      if (body.visto !== undefined) update.visto = Boolean(body.visto);

      if (body.estado !== undefined) {
        update.estado = body.estado;
        update.funnel_stage = body.estado;
      }

      if (body.vendedor_id !== undefined) {
        update.vendedor_id = body.vendedor_id || null;
      }

      if (body.vehicle_id !== undefined) {
        update.vehicle_id = body.vehicle_id || null;
      }

      if (body.vehicle_name !== undefined) {
        update.vehicle_name = body.vehicle_name || null;
      }

      const { data, error } = await supabaseAdmin
        .from("landing_leads")
        .update(update)
        .eq("id", Number(id))
        .select("*")
        .single();

      if (error) {
        console.error("POST /api/dashboard update_lead error", error);
        return NextResponse.json(
          {
            message: error.message,
            details: error.details,
            code: error.code,
          },
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
      const id = body.id;

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
          funnel_stage: "eliminado",
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number(id));

      if (error) {
        return NextResponse.json(
          {
            message: error.message,
            details: error.details,
            code: error.code,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: "Tipo no soportado." }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/dashboard fatal", err);
    return NextResponse.json(
      { message: err?.message || "Error interno." },
      { status: 500 }
    );
  }
}
