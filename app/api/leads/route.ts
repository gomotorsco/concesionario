import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const nombre = String(body.nombre || body.name || "").trim();
  const telefono = String(body.telefono || body.whatsapp || body.phone || "").trim();

  if (!nombre || !telefono) {
    return NextResponse.json(
      { message: "Nombre y teléfono son obligatorios." },
      { status: 400 }
    );
  }

  const payload = {
    nombre,
    telefono,
    whatsapp: telefono,
    email: body.email || null,
    ciudad: body.ciudad || null,
    vehiculo: body.vehiculo || body.vehicle || body.vehicleTitle || null,
    cuota_mensual: body.cuotaMensual || body.cuota_mensual || body.monthlyBudget || null,
    cuota_inicial: body.cuotaInicial || body.cuota_inicial || body.downPayment || null,
    mensaje: body.message || body.mensaje || null,
    source: body.source || "web",
    status: "nuevo",
  };

  const { error } = await supabaseAdmin
    .from("landing_leads")
    .insert(payload);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
