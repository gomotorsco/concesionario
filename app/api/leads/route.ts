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

  const body = await req.json();

  const nombre = String(body.nombre || body.name || "").trim();
  const telefono = String(body.telefono || body.whatsapp || body.phone || "").trim();

  if (!nombre || !telefono) {
    return NextResponse.json({ message: "Nombre y teléfono son obligatorios." }, { status: 400 });
  }

  const vehiculo = body.vehiculo || body.vehicle || body.vehicleTitle || body.vehicle_name || body.vehiculo_interes || null;
  const cuotaMensual = body.cuotaMensual || body.cuota_mensual || body.monthlyBudget || body.cuota || null;
  const cuotaInicial = body.cuotaInicial || body.cuota_inicial || body.downPayment || body.inicial || null;

  const payload = {
    nombre,
    telefono,
    whatsapp: telefono,
    email: body.email || null,
    ciudad: body.ciudad || body.city || null,
    vehiculo,
    vehicle_name: vehiculo,
    vehiculo_interes: vehiculo,
    cuota_mensual: cuotaMensual,
    cuota_inicial: cuotaInicial,
    mensaje: body.message || body.mensaje || (vehiculo ? `Consulta por ${vehiculo}` : null),
    source: body.source || "web",
    origen: body.source || "web",
    estado: "nuevo",
    status: "nuevo",
  };

  const { data, error } = await supabaseAdmin
    .from("landing_leads")
    .insert(payload)
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, lead: data });
}
