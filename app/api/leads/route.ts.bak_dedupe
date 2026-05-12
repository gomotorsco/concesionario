import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function cleanPhone(v: any) {
  return String(v || "").replace(/\D/g, "");
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json({ message: "Faltan variables de Supabase en el servidor." }, { status: 500 });
  }

  const body = await req.json();

  const nombre = String(body.nombre || body.name || "").trim();
  const telefonoRaw = String(body.telefono || body.whatsapp || body.phone || "").trim();
  const telefono = cleanPhone(telefonoRaw);

  if (!nombre || !telefono) {
    return NextResponse.json({ message: "Nombre y teléfono son obligatorios." }, { status: 400 });
  }

  const consentimiento = body.consentimiento_datos === true || body.consentimiento === true || body.autorizacion_datos === true;

  if (!consentimiento) {
    return NextResponse.json({ message: "Debes aceptar el tratamiento de datos." }, { status: 400 });
  }

  if (!body.cedula_frontal_url) {
    return NextResponse.json({ message: "La cédula frontal es obligatoria." }, { status: 400 });
  }

  const vehiculo =
    body.vehiculo ||
    body.vehicle ||
    body.vehicleTitle ||
    body.vehicle_name ||
    body.vehicleName ||
    body.vehiculo_interes ||
    null;

  const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

  const { data: duplicated } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .or(`telefono.eq.${telefono},whatsapp.eq.${telefono}`)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (duplicated) {
    return NextResponse.json({
      ok: true,
      duplicated: true,
      lead: duplicated,
      message: "Este lead ya estaba registrado recientemente.",
    });
  }

  const payload = {
    nombre,
    telefono,
    whatsapp: telefono,
    email: body.email || null,
    provincia: body.provincia || null,
    localidad: body.localidad || body.ciudad || body.city || null,
    ciudad: body.ciudad || body.city || body.localidad || null,
    canal: body.canal || "web",
    origen: body.origen || body.source || "web",
    source: body.source || body.origen || "web",

    vehiculo,
    vehicle_id: body.vehicle_id || null,
    vehicle_name: body.vehicle_name || body.vehicleName || vehiculo,
    vehiculo_interes: body.vehiculo_interes || vehiculo,

    tipo_ingreso: body.tipo_ingreso || null,
    ingresos_mensuales: body.ingresos_mensuales || null,
    tiene_cuota_inicial: body.tiene_cuota_inicial ?? null,
    valor_cuota_inicial: body.valor_cuota_inicial || null,
    cuota_mensual: body.cuotaMensual || body.cuota_mensual || body.monthlyBudget || body.cuota || null,
    cuota_inicial: body.cuotaInicial || body.cuota_inicial || body.downPayment || body.inicial || null,

    entrega_vehiculo: body.entrega_vehiculo ?? null,
    entrega_marca: body.entrega_marca || null,
    entrega_modelo: body.entrega_modelo || null,
    entrega_anio: body.entrega_anio || null,
    entrega_km: body.entrega_km || null,
    entrega_estado: body.entrega_estado || null,
    entrega_deuda: body.entrega_deuda || null,

    cedula: body.cedula || null,
    mensaje: body.mensaje || body.message || null,
    message: body.message || body.mensaje || (vehiculo ? `Consulta por ${vehiculo}` : null),

    estado: "nuevo",
    status: "nuevo",
    funnel_stage: "nuevo",
    visto: false,
    lead_score: body.lead_score || 70,
    temperatura: body.temperatura || "caliente",
    prioridad: body.prioridad || "caliente",

    consentimiento_datos: true,
    autorizacion_datos: true,
    consentimiento_at: new Date().toISOString(),
    cedula_frontal_url: body.cedula_frontal_url,
  };

  const { data, error } = await supabaseAdmin
    .from("landing_leads")
    .insert(payload)
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, duplicated: false, lead: data });
}
