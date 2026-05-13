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
  vendedor_id?: string | null;
  vehicle_name?: string | null;
  [key: string]: any;
};

type Vendedor = {
  id: string;
  nombre: string;
  email: string;
  meta_mensual: number;
  activo: boolean;
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
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
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

  async function loadVendedores() {
    try {
      const r = await fetch("/api/vendedores", { cache: "no-store" });
      const data = await r.json();
      setVendedores(data.vendedores ?? []);
    } catch (e) {
      console.error("Error cargando vendedores:", e);
    }
  }

  useEffect(() => {
    load();
    loadVendedores();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const leads = metrics?.recent ?? [];

  const estadoOf = (l: Lead) => l.estado ?? "nuevo";
  const hasSeguimiento = (l: Lead) => (l.seguimiento ?? "").toString().trim() !== "";
  const isVisto = (l: Lead) => !!l.visto;

  const nuevos = useMemo(
    () => leads.filter((l) => estadoOf(l) === "nuevo" && !isVisto(l) && !hasSeguimiento(l)),
    [leads]
  );

  const enSeguimiento = useMemo(
    () => leads.filter((l) => estadoOf(l) === "en_seguimiento" || hasSeguimiento(l)),
    [leads]
  );

  const vendidos = useMemo(
    () => leads.filter((l) => estadoOf(l) === "vendido"),
    [leads]
  );

  const perdidos = useMemo(
    () => leads.filter((l) => estadoOf(l) === "perdido"),
    [leads]
  );

  const sinAsignar = useMemo(
    () => leads.filter((l) => !l.vendedor_id).length,
    [leads]
  );

  function vendedorNombre(id?: string | null) {
    if (!id) return "Sin asignar";
    return vendedores.find((v) => v.id === id)?.nombre ?? "Vendedor no encontrado";
  }

  async function updateLead(id: number, payload: Record<string, any>) {
    const res = await fetch("/api/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "update_lead", id, ...payload }),
    });

    if (!res.ok) {
      throw new Error("No se pudo actualizar el lead.");
    }

    const json = await res.json();
    const updated: Lead = json.lead;

    setMetrics((prev) =>
      prev ? { ...prev, recent: prev.recent.map((l) => (l.id === updated.id ? updated : l)) } : prev
    );

    setSelectedLead(updated);
    return updated;
  }

  async function markLeadAsSeen(id: number) {
    try {
      await updateLead(id, { visto: true });
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
      await updateLead(selectedLead.id, {
        seguimiento: seguimientoDraft,
        estado: "contactado",
        visto: true,
      });

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
      await updateLead(selectedLead.id, {
        nombre: editNombre,
        email: editEmail,
        telefono: editTelefono,
      });

      setEditMode(false);
      setStatusMessage("Datos del lead guardados correctamente.");
    } catch (err) {
      console.error("Error update_lead datos:", err);
      setStatusError("Ocurrió un error al guardar los datos del lead.");
    } finally {
      setSavingDatos(false);
    }
  }

  async function handleChangeEstado(estado: string) {
    if (!selectedLead) return;

    setStatusError(null);
    setStatusMessage(null);

    try {
      await updateLead(selectedLead.id, { estado, visto: true });
      setStatusMessage(`Estado cambiado a ${estado}.`);
    } catch (err) {
      console.error("Error cambiando estado:", err);
      setStatusError("No se pudo cambiar el estado.");
    }
  }

  async function handleAssignVendedor(vendedor_id: string) {
    if (!selectedLead) return;

    setStatusError(null);
    setStatusMessage(null);

    try {
      await updateLead(selectedLead.id, {
        vendedor_id: vendedor_id || null,
        visto: true,
      });
      setStatusMessage("Vendedor asignado correctamente.");
    } catch (err) {
      console.error("Error asignando vendedor:", err);
      setStatusError("No se pudo asignar el vendedor.");
    }
  }

  async function handleDeleteLead() {
    if (!selectedLead) return;

    const ok = window.confirm("¿Seguro que querés eliminar este lead del flujo comercial?");
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
        setStatusError("No se pudo eliminar el lead.");
        return;
      }

      setMetrics((prev) =>
        prev ? { ...prev, recent: prev.recent.filter((l) => l.id !== selectedLead.id) } : prev
      );
      setSelectedLead(null);
      setSeguimientoDraft("");
      setEditMode(false);
      setEditingSeguimiento(false);
      setStatusMessage("Lead eliminado del flujo comercial.");
    } catch (err) {
      console.error("Error delete_lead:", err);
      setStatusError("Ocurrió un error al eliminar el lead.");
    }
  }

  if (loading && !metrics) return <p className="text-slate-400">Cargando…</p>;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card title="Nuevos" value={nuevos.length} />
        <Card title="En seguimiento" value={enSeguimiento.length} />
        <Card title="Vendidos" value={vendidos.length} />
        <Card title="Perdidos" value={perdidos.length} />
        <Card title="Sin asignar" value={sinAsignar} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListBox title={`Nuevos (${nuevos.length})`} tone="new">
          <LeadList leads={nuevos} vendedores={vendedores} selectedId={selectedLead?.id ?? null} onSelect={handleSelectLead} />
        </ListBox>

        <ListBox title={`En seguimiento (${enSeguimiento.length})`} tone="followup">
          <LeadList leads={enSeguimiento} vendedores={vendedores} selectedId={selectedLead?.id ?? null} onSelect={handleSelectLead} />
        </ListBox>

        <ListBox title={`Vendidos (${vendidos.length})`} tone="sold">
          <LeadList leads={vendidos} vendedores={vendedores} selectedId={selectedLead?.id ?? null} onSelect={handleSelectLead} />
        </ListBox>

        <ListBox title={`Perdidos (${perdidos.length})`} tone="blocked">
          <LeadList leads={perdidos} vendedores={vendedores} selectedId={selectedLead?.id ?? null} onSelect={handleSelectLead} />
        </ListBox>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-3">Detalle / Gestión comercial</h2>

        <div className="bg-slate-950/60 rounded-xl p-4 text-sm">
          {!selectedLead ? (
            <p className="text-slate-400">
              Seleccioná un lead para asignarlo, gestionarlo y medirlo comercialmente.
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
                  {selectedLead.vehicle_name ? (
                    <p className="text-[11px] text-sky-300 mt-1">
                      Vehículo: {selectedLead.vehicle_name}
                    </p>
                  ) : null}
                  {selectedLead.created_at ? (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Recibido el{" "}
                      {new Date(selectedLead.created_at).toLocaleString("es-CO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  ) : null}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Estado: <span className="uppercase">{selectedLead.estado ?? "nuevo"}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Vendedor: <span className="text-slate-100">{vendedorNombre(selectedLead.vendedor_id)}</span>
                  </p>
                </div>

                <div className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2">
                  <p className="text-[11px] font-semibold text-slate-300 mb-1">Datos del formulario</p>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {Object.entries(selectedLead as Record<string, any>)
                      .filter(([key, value]) => {
                        if (value === null || value === undefined || value === "") return false;
                        if (
                          [
                            "id",
                            "created_at",
                            "updated_at",
                            "seguimiento",
                            "visto",
                            "telefono_numero",
                            "estado",
                            "vendedor_id",
                          ].includes(key)
                        )
                          return false;
                        return true;
                      })
                      .map(([key, value]) => (
                        <div key={key} className="text-[11px]">
                          <span className="text-slate-400">{humanLabel(key)}</span>
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
                <div className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2">
                  <p className="text-[11px] font-semibold text-slate-300 mb-1">Asignar vendedor</p>
                  <select
                    value={selectedLead.vendedor_id ?? ""}
                    onChange={(e) => handleAssignVendedor(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                  >
                    <option value="">Sin asignar</option>
                    {vendedores.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nombre} — Meta {v.meta_mensual}
                      </option>
                    ))}
                  </select>
                </div>

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
                    onClick={() => handleChangeEstado("en_seguimiento")}
                    className="px-3 py-1.5 rounded-md border border-sky-500/70 bg-sky-900/40 hover:bg-sky-800/70 text-[11px] font-medium text-sky-100"
                  >
                    En seguimiento
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChangeEstado("vendido")}
                    className="px-3 py-1.5 rounded-md border border-emerald-500/70 bg-emerald-900/40 hover:bg-emerald-800/70 text-[11px] font-medium text-emerald-100"
                  >
                    Vendido
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChangeEstado("perdido")}
                    className="px-3 py-1.5 rounded-md border border-amber-500/70 bg-amber-900/30 hover:bg-amber-800/60 text-[11px] font-medium text-amber-100"
                  >
                    Perdido
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteLead}
                    className="px-3 py-1.5 rounded-md border border-red-500/70 bg-red-900/40 hover:bg-red-800/70 text-[11px] font-medium text-red-100"
                  >
                    Eliminar
                  </button>
                </div>

                {editMode ? (
                  <form
                    onSubmit={handleSaveDatos}
                    className="space-y-2 rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2"
                  >
                    <p className="text-[11px] font-semibold text-slate-300 mb-1">Editar datos principales</p>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        placeholder="Nombre"
                        className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                      />
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                      />
                      <input
                        type="text"
                        value={editTelefono}
                        onChange={(e) => setEditTelefono(e.target.value)}
                        placeholder="Teléfono"
                        className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={savingDatos}
                      className="mt-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-[11px] font-medium text-white disabled:opacity-60"
                    >
                      {savingDatos ? "Guardando…" : "Guardar datos"}
                    </button>
                  </form>
                ) : null}

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
                      placeholder="Llamadas, WhatsApp, objeciones, próximo contacto..."
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={savingSeguimiento}
                        className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-[11px] font-medium text-white disabled:opacity-60"
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
  tone: "new" | "followup" | "sold" | "blocked";
  children: React.ReactNode;
}) {
  const border =
    tone === "new"
      ? "border-emerald-500/40"
      : tone === "followup"
      ? "border-sky-500/40"
      : tone === "sold"
      ? "border-emerald-700/60"
      : "border-amber-500/40";

  return (
    <div className={`rounded-xl border ${border} bg-slate-950/60 p-4`}>
      <p className="text-sm font-semibold text-slate-100 mb-3">{title}</p>
      {children}
    </div>
  );
}

function LeadList({
  leads,
  vendedores,
  selectedId,
  onSelect,
}: {
  leads: Lead[];
  vendedores: Vendedor[];
  selectedId: number | null;
  onSelect: (lead: Lead) => void;
}) {
  if (!leads || leads.length === 0) {
    return <p className="text-xs text-slate-400">Sin datos.</p>;
  }

  function vendedorNombre(id?: string | null) {
    if (!id) return "Sin asignar";
    return vendedores.find((v) => v.id === id)?.nombre ?? "No encontrado";
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
                <p className="text-[10px] text-sky-300 mt-1">
                  {vendedorNombre(l.vendedor_id)}
                </p>
              </div>
              <p className="text-[10px] text-slate-500 whitespace-nowrap">
                {l.created_at
                  ? new Date(l.created_at).toLocaleString("es-CO", {
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
