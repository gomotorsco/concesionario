import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
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
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/vehicle-lead error", error);
      return NextResponse.json(
        { ok: false, message: "No se pudo guardar el lead." },
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
