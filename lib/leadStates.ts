export const LEAD_STATES = {
  NUEVO: "nuevo",
  CONTACTADO: "contactado",
  INTERESADO: "interesado",
  DOCUMENTOS_ENVIADOS: "documentos_enviados",
  APROBADO: "aprobado",
  VENDIDO: "vendido",
  PERDIDO: "perdido",
} as const;

export const HUMAN_LEAD_STATES = [
  LEAD_STATES.NUEVO,
  LEAD_STATES.CONTACTADO,
  LEAD_STATES.INTERESADO,
  LEAD_STATES.DOCUMENTOS_ENVIADOS,
  LEAD_STATES.APROBADO,
  LEAD_STATES.VENDIDO,
  LEAD_STATES.PERDIDO,
] as const;

export const LEAD_STATE_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  interesado: "Interesado",
  documentos_enviados: "Documentos enviados",
  aprobado: "Aprobado",
  vendido: "Vendido",
  perdido: "Perdido",
};

export function normalizeLeadState(value?: string | null) {
  const state = String(value || "nuevo").trim().toLowerCase();

  if (state === "seguimiento" || state === "en_seguimiento" || state === "seguimiento_atrasado" || state === "contacto") {
    return LEAD_STATES.CONTACTADO;
  }

  if (state === "negociacion") return LEAD_STATES.INTERESADO;

  if (state === "documentos" || state === "documentos_enviados" || state === "documentos enviados") {
    return LEAD_STATES.DOCUMENTOS_ENVIADOS;
  }

  if (state === "pausado" || state === "eliminado") return LEAD_STATES.PERDIDO;

  if (HUMAN_LEAD_STATES.includes(state as any)) return state;

  return LEAD_STATES.NUEVO;
}

export function isFollowUpState(value?: string | null) {
  const state = normalizeLeadState(value);
  return [
    LEAD_STATES.CONTACTADO,
    LEAD_STATES.INTERESADO,
    LEAD_STATES.DOCUMENTOS_ENVIADOS,
    LEAD_STATES.APROBADO,
  ].includes(state as any);
}
