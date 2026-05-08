import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function getMonthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function pct(num: number, den: number) {
  if (!den) return 0;
  return Math.round((num / den) * 1000) / 10;
}

async function touchSeller(
  supabaseAdmin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  vendedorId: string
) {
  await supabaseAdmin
    .from("vendedores")
    .update({ last_activity: new Date().toISOString() })
    .eq("id", vendedorId);
}

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) {
    return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
  }

  await touchSeller(supabaseAdmin, vendedorId);

  const { data: vendedor, error: vendedorError } = await supabaseAdmin
    .from("vendedores")
    .select("id, nombre, email, whatsapp, foto_url, zona, meta_mensual, activo, last_login, last_activity")
    .eq("id", vendedorId)
    .single();

  if (vendedorError || !vendedor) {
    return NextResponse.json({ ok: false, message: "Vendedor no encontrado" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .eq("vendedor_id", vendedorId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, leads: [] }, { status: 500 });
  }

  const { data: alerts } = await supabaseAdmin
    .from("seller_alerts")
    .select("*")
    .eq("vendedor_id", vendedorId)
    .order("created_at", { ascending: false })
    .limit(20);

  const leads = (data ?? []).map((l: any) => ({
    ...l,
    telefono_numero: l.telefono_numero ?? l.telefono ?? "",
    estado: l.estado ?? "nuevo",
    seguimiento: l.seguimiento ?? "",
  }));

  const monthStart = getMonthStartISO();
  const leadsMes = leads.filter((l: any) => l.created_at >= monthStart);

  const nuevos = leadsMes.filter((l: any) => l.estado === "nuevo").length;
  const seguimiento = leadsMes.filter((l: any) => l.estado === "en_seguimiento").length;
  const vendidos = leadsMes.filter((l: any) => l.estado === "vendido").length;
  const perdidos = leadsMes.filter((l: any) => l.estado === "perdido").length;
  const total = leadsMes.length;
  const meta = vendedor.meta_mensual ?? 10;

  const inteligencia: string[] = [];

  if (nuevos > 0) inteligencia.push(`Tenés ${nuevos} leads nuevos pendientes por contactar.`);
  if (vendidos < meta) inteligencia.push(`Te faltan ${Math.max(meta - vendidos, 0)} ventas para cumplir tu meta mensual.`);
  if (total >= 10 && pct(vendidos, total) < 10) inteligencia.push("Tu conversión está por debajo del 10%. Revisá seguimiento y velocidad de contacto.");
  if (perdidos > vendidos && total >= 5) inteligencia.push("Tenés más leads perdidos que vendidos este mes.");
  if (seguimiento > 0) inteligencia.push(`Tenés ${seguimiento} leads en seguimiento. Priorizá cerrar los más calientes.`);

  return NextResponse.json({
    ok: true,
    vendedor,
    leads,
    alerts: alerts ?? [],
    unread_alerts: (alerts ?? []).filter((a: any) => !a.read).length,
    metrics: {
      total_mes: total,
      nuevos,
      en_seguimiento: seguimiento,
      vendidos,
      perdidos,
      meta_mensual: meta,
      conversion: pct(vendidos, total),
      progreso_meta: pct(vendidos, meta),
    },
    inteligencia,
  });
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) {
    return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
  }

  await touchSeller(supabaseAdmin, vendedorId);

  const body = await req.json();
  const { id, estado, seguimiento, seguimiento_fecha, notas, visto, action, nombre, telefono, whatsapp, ciudad, vehiculo_interes, cuota_mensual } = body;

  if (action === "create_lead") {
    const phone = String(whatsapp || telefono || "").trim();
    if (!nombre || !phone) return NextResponse.json({ ok: false, message: "Nombre y WhatsApp son obligatorios" }, { status: 400 });

    const { data, error } = await supabaseAdmin.from("landing_leads").insert({
      nombre: String(nombre).trim(),
      telefono: phone,
      whatsapp: phone,
      ciudad: ciudad ? String(ciudad).trim() : null,
      vehiculo_interes: vehiculo_interes ? String(vehiculo_interes).trim() : null,
      vehiculo: vehiculo_interes ? String(vehiculo_interes).trim() : null,
      cuota_mensual: cuota_mensual ? String(cuota_mensual).trim() : null,
      vendedor_id: vendedorId,
      origen: "vendedor",
      source: "vendedor_panel",
      canal: "vendedor",
      estado: "nuevo",
      status: "nuevo",
      visto: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select("*").single();

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, lead: data });
  }

  if (!id) {
    return NextResponse.json({ ok: false, message: "id requerido" }, { status: 400 });
  }

  const update: Record<string, any> = {
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  };

  if (estado !== undefined) update.estado = estado;
  if (estado !== undefined) update.funnel_stage = estado;
  if (seguimiento !== undefined) update.seguimiento = seguimiento;
  if (seguimiento_fecha !== undefined) update.seguimiento_fecha = seguimiento_fecha;
  if (seguimiento_fecha !== undefined) update.next_follow_up_at = seguimiento_fecha;
  if (notas !== undefined) update.notas = notas;
  if (seguimiento_fecha !== undefined) update.seguimiento_fecha = seguimiento_fecha;
  if (seguimiento_fecha !== undefined) update.next_follow_up_at = seguimiento_fecha;
  if (notas !== undefined) update.notas = notas;
  if (visto !== undefined) update.visto = visto;

  const { data, error } = await supabaseAdmin
    .from("landing_leads")
    .update(update)
    .eq("id", id)
    .eq("vendedor_id", vendedorId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: "No se pudo actualizar" }, { status: 500 });
  }

  await supabaseAdmin.from("lead_events").insert([
    {
      lead_id: Number(id),
      vendedor_id: vendedorId,
      type: estado ? "estado_actualizado" : seguimiento_fecha ? "seguimiento_programado" : "seguimiento_actualizado",
      message: estado ? `Estado actualizado a ` : seguimiento_fecha ? "Seguimiento programado" : "Seguimiento actualizado",
      meta: { estado, seguimiento, seguimiento_fecha, notas },
    },
  ]);

  return NextResponse.json({ ok: true, lead: data });
}
