"use client";

export const dynamic = "force-dynamic";

import { FormEvent, useState } from "react";

const initialForm = {
  nombre: "",
  whatsapp: "",
  ciudad: "",
  vehiculo_interes: "",
  tipo_ingreso: "",
  ingresos_mensuales: "",
  tiene_cuota_inicial: false,
  valor_cuota_inicial: "",
  entrega_vehiculo: false,
  entrega_marca: "",
  entrega_modelo: "",
  entrega_anio: "",
  entrega_km: "",
  entrega_estado: "",
  entrega_deuda: "",
  autorizacion_datos: false,
};

export default function PreaprobacionPage() {
  const [form, setForm] = useState<any>(initialForm);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  function setField(key: string, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk(false);

    if (!form.nombre || !form.whatsapp || !form.ciudad) {
      setError("Completá nombre, WhatsApp y ciudad.");
      return;
    }

    if (!form.autorizacion_datos) {
      setError("Debés aceptar la autorización de tratamiento de datos.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/preaprobacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok || !json.ok) {
      setError(json.message || "No se pudo enviar la solicitud.");
      return;
    }

    setOk(true);
    setForm(initialForm);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
            Evaluación inicial
          </p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">
            Solicitá tu preaprobación para vehículo
          </h1>
          <p className="mt-4 text-sm text-zinc-400 md:text-base">
            Dejanos tus datos básicos y un asesor comercial revisará tu perfil inicial.
            No pedimos documentos en esta primera etapa.
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-6 rounded-2xl border border-white/10 bg-zinc-950 p-5 md:p-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">Datos principales</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Nombre completo" value={form.nombre} onChange={(v) => setField("nombre", v)} />
              <Input label="WhatsApp" value={form.whatsapp} onChange={(v) => setField("whatsapp", v)} />
              <Input label="Ciudad" value={form.ciudad} onChange={(v) => setField("ciudad", v)} />
              <Input label="Vehículo de interés" value={form.vehiculo_interes} onChange={(v) => setField("vehiculo_interes", v)} placeholder="Ej: Chevrolet Onix, moto Yamaha..." />

              <div>
                <label className="mb-1 block text-xs text-zinc-400">Tipo de ingreso</label>
                <select
                  value={form.tipo_ingreso}
                  onChange={(e) => setField("tipo_ingreso", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar</option>
                  <option value="empleado">Empleado</option>
                  <option value="independiente">Independiente</option>
                  <option value="pensionado">Pensionado</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <Input label="Ingresos mensuales aproximados" type="number" value={form.ingresos_mensuales} onChange={(v) => setField("ingresos_mensuales", v)} />
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-black/50 p-4">
            <h2 className="mb-4 text-lg font-semibold">Cuota inicial</h2>

            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.tiene_cuota_inicial}
                onChange={(e) => setField("tiene_cuota_inicial", e.target.checked)}
              />
              Tengo cuota inicial
            </label>

            {form.tiene_cuota_inicial ? (
              <div className="mt-4 max-w-md">
                <Input
                  label="Valor aproximado de cuota inicial"
                  type="number"
                  value={form.valor_cuota_inicial}
                  onChange={(v) => setField("valor_cuota_inicial", v)}
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
            <h2 className="mb-2 text-lg font-semibold">Vehículo en parte de pago</h2>
            <p className="mb-4 text-sm text-zinc-400">
              Si tiene un vehículo para entregar, puede ayudar como parte de pago.
            </p>

            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.entrega_vehiculo}
                onChange={(e) => setField("entrega_vehiculo", e.target.checked)}
              />
              Tengo vehículo para entregar
            </label>

            {form.entrega_vehiculo ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input label="Marca" value={form.entrega_marca} onChange={(v) => setField("entrega_marca", v)} />
                <Input label="Modelo" value={form.entrega_modelo} onChange={(v) => setField("entrega_modelo", v)} />
                <Input label="Año" type="number" value={form.entrega_anio} onChange={(v) => setField("entrega_anio", v)} />
                <Input label="Kilometraje" type="number" value={form.entrega_km} onChange={(v) => setField("entrega_km", v)} />

                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Estado general</label>
                  <select
                    value={form.entrega_estado}
                    onChange={(e) => setField("entrega_estado", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar</option>
                    <option value="excelente">Excelente</option>
                    <option value="bueno">Bueno</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-400">¿Tiene deuda o prenda?</label>
                  <select
                    value={form.entrega_deuda}
                    onChange={(e) => setField("entrega_deuda", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar</option>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                    <option value="no_sabe">No sabe</option>
                  </select>
                </div>
              </div>
            ) : null}
          </section>

          <section>
            <label className="flex items-start gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={form.autorizacion_datos}
                onChange={(e) => setField("autorizacion_datos", e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Autorizo el tratamiento de mis datos para ser contactado por un asesor comercial.
                Esta solicitud es una evaluación inicial y no garantiza aprobación de crédito.
              </span>
            </label>
          </section>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {ok ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
              Solicitud enviada correctamente. Un asesor revisará tu información.
            </p>
          ) : null}

          <button
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Enviando solicitud..." : "Solicitar evaluación inicial"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-zinc-400">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm"
      />
    </div>
  );
}
