"use client";

import { FormEvent, useState } from "react";

export function VehicleLeadForm({
  vehicleId,
  vehicleName,
}: {
  vehicleId: number;
  vehicleName: string;
}) {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    ciudad: "",
  });

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk(false);

    if (!form.nombre || !form.telefono) {
      setError("Completá nombre y WhatsApp.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/vehicle-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        vehicle_id: vehicleId,
        vehicle_name: vehicleName,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok || !json.ok) {
      setError(json.message || "No se pudo enviar la consulta.");
      return;
    }

    setOk(true);
    setForm({ nombre: "", telefono: "", email: "", ciudad: "" });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <h2 className="text-lg font-semibold text-white">Consultar este vehículo</h2>
      <p className="text-xs text-zinc-400">
        Dejanos tus datos y un asesor te contacta por este vehículo.
      </p>

      <Input label="Nombre" value={form.nombre} onChange={(v) => setField("nombre", v)} />
      <Input label="WhatsApp" value={form.telefono} onChange={(v) => setField("telefono", v)} />
      <Input label="Email opcional" value={form.email} onChange={(v) => setField("email", v)} />
      <Input label="Ciudad" value={form.ciudad} onChange={(v) => setField("ciudad", v)} />

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {ok ? <p className="text-sm text-emerald-300">Consulta enviada correctamente.</p> : null}

      <button disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Enviando..." : "Quiero que me contacten"}
      </button>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-zinc-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
      />
    </div>
  );
}
