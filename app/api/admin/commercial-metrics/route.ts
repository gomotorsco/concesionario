import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function getMonthInfo() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startISO: start.toISOString(),
    totalDays: end.getDate(),
    currentDay: now.getDate(),
    remainingDays: Math.max(end.getDate() - now.getDate(), 0),
  };
}

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Faltan variables de Supabase en el servidor." },
      { status: 500 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin()!;
  const { startISO, totalDays, currentDay, remainingDays } = getMonthInfo();

  const { data: vendedores } = await supabaseAdmin
    .from("vendedores")
    .select("*");

  const { data: leads } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .gte("created_at", startISO);

  const sellers = vendedores ?? [];
  const monthLeads = leads ?? [];

  const rows = sellers.map((v: any) => {
    const sellerLeads = monthLeads.filter(
      (l: any) => String(l.vendedor_id || "") === String(v.id)
    );

    const ventas = sellerLeads.filter(
      (l: any) => (l.estado || l.status) === "vendido"
    ).length;

    const metaMensual = Number(v.meta_mensual || v.meta_ventas || 10);
    const ritmoNecesario = metaMensual / totalDays;
    const ritmoActual = ventas / Math.max(currentDay, 1);
    const proyeccion = Math.round(ritmoActual * totalDays);

    return {
      vendedor_id: v.id,
      nombre: v.nombre,
      email: v.email,
      leads_mes: sellerLeads.length,
      ventas,
      meta_mensual: metaMensual,
      proyeccion,
      ritmo_necesario: ritmoNecesario,
      ritmo_actual: ritmoActual,
      dias_restantes: remainingDays,
      cumplimiento: metaMensual ? Math.round((ventas / metaMensual) * 100) : 0,
    };
  });

  return NextResponse.json({
    month: {
      startISO,
      totalDays,
      currentDay,
      remainingDays,
    },
    rows,
  });
}
