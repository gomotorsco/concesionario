
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

function isPast(value?: string | null) {

  if (!value) return false;

  return new Date(value).getTime() < Date.now();

}

async function touchSeller(supabaseAdmin: any, vendedorId: string) {

  await supabaseAdmin

    .from("vendedores")

    .update({ last_activity: new Date().toISOString() })

    .eq("id", vendedorId);

}

async function createAlert(supabaseAdmin: any, payload: any) {

  await supabaseAdmin.from("seller_alerts").insert({

    vendedor_id: payload.vendedor_id,

    lead_id: payload.lead_id ?? null,

    titulo: payload.titulo,

    mensaje: payload.mensaje,

    tipo: payload.tipo || "info",

    estado: "pendiente",

    status: "pendiente",

    scheduled_at: payload.scheduled_at ?? null,

    created_at: new Date().toISOString(),

  });

}

export async function GET(req: NextRequest) {

  const supabaseAdmin = getSupabaseAdmin();

  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) {

    return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });

  }

  await touchSeller(supabaseAdmin, vendedorId);

  const { data: vendedor, error: vendedorError } = await supabaseAdmin

    .from("vendedores")

    .select("*")

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

    return NextResponse.json({ ok: false, leads: [], message: error.message }, { status: 500 });

  }

  const now = new Date().toISOString();

  for (const lead of data ?? []) {

    const estado = lead.estado || lead.status;

    const fecha = lead.seguimiento_fecha || lead.next_follow_up_at || lead.llamada_fecha;

    if (

      fecha &&

      isPast(fecha) &&

      estado !== "vendido" &&

      estado !== "perdido" &&

      estado !== "eliminado" &&

      estado !== "seguimiento_atrasado"

    ) {

      await supabaseAdmin

        .from("landing_leads")

        .update({

          estado: "seguimiento_atrasado",

          status: "seguimiento_atrasado",

          updated_at: now,

        })

        .eq("id", lead.id)

        .eq("vendedor_id", vendedorId);

      await createAlert(supabaseAdmin, {

        vendedor_id: vendedorId,

        lead_id: lead.id,

        titulo: "Seguimiento atrasado",

        mensaje: `Tenés vencido el seguimiento de ${lead.nombre || "un lead"} por ${lead.vehiculo || lead.vehiculo_interes || "vehículo"}.`,

        tipo: "urgente",

        scheduled_at: fecha,

      });

    }

  }

  const { data: refreshed } = await supabaseAdmin

    .from("landing_leads")

    .select("*")

    .eq("vendedor_id", vendedorId)

    .order("created_at", { ascending: false });

  const { data: alerts } = await supabaseAdmin

    .from("seller_alerts")

    .select("*")

    .eq("vendedor_id", vendedorId)

    .order("created_at", { ascending: false })

    .limit(40);

  const leads = (refreshed ?? []).map((l: any) => ({

    ...l,

    telefono_numero: l.telefono_numero ?? l.telefono ?? l.whatsapp ?? "",

    estado: l.estado ?? l.status ?? "nuevo",

  }));

  const monthStart = getMonthStartISO();

  const leadsMes = leads.filter((l: any) => l.created_at >= monthStart);

  const nuevos = leadsMes.filter((l: any) => l.estado === "nuevo").length;

  const seguimiento = leadsMes.filter((l: any) => ["seguimiento", "en_seguimiento"].includes(l.estado)).length;

  const atrasados = leadsMes.filter((l: any) => l.estado === "seguimiento_atrasado").length;

  const vendidos = leadsMes.filter((l: any) => l.estado === "vendido").length;

  const perdidos = leadsMes.filter((l: any) => l.estado === "perdido").length;

  const total = leadsMes.length;

  const meta = vendedor.meta_mensual ?? 10;

  const inteligencia: string[] = [];

  if (nuevos > 0) inteligencia.push(`Tenés ${nuevos} leads nuevos pendientes por contactar.`);

  if (atrasados > 0) inteligencia.push(`Tenés ${atrasados} seguimientos atrasados. Priorizalos ahora.`);

  if (vendidos < meta) inteligencia.push(`Te faltan ${Math.max(meta - vendidos, 0)} ventas para cumplir tu meta mensual.`);

  if (total >= 10 && pct(vendidos, total) < 10) inteligencia.push("Tu conversión está por debajo del 10%. Revisá seguimiento y velocidad de contacto.");

  if (perdidos > vendidos && total >= 5) inteligencia.push("Tenés más leads perdidos que vendidos este mes.");

  return NextResponse.json({

    ok: true,

    vendedor,

    leads,

    alerts: alerts ?? [],

    unread_alerts: (alerts ?? []).filter((a: any) => a.estado !== "leida" && a.status !== "leida").length,

    metrics: {

      total_mes: total,

      nuevos,

      en_seguimiento: seguimiento,

      atrasados,

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

  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) {

    return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });

  }

  await touchSeller(supabaseAdmin, vendedorId);

  const body = await req.json();

  const {

    id,

    estado,

    seguimiento,

    seguimiento_fecha,

    notas,

    visto,

    action,

    nombre,

    telefono,

    whatsapp,

    ciudad,

    vehiculo_interes,

    cuota_mensual,

    cedula,

    llamada_fecha,

    llamada_estado,

    resumen_llamada,

    visita_fecha,

    prioridad,

  } = body;

  if (action === "create_lead") {

    const phone = String(whatsapp || telefono || "").trim();

    if (!nombre || !phone) {

      return NextResponse.json({ ok: false, message: "Nombre y WhatsApp son obligatorios" }, { status: 400 });

    }

    const { data, error } = await supabaseAdmin

      .from("landing_leads")

      .insert({

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

        prioridad: prioridad || "normal",

        created_at: new Date().toISOString(),

        updated_at: new Date().toISOString(),

      })

      .select("*")

      .single();

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

  if (estado !== undefined) {

    update.estado = estado;

    update.status = estado;

    update.funnel_stage = estado;

  }

  if (seguimiento !== undefined) update.seguimiento = seguimiento;

  if (seguimiento_fecha !== undefined) {

    update.seguimiento_fecha = seguimiento_fecha;

    update.next_follow_up_at = seguimiento_fecha;

    update.estado = "seguimiento";

    update.status = "seguimiento";

  }

  if (notas !== undefined) update.notas = notas;

  if (visto !== undefined) update.visto = visto;

  if (cedula !== undefined) update.cedula = cedula;

  if (prioridad !== undefined) update.prioridad = prioridad;

  if (visita_fecha !== undefined) update.visita_fecha = visita_fecha;

  if (llamada_fecha !== undefined) {

    update.llamada_fecha = llamada_fecha;

    update.next_follow_up_at = llamada_fecha;

    update.estado = "seguimiento";

    update.status = "seguimiento";

  }

  if (llamada_estado !== undefined) {

    update.llamada_estado = llamada_estado;

    update.ultima_llamada_at = new Date().toISOString();

  }

  if (resumen_llamada !== undefined) update.resumen_llamada = resumen_llamada;

  const { data, error } = await supabaseAdmin

    .from("landing_leads")

    .update(update)

    .eq("id", id)

    .eq("vendedor_id", vendedorId)

    .select("*")

    .single();

  if (error) {

    return NextResponse.json({ ok: false, message: error.message || "No se pudo actualizar" }, { status: 500 });

  }

  if (llamada_fecha) {

    await supabaseAdmin.from("lead_calls").insert({

      lead_id: Number(id),

      vendedor_id: vendedorId,

      resultado: "agendada",

      resumen: seguimiento || notas || "Llamada agendada",

      scheduled_at: llamada_fecha,

      status: "pendiente",

      created_at: new Date().toISOString(),

    });

    await createAlert(supabaseAdmin, {

      vendedor_id: vendedorId,

      lead_id: Number(id),

      titulo: "Llamada agendada",

      mensaje: `Llamar a ${data.nombre || "lead"} por ${data.vehiculo || data.vehiculo_interes || "vehículo"}.`,

      tipo: "seguimiento",

      scheduled_at: llamada_fecha,

    });

  }

  if (seguimiento_fecha) {

    await createAlert(supabaseAdmin, {

      vendedor_id: vendedorId,

      lead_id: Number(id),

      titulo: "Seguimiento programado",

      mensaje: `Dar seguimiento a ${data.nombre || "lead"} por ${data.vehiculo || data.vehiculo_interes || "vehículo"}.`,

      tipo: "seguimiento",

      scheduled_at: seguimiento_fecha,

    });

  }

  if (visita_fecha) {

    await createAlert(supabaseAdmin, {

      vendedor_id: vendedorId,

      lead_id: Number(id),

      titulo: "Visita agendada",

      mensaje: `${data.nombre || "Lead"} tiene visita agendada en concesionario.`,

      tipo: "visita",

      scheduled_at: visita_fecha,

    });

  }

  if (llamada_estado) {

    await supabaseAdmin.from("lead_calls").insert({

      lead_id: Number(id),

      vendedor_id: vendedorId,

      resultado: llamada_estado,

      resumen: resumen_llamada || null,

      completed_at: new Date().toISOString(),

      status: "completado",

      created_at: new Date().toISOString(),

    });

  }

  await supabaseAdmin.from("lead_events").insert({

    lead_id: Number(id),

    vendedor_id: vendedorId,

    type: llamada_estado ? "llamada_registrada" : llamada_fecha ? "llamada_agendada" : visita_fecha ? "visita_agendada" : seguimiento_fecha ? "seguimiento_programado" : estado ? "estado_actualizado" : "lead_actualizado",

    message: llamada_estado ? `Llamada registrada: ${llamada_estado}` : llamada_fecha ? "Llamada agendada" : visita_fecha ? "Visita agendada" : seguimiento_fecha ? "Seguimiento programado" : estado ? `Estado actualizado a ${estado}` : "Lead actualizado",

    meta: { estado, seguimiento, seguimiento_fecha, llamada_fecha, llamada_estado, resumen_llamada, visita_fecha, cedula, prioridad, notas },

  });

  return NextResponse.json({ ok: true, lead: data });

}

