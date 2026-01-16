"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

type LeadFormProps = {
  compact?: boolean;
};

export default function LeadForm({ compact = false }: LeadFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [contactChannel, setContactChannel] = useState("");
  const [contactFrom, setContactFrom] = useState("");
  const [contactTo, setContactTo] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // Clase base para inputs / selects
  const inputClass = compact
    ? "w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
    : "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500";

  const labelClass = compact
    ? "text-[11px] font-medium text-slate-700"
    : "text-xs font-medium text-slate-700";

  const gridGap = compact ? "gap-2" : "gap-3";

  // … aquí mantenés toda tu lógica de submit, handlers, etc.
  // Sólo hay que asegurarse de usar inputClass/labelClass en los JSX.

  return (
    <form /* onSubmit={handleSubmit} etc... */ className={`flex flex-col ${gridGap}`}>
      {/* Ejemplo de fila */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridGap}`}>
        <div>
          <label className={labelClass}>Nombre y apellido</label>
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nombre y apellido"
          />
        </div>

        <div>
          <label className={labelClass}>Correo electrónico</label>
          <input
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
          />
        </div>
      </div>

      {/* Resto de campos usando siempre inputClass / labelClass */}
      {/* ... */}

      <button
        type="submit"
        className={
          compact
            ? "mt-2 w-full rounded-full bg-emerald-600 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
            : "mt-3 w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        }
      >
        Enviar consulta
      </button>
    </form>
  );
}
