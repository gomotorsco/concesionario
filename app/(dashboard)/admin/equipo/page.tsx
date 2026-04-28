"use client";

import { FormEvent, useEffect, useState } from "react";

type Vendedor = {
  id: string;
  nombre: string;
  email: string;
  whatsapp?: string | null;
  zona?: string | null;
  rol?: string | null;
  fecha_ingreso?: string | null;
  meta_mensual?: number;
  meta_conversion?: number;
  meta_leads_trabajados?: number;
  activo?: boolean;
  notas?: string | null;
  last_login?: string | null;
  last_activity?: string | null;
};

const emptyForm = {
  nombre: "",
  email: "",
  password: "",
  whatsapp: "",
  zona: "",
  rol: "vendedor",
  fecha_ingreso: "",
  meta_mensual: "10",
  meta_conversion: "10",
  meta_leads_trabajados: "50",
  notas: "",
};

export default function EquipoPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [selected, setSelected] = useState<Vendedor | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/vendedores", { cache: "no-store" });
    const json = await res.json();
    setVendedores(json.vendedores ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function selectVendedor(v: Vendedor) {
    setSelected(v);
    setForm({
      nombre: v.nombre ?? "",
      email: v.email ?? "",
      password: "",
      whatsapp: v.whatsapp ?? "",
      zona: v.zona ?? "",
      rol: v.rol ?? "vendedor",
      fecha_ingreso: v.fecha_ingreso ?? "",
      meta_mensual: String(v.meta_mensual ?? 10),
      meta_conversion: String(v.meta_conversion ?? 10),
      meta_leads_trabajados: String(v.meta_leads_trabajados ?? 50),
      notas: v.notas ?? "",
    });
  }

  function resetForm() {
    setSelected(null);
    setForm(emptyForm);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      type: selected ? "update" : "create",
      id: selected?.id,
      ...form,
    };

    const res = await fetch("/api/vendedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      alert("No se pudo guardar el vendedor.");
      return;
    }

    await load();
    resetForm();
  }

  async function toggleActivo(v: Vendedor) {
    await fetch("/api/vendedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "update", id: v.id, activo: !v.activo }),
    });
    await load();
  }

  function setField(key: string, value: string) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-100">Gestión de equipo</h1>
        <p className="text-xs text-slate-400">
          Crear vendedores, configurar metas, zonas, roles y control operativo.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              {selected ? "Editar vendedor" : "Crear vendedor"}
            </h2>
            {selected ? (
              <button type="button" onClick={resetForm} className="text-xs text-slate-400 hover:text-white">
                Nuevo
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="Nombre completo" value={form.nombre} onChange={(v) => setField("nombre", v)} />
            <Input label="Email / usuario" value={form.email} onChange={(v) => setField("email", v)} />
            <Input label={selected ? "Nueva contraseña (opcional)" : "Contraseña inicial"} value={form.password} onChange={(v) => setField("password", v)} type="password" />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(v) => setField("whatsapp", v)} />
            <Input label="Zona / sede" value={form.zona} onChange={(v) => setField("zona", v)} />

            <div>
              <label className="mb-1 block text-xs text-slate-400">Rol</label>
              <select value={form.rol} onChange={(e) => setField("rol", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100">
                <option value="vendedor">Vendedor</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin_comercial">Admin comercial</option>
              </select>
            </div>

            <Input label="Fecha ingreso" value={form.fecha_ingreso} onChange={(v) => setField("fecha_ingreso", v)} type="date" />
            <Input label="Meta mensual ventas" value={form.meta_mensual} onChange={(v) => setField("meta_mensual", v)} type="number" />
            <Input label="Meta conversión mínima %" value={form.meta_conversion} onChange={(v) => setField("meta_conversion", v)} type="number" />
            <Input label="Meta leads trabajados" value={form.meta_leads_trabajados} onChange={(v) => setField("meta_leads_trabajados", v)} type="number" />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Notas internas</label>
            <textarea
              value={form.notas}
              onChange={(e) => setField("notas", e.target.value)}
              className="min-h-[100px] w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
              placeholder="Observaciones, perfil comercial, fortalezas, puntos a mejorar..."
            />
          </div>

          <button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Guardando..." : selected ? "Guardar cambios" : "Crear vendedor"}
          </button>
        </form>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">Vendedores registrados</h2>

          {vendedores.length === 0 ? (
            <p className="text-sm text-slate-400">No hay vendedores cargados.</p>
          ) : (
            <div className="space-y-3">
              {vendedores.map((v) => (
                <div key={v.id} className="rounded-lg border border-slate-800 bg-black/40 p-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-100">{v.nombre}</p>
                      <p className="text-xs text-slate-400">{v.email}</p>
                      <p className="text-xs text-slate-500">
                        {v.rol ?? "vendedor"} · {v.zona ?? "sin zona"} · meta {v.meta_mensual ?? 10}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Último login: {v.last_login ? new Date(v.last_login).toLocaleString("es-CO") : "sin registro"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Última actividad: {v.last_activity ? new Date(v.last_activity).toLocaleString("es-CO") : "sin registro"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => selectVendedor(v)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
                        Editar
                      </button>
                      <button
                        onClick={() => toggleActivo(v)}
                        className={`rounded-lg border px-3 py-1.5 text-xs ${
                          v.activo
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-slate-600 bg-slate-800 text-slate-300"
                        }`}
                      >
                        {v.activo ? "Activo" : "Inactivo"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-slate-100"
      />
    </div>
  );
}
