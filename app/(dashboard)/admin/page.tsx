"use client";

import { FormEvent, useEffect, useState } from "react";

type Lead = {
  id: number;
  nombre: string;
  email: string;
  telefono_numero: string;
  created_at: string;
  seguimiento: string | null;
  visto: boolean | null;
  estado?: string | null;
  // Permitimos campos extra del formulario
  [key: string]: any;
};

type Metrics = {
  visits: number;
  leads: number;
  conversion: number;
  recent: Lead[];
};

type InternalMetrics = {
  range: string;
  since: string;
  totalEvents: number;
  totalsByType: Record<string, number>;
  totalsByOrigin: Record<string, number>;
  topVehicles: Array<{
    vehicle_id: number | null;
    vehicle_name: string | null;
    count: number;
  }>;
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [internal, setInternal] = useState<InternalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [seguimientoDraft, setSeguimientoDraft] = useState("");
  const [editingSeguimiento, setEditingSeguimiento] = useState(false);
  const [savingSeguimiento, setSavingSeguimiento] = useState(false);

  // Edición de datos principales
  const [editMode, setEditMode] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [savingDatos, setSavingDatos] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/dashboard", { cache: "no-store" });
      const data = (await r.json()) as Metrics;
      setMetrics({
        visits: data.visits ?? 0,
        leads: data.leads ?? 0,
        conversion: data.conversion ?? 0,
        recent: data.recent ?? [],
      });
    } catch (e) {
      console.error("Error cargando métricas:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadInternal(range: "7d" | "30d" = "7d") {
    try {
      const r = await fetch(`/api/admin/metrics?range=${range}`, {
        cache: "no-store",
      });

      if (!r.ok) {
        const text = await r.text().catch(() => "");
        console.error("Error cargando métricas internas:", r.status, text);
        return;
      }

      const data = (await r.json()) as InternalMetrics;
      setInternal({
        range: data.range ?? range,
        since: data.since ?? "",
        totalEvents: data.totalEvents ?? 0,
        totalsByType: data.totalsByType ?? {},
        totalsByOrigin: data.totalsByOrigin ?? {},
        topVehicles: data.topVehicles ?? [],
      });
    } catch (e) {
      console.error("Error cargando métricas internas:", e);
    }
  }

  useEffect(() => {
    load();
    loadInternal("7d");

    const id = setInterval(() => {
      load();
      loadInternal("7d");
    }, 8000);

    return () => clearInterval(id);
  }, []);

  async function markLeadAsSeen(id: number) {
    try {
      await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "update_lead", id, visto: true }),
      });

      setMetrics((prev) =>
        prev
          ? {
              ...prev,
              recent: prev.recent.map((l) =>
                l.id === id ? { ...l, visto: true } : l
              ),
            }
          : prev
      );
    } catch (e) {
      console.error("Error marcando lead como visto:", e);
    }
  }

  function handleSelectLead(lead: Lead) {
    setSelectedLead(lead);
    setSeguimientoDraft(lead.seguimiento ?? "");
    setEditingSeguimiento(false);
    setEditMode(false);
    setStatusError(null);
    setStatusMessage(null);

    setEditNombre(lead.nombre ?? "");
    setEditEmail(lead.email ?? "");
    setEditTelefono(lead.telefono_numero ?? "");

    if (!lead.visto) {
      markLeadAsSeen(lead.id);
      setMetrics((prev) =>
        prev
          ? {
              ...prev,
              recent: prev.recent.map((l) =>
                l.id === lead.id ? { ...l, visto: true } : l
              ),
            }
          : prev
      );
      setSelectedLead({ ...lead, visto: true });
    }
  }

  async function handleSaveSeguimiento(e: FormEvent) {
    e.preventDefault();
    if (!selectedLead) return;

    setSavingSeguimiento(true);
    setStatusError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "update_lead",
          id: selectedLead.id,
          seguimiento: seguimientoDraft,
          visto: true,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Error guardando seguimiento:", res.status, text);
        setStatusError("No se pudo guardar el seguimiento.");
        return;
      }

      const json = await res.json();
      const updated: Lead = json.lead;

      setMetrics((prev) =>
        prev
          ? {
              ...prev,
              recent: prev.recent.map((l) => (l.id === updated.id ? updated : l)),
            }
          : prev
      );
      setSelectedLead(updated);
      setEditingSeguimiento(false);
      setStatusMessage("Seguimiento guardado correctamente.");
    } catch (err) {
      console.error("Error llamando a /api/dashboard (update_lead):", err);
      setStatusError("Ocurrió un error al guardar el seguimiento.");
    } finally {
      setSavingSeguimiento(false);
    }
  }

  async function handleSaveDatos(e: FormEvent) {
    e.preventDefault();
    if (!selectedLead) return;

    setSavingDatos(true);
    setStatusError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "update_lead",
          id: selectedLead.id,
          nombre: editNombre,
          email: editEmail,
          telefono: editTelefono,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Error guardando datos del lead:", res.status, text);
        setStatusError("No se pudieron guardar los datos del lead.");
        return;
      }

      const json = await res.json();
      const updated: Lead = json.lead;

      setMetrics((prev) =>
        prev
          ? {
              ...prev,
              recent: prev.recent.map((l) => (l.id === updated.id ? updated : l)),
            }
          : prev
      );
      setSelectedLead(updated);
      setEditMode(false);
      setStatusMessage("Datos del lead guardados correctamente.");
    } catch (err) {
      console.error("Error llamando a /api/dashboard (update_lead datos):", err);
      setStatusError("Ocurrió un error al guardar los datos del lead.");
    } finally {
      setSavingDatos(false);
    }
  }

  async function handleMarkFrenado() {
    if (!selectedLead) return;

    setStatusError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "update_lead",
          id: selectedLead.id,
          estado: "frenado",
          visto: true,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Error marcando dato frenado:", res.status, text);
        setStatusError("No se pudo marcar el dato como frenado.");
        return;
      }

      const json = await res.json();
      const updated: Lead = json.lead;

      setMetrics((prev) =>
        prev
          ? {
              ...prev,
              recent: prev.recent.map((l) => (l.id === updated.id ? updated : l)),
            }
          : prev
      );
      setSelectedLead(updated);
      setStatusMessage("Dato marcado como frenado.");
    } catch (err) {
      console.error("Error llamando a /api/dashboard (dato frenado):", err);
      setStatusError("Ocurrió un error al marcar el dato como frenado.");
    }
  }

  async function handleDeleteLead() {
    if (!selectedLead) return;

    const ok = window.confirm(
      "¿Seguro que querés borrar este lead? Esta acción no se puede deshacer."
    );
    if (!ok) return;

    setStatusError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "delete_lead",
          id: selectedLead.id,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Error borrando lead:", res.status, text);
        setStatusError("No se pudo borrar el lead.");
        return;
      }

      setMetrics((prev) =>
        prev
          ? {
              ...prev,
              recent: prev.recent.filter((l) => l.id !== selectedLead.id),
            }
          : prev
      );
      setSelectedLead(null);
      setSeguimientoDraft("");
      setEditMode(false);
      setEditingSeguimiento(false);
      setStatusMessage("Lead borrado correctamente.");
    } catch (err) {
      console.error("Error llamando a /api/dashboard (delete_lead):", err);
      setStatusError("Ocurrió un error al borrar el lead.");
    }
  }

  if (loading && !metrics) {
    return <p className="text-slate-400">Cargando…</p>;
  }

  if (!metrics) {
    return (
      <p className="text-slate-400">
        No se pudieron cargar las métricas por el momento.
      </p>
    );
  }

  // NUEVAS TARJETAS: leads nuevos y en seguimiento
  const leadsNuevos = metrics.recent?.filter((l) => !l.visto)?.length ?? 0;
  const leadsEnSeguimiento =
    metrics.recent?.filter((l) => (l.seguimiento ?? "").toString().trim() !== "")
      ?.length ?? 0;

  const whatsappTotal = internal?.totalsByType?.["whatsapp_click"] ?? 0;
  const whatsappVehiculo = internal?.totalsByType?.["whatsapp_click_vehicle"] ?? 0;
  const modalOpen = internal?.totalsByType?.["entry_modal_open"] ?? 0;
  const leadSubmitEvent = internal?.totalsByType?.["lead_submit"] ?? 0;

  return (
    <div className="space-y-6">
      {/* TARJETAS DE LEADS (no más visitas / conversión inventada) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Leads nuevos" value={leadsNuevos} />
        <Card title="Leads en seguimiento" value={leadsEnSeguimiento} />
      </section>

      {/* MÉTRICAS INTERNAS (EVENTS) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          Métricas internas
        </h2>

        {!internal ? (
          <p className="text-slate-400 text-sm">Cargando métricas internas…</p>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card title="Clicks WhatsApp (total)" value={whatsappTotal} />
              <Card title="Clicks WhatsApp (vehículo)" value={whatsappVehiculo} />
              <Card title="Aperturas modal" value={modalOpen} />
              <Card title="Leads enviados (event)" value={leadSubmitEvent} />
            </section>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
              <p className="text-xs text-slate-400 mb-2">
                Rango: {internal.range} · Desde:{" "}
                {String(internal.since).slice(0, 10)} · Total eventos:{" "}
                {internal.totalEvents}
              </p>

              <h3 className="text-sm font-semibold text-slate-100 mb-2">
                Top vehículos por WhatsApp
              </h3>

              {internal.topVehicles.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  Todavía no hay clicks por vehículo.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-400">
                      <tr>
                        <th className="text-left py-2">Vehículo</th>
                        <th className="text-right py-2">Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {internal.topVehicles.map((v, idx) => (
                        <tr key={idx} className="border-t border-slate-800">
                          <td className="py-2 text-slate-100">
                            {v.vehicle_name || "Sin nombre"}
                          </td>
                          <td className="py-2 text-right text-slate-100 font-semibold">
                            {v.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* ULTIMOS LEADS */}
      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-3">
          Últimos leads
        </h2>

        <div className="bg-slate-950/60 rounded-xl p-4 text-sm">
          {(!metrics.recent || metrics.recent.length === 0) && (
            <p className="text-slate-400">Todavía no hay leads.</p>
          )}

          {metrics.recent && metrics.recent.length > 0 && (
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)]">
              {/* Lista de leads */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {metrics.recent.map((l) => {
                  const isSelected = selectedLead?.id === l.id;
                  const isNew = !l.visto;
                  const isFrenado = (l.estado ?? "") === "frenado";

                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => handleSelectLead(l)}
                      className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                        isSelected
                          ? "border-sky-500 bg-slate-900"
                          : isFrenado
                          ? "border-amber-500/70 bg-amber-900/20"
                          : isNew
                          ? "border-emerald-500/70 bg-emerald-900/20"
                          : "border-slate-800 bg-slate-950/60 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[13px] font-semibold text-slate-100 flex items-center gap-2">
                            {l.nombre}
                            {isNew && !isFrenado && (
                              <span className="text-[10px] font-semibold text-emerald-400">
                                Nuevo
                              </span>
                            )}
                            {isFrenado && (
                              <span className="text-[10px] font-semibold text-amber-300">
                                Frenado
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {l.email} — {l.telefono_numero}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-500 whitespace-nowrap">
                          {l.created_at
                            ? new Date(l.created_at).toLocaleString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detalle / acciones / seguimiento */}
              <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                {!selectedLead ? (
                  <p className="text-xs text-slate-400">
                    Seleccioná un lead de la lista para ver todos los datos y
                    gestionar el seguimiento.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {/* Encabezado */}
                    <div>
                      <p className="text-xs font-semibold text-slate-300">
                        Detalle del lead
                      </p>
                      <p className="text-sm text-slate-100">
                        {selectedLead.nombre}
                      </p>
                      <p className="text-xs text-slate-400">
                        {selectedLead.email} — {selectedLead.telefono_numero}
                      </p>
                      {selectedLead.created_at && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          Recibido el{" "}
                          {new Date(selectedLead.created_at).toLocaleString(
                            "es-AR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      )}
                      {selectedLead.estado && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Estado:{" "}
                          <span className="uppercase">{selectedLead.estado}</span>
                        </p>
                      )}
                    </div>

                    {/* DATOS COMPLETOS DEL FORMULARIO */}
                    <div className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2">
                      <p className="text-[11px] font-semibold text-slate-300 mb-1">
                        Datos del formulario
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                        {Object.entries(selectedLead as Record<string, any>)
                          .filter(([key, value]) => {
                            if (value === null || value === undefined || value === "")
                              return false;
                            // Campos que no mostramos aquí porque ya se ven arriba o son técnicos
                            if (
                              [
                                "id",
                                "created_at",
                                "seguimiento",
                                "visto",
                                "telefono_numero",
                                "estado",
                              ].includes(key)
                            )
                              return false;
                            if (typeof value === "object") return false;
                            return true;
                          })
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between gap-2 text-[11px]"
                            >
                              <span className="text-slate-400">
                                {humanLabel(key)}
                              </span>
                              <span className="text-slate-100 text-right">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditMode((prev) => !prev)}
                        className="px-3 py-1.5 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-50"
                      >
                        {editMode ? "Cerrar edición" : "Editar datos"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSeguimiento((prev) => !prev)}
                        className="px-3 py-1.5 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-50"
                      >
                        Seguimiento
                      </button>
                      <button
                        type="button"
                        onClick={handleMarkFrenado}
                        className="px-3 py-1.5 rounded-md border border-amber-500/70 bg-amber-900/30 hover:bg-amber-800/60 text-[11px] font-medium text-amber-100"
                      >
                        Dato frenado
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteLead}
                        className="px-3 py-1.5 rounded-md border border-red-500/70 bg-red-900/40 hover:bg-red-800/70 text-[11px] font-medium text-red-100"
                      >
                        Borrar
                      </button>
                    </div>

                    {/* EDICIÓN DE DATOS PRINCIPALES */}
                    {editMode && (
                      <form
                        onSubmit={handleSaveDatos}
                        className="space-y-2 rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2"
                      >
                        <p className="text-[11px] font-semibold text-slate-300 mb-1">
                          Editar datos principales
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">
                              Nombre
                            </label>
                            <input
                              type="text"
                              value={editNombre}
                              onChange={(e) => setEditNombre(e.target.value)}
                              className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">
                              Email
                            </label>
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">
                              Teléfono
                            </label>
                            <input
                              type="text"
                              value={editTelefono}
                              onChange={(e) => setEditTelefono(e.target.value)}
                              className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={savingDatos}
                          className="mt-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-[11px] font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {savingDatos ? "Guardando…" : "Guardar datos"}
                        </button>
                      </form>
                    )}

                    {/* SEGUIMIENTO */}
                    <div className="space-y-2">
                      {!editingSeguimiento && (
                        <div className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2 min-h-[52px]">
                          <p className="text-[11px] font-semibold text-slate-300 mb-1">
                            Seguimiento
                          </p>
                          {selectedLead.seguimiento &&
                          selectedLead.seguimiento.trim() !== "" ? (
                            <p className="text-xs text-slate-100 whitespace-pre-line">
                              {selectedLead.seguimiento}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              Sin notas de seguimiento todavía.
                            </p>
                          )}
                        </div>
                      )}

                      {editingSeguimiento && (
                        <form
                          onSubmit={handleSaveSeguimiento}
                          className="space-y-2 rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2"
                        >
                          <p className="text-[11px] font-semibold text-slate-300 mb-1">
                            Editar seguimiento
                          </p>
                          <textarea
                            value={seguimientoDraft}
                            onChange={(e) => setSeguimientoDraft(e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-2 text-xs text-slate-50 min-h-[80px]"
                            placeholder="Escribí aquí el seguimiento de este lead (llamadas, WhatsApp, estado, etc.)"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              disabled={savingSeguimiento}
                              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-[11px] font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {savingSeguimiento ? "Guardando…" : "Guardar seguimiento"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSeguimiento(false)}
                              className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-[11px] font-medium text-slate-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}

                      {statusMessage && (
                        <p className="text-[11px] text-emerald-400">{statusMessage}</p>
                      )}
                      {statusError && (
                        <p className="text-[11px] text-red-400">{statusError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="text-3xl font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function humanLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
