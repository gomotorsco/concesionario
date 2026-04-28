import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function scoreLead(body: any) {
  let score = 35;

  if (body.whatsapp) score += 20;
  if (body.vehiculo_interes) score += 10;
  if (body.ingresos_mensuales && Number(body.ingresos_mensuales) > 0) score += 15;
  if (body.tiene_cuota_inicial === true) score += 15;
  if (body.valor_cuota_inicial && Number(body.valor_cuota_inicial) > 0) score += 10;
  if (body.entrega_vehiculo === true) score += 20;

  return Math.max(0, Math.min(score, 100));
}

function temperatura(score: number) {
  if (score >= 75) return "caliente";
  if (score >= 45) return "tibio";
  return "frio";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const nombre = String(body.nombre || "").trim();
    const telefono = String(body.whatsapp || body.telefono || "").trim();
    const ciudad = String(body.ciudad || "").trim();

    if (!nombre || !telefono || !ciudad) {
      return NextResponse.json(
        { ok: false, message: "Nombre, WhatsApp y ciudad son obligatorios." },
        { status: 400 }
      );
    }

    if (!body.autorizacion_datos) {
      return NextResponse.json(
        { ok: false, message: "Debe aceptar la autorización de tratamiento de datos." },
        { status: 400 }
      );
    }

    const score = scoreLead(body);
    const temp = temperatura(score);

    const { data, error } = await supabaseAdmin
      .from("landing_leads")
      .insert([
        {
          nombre,
          telefono,
          ciudad,
          localidad: ciudad,
          origen: "preaprobacion",
          canal: "preaprobacion_web",
          estado: "nuevo",
          funnel_stage: "nuevo",
          visto: false,

          vehiculo_interes: body.vehiculo_interes || null,
          vehicle_name: body.vehiculo_interes || null,

          tipo_ingreso: body.tipo_ingreso || null,
          ingresos_mensuales: body.ingresos_mensuales ? Number(body.ingresos_mensuales) : null,

          tiene_cuota_inicial: Boolean(body.tiene_cuota_inicial),
          valor_cuota_inicial: body.valor_cuota_inicial ? Number(body.valor_cuota_inicial) : null,

          entrega_vehiculo: Boolean(body.entrega_vehiculo),
          entrega_marca: body.entrega_marca || null,
          entrega_modelo: body.entrega_modelo || null,
          entrega_anio: body.entrega_anio ? Number(body.entrega_anio) : null,
          entrega_km: body.entrega_km ? Number(body.entrega_km) : null,
          entrega_estado: body.entrega_estado || null,
          entrega_deuda: body.entrega_deuda || null,

          autorizacion_datos: Boolean(body.autorizacion_datos),
          lead_score: score,
          temperatura: temp,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/preaprobacion error", error);
      return NextResponse.json(
        { ok: false, message: "No se pudo guardar la solicitud." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      lead: data,
      score,
      temperatura: temp,
    });
  } catch (err) {
    console.error("POST /api/preaprobacion fatal", err);
    return NextResponse.json(
      { ok: false, message: "Error interno." },
      { status: 500 }
    );
  }
}
