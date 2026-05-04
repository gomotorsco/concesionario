"use client";

import { FormEvent, useState } from "react";

type Props = {
  vehicleTitle?: string;
};

export function VehicleLeadForm({ vehicleTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const payload = {
      nombre: String(form.get("nombre") || ""),
      telefono: String(form.get("telefono") || ""),
      email: String(form.get("email") || ""),
      ciudad: String(form.get("ciudad") || ""),
      vehicle: vehicleTitle || "",
      source: "vehicle_detail",
      message: `Consulta por vehículo: ${vehicleTitle || "No especificado"}`,
    };

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    setLoading(false);

    if (!res || !res.ok) {
      alert("No se pudo enviar la solicitud. Intente nuevamente.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-50 p-7 text-[#151515]">
        <h3 className="text-2xl font-black">Solicitud enviada</h3>
        <p className="mt-2 text-sm leading-6 text-[#6f675e]">
          Un asesor de GoMotorsCo se comunicará contigo para continuar la pre-aprobación.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[30px] border border-black/10 bg-[#fffdf8] p-7 text-[#151515] shadow-[0_20px_70px_rgba(21,21,21,.10)]"
    >
      <p className="text-xs font-black uppercase tracking-[0.28em] text-[#8a7760]">
        Asesoría personalizada
      </p>

      <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">
        Consultar este vehículo
      </h3>

      <p className="mt-3 text-sm leading-6 text-[#6f675e]">
        Déjanos tus datos y un asesor te contacta para revisar financiación, cuota inicial y opciones disponibles.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-[#514940]">Nombre</span>
          <input
            name="nombre"
            required
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black/40"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-[#514940]">WhatsApp</span>
          <input
            name="telefono"
            required
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black/40"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-[#514940]">Email opcional</span>
          <input
            name="email"
            type="email"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black/40"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-[#514940]">Ciudad</span>
          <input
            name="ciudad"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black/40"
          />
        </label>
      </div>

      <button
        disabled={loading}
        className="mt-6 w-full rounded-full bg-[#151515] px-6 py-4 text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Quiero que me contacten"}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-[#8a7760]">
        No es un compromiso. Es solo para ayudarte a encontrar la mejor opción.
      </p>
    </form>
  );
}
