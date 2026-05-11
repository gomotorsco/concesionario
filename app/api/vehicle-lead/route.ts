import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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

    const nombre = String(body.nombre || "").trim();
    const telefono = String(body.telefono || body.whatsapp || "").trim();

    if (!nombre || !telefono) {
      return NextResponse.json(
        { ok: false, message: "Nombre y WhatsApp son obligatorios." },
        { status: 400 }
      );
    }

    const consentimiento =
      body.consentimiento_datos === true ||
      body.consentimiento === true;

    if (!consentimiento) {
      return NextResponse.json(
        { ok: false, message: "Debes aceptar el tratamiento de datos." },
        { status: 400 }
      );
    }

    if (!body.cedula_frontal_url) {
      return NextResponse.json(
        { ok: false, message: "La cédula frontal es obligatoria." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("landing_leads")
      .insert([
        {
          nombre,
          telefono,
          email: body.email || null,
          ciudad: body.ciudad || null,
          localidad: body.ciudad || null,
          origen: "vehiculo",
          canal: "pagina_vehiculo",
          estado: "nuevo",
          funnel_stage: "nuevo",
          visto: false,
          vehicle_id: body.vehicle_id || null,
          vehicle_name: body.vehicle_name || null,
          vehiculo_interes: body.vehicle_name || null,
          lead_score: 70,
          temperatura: "caliente",
          consentimiento_datos: true,
          consentimiento_at: new Date().toISOString(),
          cedula_frontal_url: body.cedula_frontal_url,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/vehicle-lead error", error);
      return NextResponse.json(
        { ok: false, message: error.message || "No se pudo guardar el lead." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, lead: data });
  } catch (err) {
    console.error("POST /api/vehicle-lead fatal", err);
    return NextResponse.json(
      { ok: false, message: "Error interno." },
      { status: 500 }
    );
  }
}
