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

type DashboardResponse = {
  recent: Lead[];
};

type Tab = "nuevos" | "seguimiento" | "todos";

export default function LeadsPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>("nuevos");
  const [selected, setSelected] = useState<Lead | null>(null);

  // Seguimiento
  const [editingSeguimiento, setEditingSeguimiento] = useState(false);
  const [seguimientoDraft, setSeguimientoDraft] = useState("");
  const [savingSeguimiento, setSavingSeguimiento] = useState(false);

  // Edit datos
  const [editMode, setEditMode] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [savingDatos, setSavingDatos] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      // Reutilizamos tu API existente del dashboard (que ya trae leads)
      const r = await fetch("/api/dashboard", { cache: "no-store" });
      const j = (await r.json()) as any;
      setData({ recent: j.recent ?? [] });
    } catch (e) {
      console.error("Error cargando leads:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 12000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const arr = data?.recent ?? [];
    if (tab === "nuevos") return arr.filter((l) => !l.visto);
    if (tab === "seguimiento")
      return arr.filter((l) => (l.seguimiento ?? "").toString().trim() !== "");
    return arr;
  }, [data, tab]);

  async function markLeadAsSeen(id: number) {
    try {
      await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "update_lead", id, visto: true }),
      });

      setData((prev) =>
        prev
          ? { ...prev, recent: prev.recent.map((l) => (l.id === id ? { ...l, visto: true } : l)) }
          : prev
      );
    } catch (e) {
      console.error("Error marcando lead visto:", e);
    }
  }

  function handleSelect(lead: Lead) {
    setSelected(lead);
    setStatusError(null);
    setStatusMessage(null);

    setEditingSeguimiento(false);
    setSeguimientoDraft(lead.seguimiento ?? "");

    setEditMode(false);
    setEditNombre(lead.nombre ?? "");
    setEditEmail(lead.email ?? "");
    setEditTelefono(lead.telefono_numero ?? "");

    if (!lead.visto) {
      markLeadAsSeen(lead.id);
      setSelected({ ...lead, visto: true });
    }
  }

  async function handleSaveSeguimiento(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;

    setSavingSeguimiento(true);
    setStatusError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "update_lead",
          id: selected.id,
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

      setData((prev) =>
        prev ? { ...prev, recent: prev.recent.map((l) => (l.id === updated.id ? updated : l)) } : prev
      );
      setSelected(updated);
      setEditingSeguimiento(false);
      setStatusMessage("Seguimiento guardado.");
    } catch (err) {
      console.error(err);
      setStatusError("Ocurrió un error al guardar el seguimiento.");
    } finally {
      setSavingSeguimiento(false);
    }
  }

  async function handleSaveDatos(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;

    setSavingDatos(true);
    setStatusError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "update_lead",
          id: selected.id,
          nombre: editNombre,
          email: editEmail,
          telefono: editTelefono,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Error guardando datos:", res.status, text);
        setStatusError("No se pudieron guardar los datos.");
        return;
      }

      const json = await res.json();
      const updated: Lead = json.lead;

      setData((prev) =>
        prev ? { ...prev, recent: prev.recent.map((l) => (l.id === updated.id ? updated : l)) } : prev
      );
      setSelected(updated);
      setEditMode(false);
      setStatusMessage("Datos guardados.");
    } catch (err) {
      console.error(err);
      setStatusError("Ocurrió un error al guardar los datos.");
    } finally {
      setSavingDatos(false);
    }
  }

  async function handleMarkFrenado() {
    if (!selected) return;

    setStatusError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "update_lead", id: selected.id, estado: "frenado", visto: true }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Error marcando frenado:", res.status, text);
        setStatusError("No se pudo marcar como frenado.");
        return;
      }

      const json = await res.json();
      const updated: Lead = json.lead;

      setData((prev) =>
        prev ? { ...prev, recent: prev.recent.map((l) => (l.id === updated.id ? updated : l)) } : prev
      );
      setSelected(updated);
      setStatusMessage("Dato marcado como frenado.");
    } catch (err) {
      console.error(err);
      setStatusError("Ocurrió un error.");
    }
  }

  async function handleDeleteLead() {
    if (!selected) return;

    const ok = window.confirm("¿Seguro que querés borrar este lead? No se puede deshacer.");
    if (!ok) return;

    setStatusError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "delete_lead", id: selected.id }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Error borrando:", res.status, text);
        setStatusError("No se pudo borrar el lead.");
        return;
      }

      setData((prev) =>
        prev ? { ...prev, recent: prev.recent.filter((l) => l.id !== selected.id) } : prev
      );
      setSelected(null);
      setStatusMessage("Lead borrado.");
    } catch (err) {
      console.error(err);
      setStatusError("Ocurrió un error.");
    }
  }

  const nuevosCount = useMemo(() => (data?.recent ?? []).filter((l) => !l.visto).length, [data]);
  const segCount = useMemo(
    () => (data?.recent ?? []).filter((l) => (l.seguimiento ?? "").toString().trim() !== "").length,
    [data]
  );
  const totalCount = useMemo(() => (data?.recent ?? []).length, [data]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Leads</h1>
          <p className="text-xs text-slate-400">Nuevos / Seguimiento / Todos</p>
        </div>

        <div className="flex items-center gap-2">
          <TabButton active={tab === "nuevos"} onClick={() => setTab("nuevos")} label={`Nuevos (${nuevosCount})`} />
          <TabButton
            active={tab === "seguimiento"}
            onClick={() => setTab("seguimiento")}
            label={`Seguimiento (${segCount})`}
          />
          <TabButton active={tab === "todos"} onClick={() => setTab("todos")} label={`Todos (${totalCount})`} />
        </div>
      </div>

      <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
        {loading && !data ? <p className="text-slate-400">Cargando…</p> : null}

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)]">
          {/* LISTA */}
          <div className="space-y-2 max-h-[72vh] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="text-slate-400 text-sm">No hay leads para este filtro.</p>
            ) : (
              filtered.map((l) => {
                const isSelected = selected?.id === l.id;
                const isNew = !l.visto;
                const isFrenado = (l.estado ?? "") === "frenado";
                const hasSeguimiento = (l.seguimiento ?? "").trim() !== "";

                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleSelect(l)}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                      isSelected
                        ? "border-sky-500 bg-slate-900"
                        : isFrenado
                        ? "border-amber-500/70 bg-amber-900/20"
                        : isNew
                        ? "border-emerald-500/70 bg-emerald-900/20"
                        : hasSeguimiento
                        ? "border-indigo-500/60 bg-indigo-900/15"
                        : "border-slate-800 bg-slate-950/50 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-semibold text-slate-100 flex items-center gap-2">
                          {l.nombre}
                          {isNew && !isFrenado ? (
                            <span className="text-[10px] font-semibold text-emerald-400">Nuevo</span>
                          ) : null}
                          {hasSeguimiento ? (
                            <span className="text-[10px] font-semibold text-indigo-300">Seguimiento</span>
                          ) : null}
                          {isFrenado ? (
                            <span className="text-[10px] font-semibold text-amber-300">Frenado</span>
                          ) : null}
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
              })
            )}
          </div>

          {/* DETALLE */}
          <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
            {!selected ? (
              <p className="text-xs text-slate-400">Seleccioná un lead para ver el detalle.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-300">Detalle</p>
                  <p className="text-sm text-slate-100">{selected.nombre}</p>
                  <p className="text-xs text-slate-400">
                    {selected.email} — {selected.telefono_numero}
                  </p>
                  {selected.created_at ? (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Recibido:{" "}
                      {new Date(selected.created_at).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  ) : null}
                </div>

                {/* ACCIONES */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode((p) => !p)}
                    className="px-3 py-1.5 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-50"
                  >
                    {editMode ? "Cerrar edición" : "Editar datos"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingSeguimiento((p) => !p)}
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

                {/* EDICION DATOS */}
                {editMode ? (
                  <form onSubmit={handleSaveDatos} className="space-y-2 rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2">
                    <p className="text-[11px] font-semibold text-slate-300">Editar datos</p>

                    <Field label="Nombre">
                      <input
                        className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                      />
                    </Field>

                    <Field label="Email">
                      <input
                        type="email"
                        className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    </Field>

                    <Field label="Teléfono">
                      <input
                        className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-50"
                        value={editTelefono}
                        onChange={(e) => setEditTelefono(e.target.value)}
                      />
                    </Field>

                    <button
                      type="submit"
                      disabled={savingDatos}
                      className="mt-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-[11px] font-medium text-white disabled:opacity-60"
                    >
                      {savingDatos ? "Guardando…" : "Guardar datos"}
                    </button>
                  </form>
                ) : null}

                {/* SEGUIMIENTO */}
                {!editingSeguimiento ? (
                  <div className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2 min-h-[60px]">
                    <p className="text-[11px] font-semibold text-slate-300 mb-1">Seguimiento</p>
                    {selected.seguimiento?.trim() ? (
                      <p className="text-xs text-slate-100 whitespace-pre-line">{selected.seguimiento}</p>
                    ) : (
                      <p className="text-[11px] text-slate-500">Sin notas todavía.</p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSaveSeguimiento} className="space-y-2 rounded-md border border-slate-800 bg-slate-950/60 px-2 py-2">
                    <p className="text-[11px] font-semibold text-slate-300">Editar seguimiento</p>
                    <textarea
                      value={seguimientoDraft}
                      onChange={(e) => setSeguimientoDraft(e.target.value)}
                      className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-2 text-xs text-slate-50 min-h-[90px]"
                      placeholder="Notas de llamadas, WhatsApp, estado, etc."
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={savingSeguimiento}
                        className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-[11px] font-medium text-white disabled:opacity-60"
                      >
                        {savingSeguimiento ? "Guardando…" : "Guardar"}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-xs ${
        active ? "border-emerald-500 bg-emerald-500/15 text-slate-50" : "border-slate-700 bg-slate-950/40 text-slate-200 hover:bg-slate-900"
      }`}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-slate-400 mb-0.5">{label}</label>
      {children}
    </div>
  );
}
