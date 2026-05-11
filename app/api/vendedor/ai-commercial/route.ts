import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

async function getConfig(supabaseAdmin: any) {
  const { data } = await supabaseAdmin
    .from("config")
    .select("*")
    .in("key", ["anthropic_api_key", "anthropic_model", "commercial_ai_prompt"]);

  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value || "";
  return map;
}

function fallbackAdvice(lead: any) {
  const estado = lead.estado || lead.status || "nuevo";

  if (estado === "seguimiento_atrasado") {
    return "Este lead tiene seguimiento vencido. Llamá primero. Si no responde, enviá WhatsApp corto con opción de cuota y pedí confirmar horario.";
  }

  if (lead.cuota_mensual || lead.cuota_inicial || lead.valor_cuota_inicial) {
    return "El cliente dejó datos de financiación. No enfoques la conversación en precio total; hablá de cuota mensual, inicial y aprobación.";
  }

  if (estado === "nuevo") {
    return "Contactalo ahora. Primer objetivo: confirmar vehículo de interés, presupuesto mensual y si tiene cuota inicial.";
  }

  return "Revisá último contacto, confirmá interés y dejá una próxima acción con fecha concreta.";
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const vendedorId = req.cookies.get("vendedor_id")?.value;

  if (!vendedorId) return NextResponse.json({ message: "No autorizado." }, { status: 401 });

  const body = await req.json();
  const leadId = body.leadId;

  if (!leadId) return NextResponse.json({ message: "leadId requerido." }, { status: 400 });

  const { data: lead, error } = await supabaseAdmin
    .from("landing_leads")
    .select("*")
    .eq("id", leadId)
    .eq("vendedor_id", vendedorId)
    .maybeSingle();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  if (!lead) return NextResponse.json({ message: "Lead no encontrado." }, { status: 404 });

  const config = await getConfig(supabaseAdmin);
  const apiKey = config.anthropic_api_key;
  const model = config.anthropic_model || "claude-3-5-haiku-20241022";
  const system = config.commercial_ai_prompt || "Actúa como director comercial experto en venta automotriz y financiación.";

  const context = {
    nombre: lead.nombre,
    telefono: lead.telefono || lead.whatsapp,
    ciudad: lead.ciudad,
    vehiculo: lead.vehiculo || lead.vehiculo_interes || lead.vehicle_name,
    estado: lead.estado || lead.status,
    prioridad: lead.prioridad,
    cuota_mensual: lead.cuota_mensual,
    cuota_inicial: lead.cuota_inicial || lead.valor_cuota_inicial,
    notas: lead.notas,
    seguimiento_fecha: lead.seguimiento_fecha || lead.next_follow_up_at,
    llamada_estado: lead.llamada_estado,
    resumen_llamada: lead.resumen_llamada,
  };

  if (!apiKey) {
    const advice = fallbackAdvice(lead);
    return NextResponse.json({
      ok: true,
      provider: "rules",
      advice,
      whatsapp: advice,
      summary: "IA Claude sin configurar. Usando motor comercial interno.",
    });
  }

  const prompt = `
Analiza este lead comercial de concesionario y responde SOLO en JSON válido.

Lead:
${JSON.stringify(context, null, 2)}

Necesito:
{
  "summary": "resumen corto del lead",
  "next_action": "siguiente acción concreta",
  "whatsapp": "mensaje WhatsApp listo para enviar",
  "priority": "baja|normal|alta|caliente",
  "risk": "riesgo comercial",
  "manager_note": "nota breve para gerente"
}
`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      temperature: 0.3,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const json = await r.json();

  if (!r.ok) {
    const advice = fallbackAdvice(lead);
    return NextResponse.json({
      ok: true,
      provider: "rules_fallback",
      advice,
      whatsapp: advice,
      summary: json?.error?.message || "Claude no respondió correctamente.",
    });
  }

  const text = json?.content?.[0]?.text || "";
  let parsed: any = null;

  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {
      summary: "Claude respondió sin JSON estructurado.",
      next_action: text,
      whatsapp: text,
      priority: lead.prioridad || "normal",
      risk: "sin clasificar",
      manager_note: "",
    };
  }

  await supabaseAdmin
    .from("landing_leads")
    .update({
      ai_summary: parsed.summary || null,
      ai_next_action: parsed.next_action || null,
      prioridad: parsed.priority || lead.prioridad || "normal",
      temperatura: parsed.priority === "caliente" ? "caliente" : lead.temperatura || "normal",
      ai_last_analysis_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("vendedor_id", vendedorId);

  return NextResponse.json({
    ok: true,
    provider: "claude",
    ...parsed,
  });
}
