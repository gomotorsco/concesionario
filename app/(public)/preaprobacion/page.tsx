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
  consentimiento_datos: false,
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

    if (!form.consentimiento_datos) {
      setError("Debés aceptar la autorización de tratamiento de datos.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/preaprobacion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    <main className="min-h-screen bg-[#ece7df] text-[#151515]">
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#9b7b47]">
            Evaluación financiera
          </p>

          <h1 className="mt-4 text-4xl font-black leading-[0.95] md:text-6xl">
            Solicitá tu
            <br />
            preaprobación.
          </h1>

          <p className="mt-5 max-w-2xl text-sm text-[#6f675e] md:text-base">
            Completá tus datos y un asesor comercial revisará tu perfil
            inicial para ayudarte a encontrar la mejor financiación.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-6 rounded-[34px] border border-black/5 bg-white p-5 shadow-[0_20px_80px_rgba(0,0,0,0.06)] md:p-10"
        >
          <section>
            <h2 className="mb-5 text-xl font-black">
              Datos principales
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nombre completo"
                value={form.nombre}
                onChange={(v) => setField("nombre", v)}
              />

              <Input
                label="WhatsApp"
                value={form.whatsapp}
                onChange={(v) => setField("whatsapp", v)}
              />

              <Input
                label="Ciudad"
                value={form.ciudad}
                onChange={(v) => setField("ciudad", v)}
              />

              <Input
                label="Vehículo de interés"
                value={form.vehiculo_interes}
                onChange={(v) => setField("vehiculo_interes", v)}
                placeholder="Ej: Mazda CX5, Yamaha MT..."
              />

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#7b746c]">
                  Tipo de ingreso
                </label>

                <select
                  value={form.tipo_ingreso}
                  onChange={(e) => setField("tipo_ingreso", e.target.value)}
                  className="h-14 w-full rounded-2xl border border-black/10 bg-[#f7f3ee] px-4 text-sm outline-none transition focus:border-[#b08a52]"
                >
                  <option value="">Seleccionar</option>
                  <option value="empleado">Empleado</option>
                  <option value="independiente">Independiente</option>
                  <option value="pensionado">Pensionado</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <Input
                label="Ingresos mensuales aproximados"
                type="number"
                value={form.ingresos_mensuales}
                onChange={(v) => setField("ingresos_mensuales", v)}
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-black/5 bg-[#f7f3ee] p-6">
            <h2 className="mb-4 text-xl font-black">
              Cuota inicial
            </h2>

            <label className="flex items-center gap-3 text-sm font-medium text-[#4d4741]">
              <input
                type="checkbox"
                checked={form.tiene_cuota_inicial}
                onChange={(e) =>
                  setField("tiene_cuota_inicial", e.target.checked)
                }
              />
              Tengo cuota inicial
            </label>

            {form.tiene_cuota_inicial ? (
              <div className="mt-5 max-w-md">
                <Input
                  label="Valor aproximado"
                  type="number"
                  value={form.valor_cuota_inicial}
                  onChange={(v) => setField("valor_cuota_inicial", v)}
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-[28px] border border-[#d7c3a1] bg-[#fffaf1] p-6">
            <h2 className="mb-2 text-xl font-black">
              Vehículo en parte de pago
            </h2>

            <p className="mb-5 text-sm text-[#6f675e]">
              Podés entregar tu vehículo actual como parte de pago.
            </p>

            <label className="flex items-center gap-3 text-sm font-medium text-[#4d4741]">
              <input
                type="checkbox"
                checked={form.entrega_vehiculo}
                onChange={(e) =>
                  setField("entrega_vehiculo", e.target.checked)
                }
              />
              Tengo vehículo para entregar
            </label>

            {form.entrega_vehiculo ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Input
                  label="Marca"
                  value={form.entrega_marca}
                  onChange={(v) => setField("entrega_marca", v)}
                />

                <Input
                  label="Modelo"
                  value={form.entrega_modelo}
                  onChange={(v) => setField("entrega_modelo", v)}
                />

                <Input
                  label="Año"
                  type="number"
                  value={form.entrega_anio}
                  onChange={(v) => setField("entrega_anio", v)}
                />

                <Input
                  label="Kilometraje"
                  type="number"
                  value={form.entrega_km}
                  onChange={(v) => setField("entrega_km", v)}
                />
              </div>
            ) : null}
          </section>

          <section>
            <label className="flex items-start gap-3 text-sm text-[#6f675e]">
              <input
                type="checkbox"
                checked={form.consentimiento_datos}
                onChange={(e) =>
                  setField("consentimiento_datos", e.target.checked)
                }
                className="mt-1"
              />

              <span>
                Autorizo el tratamiento de mis datos para ser contactado
                por GoMotorsCo.
              </span>
            </label>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {ok ? (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
              Solicitud enviada correctamente.
            </div>
          ) : null}

          <button
            disabled={loading}
            className="h-14 rounded-full bg-[#151515] px-10 text-sm font-black text-white transition hover:scale-[1.02] disabled:opacity-60"
          >
            {loading
              ? "Enviando solicitud..."
              : "Solicitar evaluación"}
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
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#7b746c]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full rounded-2xl border border-black/10 bg-[#f7f3ee] px-4 text-sm outline-none transition focus:border-[#b08a52]"
      />
    </div>
  );
}
