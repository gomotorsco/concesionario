"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Lead = {
  id: number;
  nombre: string;
  email: string;
  telefono_numero: string;
  created_at: string;
  seguimiento: string | null;
  visto: boolean | null;
  estado?: string | null;
  [key: string]: any;
};

type Metrics = {
  recent: Lead[];
};

function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="text-3xl font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function humanLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminLeadsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [seguimientoDraft, setSeguimientoDraft] = useState("");
  const [editingSeguimiento, setEditingSeguimiento] = useState(false);
  const [savingSeguimiento, setSavingSeguimiento] = useState(false);

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
      const data = (await r.json()) as any;

      setMetrics({
        recent: data.recent ?? [],
      });
    } catch (e) {
      console.error("Error cargando leads:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const leads = metrics?.recent ?? [];

  const isFrenado = (l: Lead) => (l.estado ?? "") === "frenado";
  const hasSeguimiento = (l: Lead) => (l.seguimiento ?? "").toString().trim() !== "";
  const isVisto = (l: Lead) => !!l.visto;

  const nuevos = useMemo(
    () => leads.filter((l) => !isFrenado(l) && !isVisto(l) && !hasSeguimiento(l)),
    [leads]
  );

  const enSeguimiento = useMemo(
    () => leads.filter((l) => !isFrenado(l) && hasSeguimiento(l)),
    [leads]
  );

  const leidos = useMemo(
    () => leads.filter((l) => !isFrenado(l) && isVisto(l) && !hasSeguimiento(l)),
    [leads]
  );

  const frenados = useMemo(() => leads.filter((l) => isFrenado(l)), [leads]);

  async function markLeadAsSeen(id: number) {
    try {
      await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "update_lead", id, visto: true }),
      });

      setMetrics((prev) =>
        prev
          ? { ...prev, recent: prev.recent.map((l) => (l.id === id ? { ...l, visto: true } : l)) }
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
        setStatusError("No se pudo guardar el seguimiento.");
        return;
      }

      const json = await res.json();
      const updated: Lead = json.lead;

      setMetrics((prev) =>
        prev ? { ...prev, recent: prev.recent.map((l) => (l.id === updated.id ? updated : l)) } : prev
      );
      setSelectedLead(updated);
      setEditingSeguimiento(false);
      setStatusMessage("Seguimiento guardado correctamente.");
    } catch (err) {
      console.error("Error update_lead seguimiento:", err);
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
        setStatusError("No se pudieron guardar los datos del lead.");
        return;
      }

      const json = await res.json();
      const updated: Lead = json.lead;

      setMetrics((prev) =>
        prev ? { ...prev, recent: prev.recent.map((l) => (l.id === updated.id ? updated : l)) } : prev
      );
      setSelectedLead(updated);
      setEditMode(false);
      setStatusMessage("Datos del lead guardados correctamente.");
    } catch (err) {
      console.error("Error update_lead datos:", err);
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
        setStatusError("No se pudo marcar el dato como frenado.");
        return;
      }

      const json = await res.json();
      const updated: Lead = json.lead;

      setMetrics((prev) =>
        prev ? { ...prev, recent: prev.recent.map((l) => (l.id === updated.id ? updated : l)) } : prev
      );
      setSelectedLead(updated);
      setStatusMessage("Dato marcado como frenado.");
    } catch (err) {
      console.error("Error marcando frenado:", err);
      setStatusError("Ocurrió un error al marcar el dato como frenado.");
    }
  }

  async function handleDeleteLead() {
    if (!selectedLead) return;

    const ok = window.confirm("¿Seguro que querés borrar este lead? Esta acción no se puede deshacer.");
    if (!ok) return;

    setStatusError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "delete_lead", id: selectedLead.id }),
      });

      if (!res.ok) {
        setStatusError("No se pudo borrar el lead.");
        return;
      }

      setMetrics((prev) =>
        prev ? { ...prev, recent: prev.recent.filter((l) => l.id !== selectedLead.id) } : prev
      );
      setSelectedLead(null);
      setSeguimientoDraft("");
      setEditMode(false);
      setEditingSeguimiento(false);
      setStatusMessage("Lead borrado correctamente.");
    } catch (err) {
      console.error("Error delete_lead:", err);
      setStatusError("Ocurrió un error al borrar el lead.");
    }
  }

  if (loading && !metrics) return <p className="text-slate-400">Cargando…</p>;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Nuevos" value={nuevos.length} />
        <Card title="En seguimiento" value={enSeguimiento.length} />
        <Card title="Leídos" value={leidos.length} />
        <Card title="Frenados" value={frenados.length} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListBox title={`Nuevos (${nuevos.length})`} tone="new">
          <LeadList leads={nuevos} selectedId={selectedLead?.id ?? null} onSelect={handleSelectLead} />
        </ListBox>

        <ListBox title={`En seguimiento (${enSeguimiento.length})`} tone="followup">
          <LeadList leads={enSeguimiento} selectedId={selectedLead?.id ?? null} onSelect={handleSelectLead} />
        </ListBox>

        <ListBox title={`Leídos (${leidos.length})`} tone="read">
          <LeadList leads={leidos} selectedId={selectedLead?.id ?? null} onSelect={handleSelectLead} />
        </ListBox>

        <ListBox title={`Frenados (${frenados.length})`} tone="blocked">
          <LeadList leads={frenados} selectedId={selectedLead?.id ?? null} onSelect={handleSelectLead} />
        </ListBox>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-3">Detalle / Gestión</h2>

        <div className="bg-slate-950/60 rounded-xl p-4 text-sm">
          {!selectedLead ? (
            <p className="text-slate-400">
              Seleccioná un lead de cualquiera de las listas para ver todos los datos y gestionarlo.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-300">Lead</p>
                  <p className="text-sm text-slate-100">{selectedLead.nombre}</p>
                  <p className="text-xs text-slate-400">
                    {selectedLead.email} — {selectedLead.telefono_numero}
                  </p>
                  {selectedLead.created_at ? (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Recibido el{" "}
                      {new Date(selectedLead.created_at).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  ) : null}
                  {selectedLead.estado ? (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Estado: <span className="uppercase">{selectedLead.estado}</span>
                    </p>
                  ) : null}
                </div>

                <div className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2">
                  <p className="text-[11px] font-semibold text-slate-300 mb-1">Datos del formulario</p>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {Object.entries(selectedLead as Record<string, any>)
                      .filter(([key, value]) => {
                        if (value === null || value === undefined || value === "") return false;
                        if (["id", "created_at", "seguimiento", "visto", "telefono_numero", "estado"].includes(key))
                          return false;
                        if (typeof value === "object") return true; // mostramos objetos abajo
                        return true;
                      })
                      .map(([key, value]) => (
                        <div key={key} className="text-[11px]">
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-400">{humanLabel(key)}</span>
                          </div>
                          {typeof value === "object" ? (
                            <pre className="mt-1 text-[10px] text-slate-100 bg-slate-950/60 border border-slate-800 rounded-md p-2 overflow-auto">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : (
                            <p className="text-slate-100">{String(value)}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
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

                {editMode ? (
                  <form
                    onSubmit={handleSaveDatos}
                    className="space-y-2 rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2"
                  >
                    <p className="text-[11px] font-semibold text-slate-300 mb-1">Editar datos principales</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Nombre</label>
                        <input
                          type="text"
                          value={editNombre}
                          onChange={(e) => setEditNombre(e.target.value)}
                          className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Email</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Teléfono</label>
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
                ) : null}

                <div className="space-y-2">
                  {!editingSeguimiento ? (
                    <div className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2 min-h-[52px]">
                      <p className="text-[11px] font-semibold text-slate-300 mb-1">Seguimiento</p>
                      {selectedLead.seguimiento && selectedLead.seguimiento.trim() !== "" ? (
                        <p className="text-xs text-slate-100 whitespace-pre-line">{selectedLead.seguimiento}</p>
                      ) : (
                        <p className="text-[11px] text-slate-500">Sin notas de seguimiento todavía.</p>
                      )}
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSaveSeguimiento}
                      className="space-y-2 rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2"
                    >
                      <p className="text-[11px] font-semibold text-slate-300 mb-1">Editar seguimiento</p>
                      <textarea
                        value={seguimientoDraft}
                        onChange={(e) => setSeguimientoDraft(e.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-2 text-xs text-slate-50 min-h-[90px]"
                        placeholder="Escribí aquí el seguimiento (llamadas, WhatsApp, estado, etc.)"
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

                  {statusMessage ? <p className="text-[11px] text-emerald-400">{statusMessage}</p> : null}
                  {statusError ? <p className="text-[11px] text-red-400">{statusError}</p> : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ListBox({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "new" | "followup" | "read" | "blocked";
  children: React.ReactNode;
}) {
  const border =
    tone === "new"
      ? "border-emerald-500/40"
      : tone === "followup"
      ? "border-sky-500/40"
      : tone === "blocked"
      ? "border-amber-500/40"
      : "border-slate-800";

  return (
    <div className={`rounded-xl border ${border} bg-slate-950/60 p-4`}>
      <p className="text-sm font-semibold text-slate-100 mb-3">{title}</p>
      {children}
    </div>
  );
}

function LeadList({
  leads,
  selectedId,
  onSelect,
}: {
  leads: Lead[];
  selectedId: number | null;
  onSelect: (lead: Lead) => void;
}) {
  if (!leads || leads.length === 0) {
    return <p className="text-xs text-slate-400">Sin datos.</p>;
  }

  return (
    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
      {leads.map((l) => {
        const isSelected = selectedId === l.id;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onSelect(l)}
            className={`w-full text-left rounded-lg border px-3 py-2 transition ${
              isSelected
                ? "border-sky-500 bg-slate-900"
                : "border-slate-800 bg-slate-950/60 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-semibold text-slate-100">{l.nombre}</p>
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
  );
}
