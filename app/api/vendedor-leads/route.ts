import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function getMonthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function pct(num: number, den: number) {
  if (!den) return 0;
  return Math.round((num / den) * 1000) / 10;
}

export async function GET(req: NextRequest) {
  try {
    const vendedorId = req.cookies.get("seller_session")?.value;

    if (!vendedorId) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
    }

    const { data: vendedor, error: vendedorError } = await supabaseAdmin
      .from("vendedores")
      .select("id, nombre, email, meta_mensual, activo")
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
      console.error("GET /api/vendedor-leads error", error);
      return NextResponse.json({ ok: false, leads: [] }, { status: 500 });
    }

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
    if (perdidos > vendidos && total >= 5) inteligencia.push("Tenés más leads perdidos que vendidos este mes. Conviene revisar objeciones y llamadas.");
    if (seguimiento > 0) inteligencia.push(`Tenés ${seguimiento} leads en seguimiento. Priorizá cerrar los más calientes.`);

    return NextResponse.json({
      ok: true,
      vendedor,
      leads,
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
  } catch (err) {
    console.error("GET vendedor leads error", err);
    return NextResponse.json({ ok: false, leads: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const vendedorId = req.cookies.get("seller_session")?.value;

  if (!vendedorId) {
    return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { id, estado, seguimiento, visto } = body;

  if (!id) {
    return NextResponse.json({ ok: false, message: "id requerido" }, { status: 400 });
  }

  const update: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (estado !== undefined) update.estado = estado;
  if (seguimiento !== undefined) update.seguimiento = seguimiento;
  if (visto !== undefined) update.visto = visto;

  const { data, error } = await supabaseAdmin
    .from("landing_leads")
    .update(update)
    .eq("id", id)
    .eq("vendedor_id", vendedorId)
    .select("*")
    .single();

  if (error) {
    console.error("POST /api/vendedor-leads error", error);
    return NextResponse.json({ ok: false, message: "No se pudo actualizar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, lead: data });
}
