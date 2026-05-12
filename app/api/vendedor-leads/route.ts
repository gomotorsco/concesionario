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
    .select("id, nombre, email, whatsapp, zona, foto_url, meta_mensual, activo, last_login, last_activity")
    .eq("id", vendedorId)
    .single();

  if (vendedorError || !vendedor) {
    return NextResponse.json({ ok: false, message: "Vendedor no encontrado" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .eq("vendedor_id", vendedorId)
    .neq("estado", "eliminado")
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
  const { id, estado, seguimiento, visto } = body;

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
  if (body.notas !== undefined) update.notas = body.notas;
  if (body.resumen_llamada !== undefined) update.resumen_llamada = body.resumen_llamada;
  if (body.llamada_estado !== undefined) update.llamada_estado = body.llamada_estado;
  if (body.cedula !== undefined) update.cedula = body.cedula;
  if (body.funnel_stage !== undefined) update.funnel_stage = body.funnel_stage;
  if (body.seguimiento_fecha !== undefined) {
    update.seguimiento_fecha = body.seguimiento_fecha || null;
    update.next_follow_up_at = body.seguimiento_fecha || null;
  }
  if (body.visita_fecha !== undefined) {
    update.visita_fecha = body.visita_fecha || null;
  }

  if (body.llamada_fecha !== undefined) {
    update.llamada_fecha = body.llamada_fecha || null;
    if (!update.next_follow_up_at) update.next_follow_up_at = body.llamada_fecha || null;
  }
  if (visto !== undefined) update.visto = visto;

  const { data, error } = await supabaseAdmin
    .from("landing_leads")
    .update(update)
    .eq("id", id)
    .eq("vendedor_id", vendedorId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message, code: error.code, details: error.details }, { status: 500 });
  }

  await supabaseAdmin.from("lead_events").insert([
    {
      lead_id: Number(id),
      vendedor_id: vendedorId,
      type: estado ? "estado_actualizado" : "seguimiento_actualizado",
      message: estado ? `Estado actualizado a ${estado}` : "Seguimiento actualizado",
      meta: { estado, seguimiento },
    },
  ]);

  return NextResponse.json({ ok: true, lead: data });
}
