"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function LeadForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [contactChannel, setContactChannel] = useState("");
  const [contactFrom, setContactFrom] = useState("");
  const [contactTo, setContactTo] = useState(""); // se mantiene para no romper el payload
  const [hasUsedCar, setHasUsedCar] = useState("");
  const [notes, setNotes] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const disabled = status === "loading" || status === "success";

  const buildPhone = () => {
    const code = phoneCode.trim();
    const num = phoneNumber.trim();
    if (code && num) return `(${code}) ${num}`;
    if (num) return num;
    if (code) return code;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);

    try {
      const body = {
        // columnas principales de public.leads
        full_name: fullName || null,
        email: email || null,
        phone: buildPhone(),
        province: province || null,
        city: city || null,
        notes: notes || null,
        // campos flexibles en extra_data
        extra_data: {
          canal_contacto: contactChannel || null,
          horario_desde: contactFrom || null, // ahora: mañana / tarde / noche
          horario_hasta: contactTo || null,
          tiene_auto_usado: hasUsedCar || null,
        },
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.message ||
          data?.error ||
          `No se pudo enviar el formulario (código ${res.status}).`;
        setStatus("error");
        setErrorMsg(msg);
        return;
      }

      // ÉXITO
      setStatus("success");

      // Limpiamos campos
      setFullName("");
      setEmail("");
      setPhoneCode("");
      setPhoneNumber("");
      setProvince("");
      setCity("");
      setContactChannel("");
      setContactFrom("");
      setContactTo("");
      setHasUsedCar("");
      setNotes("");

    if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "conversion", {
          send_to: "AW-17876395056/vsMTCPpGg-BYbELDlIMxC",
        });
      }
    } catch (err: any) {
      console.error("Error enviando lead:", err);
      setStatus("error");
      setErrorMsg("Ocurrió un error al enviar el formulario.");
    }
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre completo */}
      <div className="grid grid-cols-1 gap-2">
        <input
          type="text"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={disabled}
          required
          placeholder="Nombre y apellido"
        />
      </div>



      {/* Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-3">
        <div className="space-y-2">
          <input
            type="tel"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
            disabled={disabled}
            placeholder="Código de área (ej: 11)"
          />
        </div>
        <div className="space-y-2">
          <input
            type="tel"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={disabled}
            required
            placeholder="Teléfono / WhatsApp"
          />
        </div>
      </div>

      {/* Provincia y localidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            disabled={disabled}
            placeholder="Provincia"
          />
        </div>
        <div className="space-y-2">
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={disabled}
            placeholder="Localidad"
          />
        </div>
      </div>

      

    

      {/* Comentarios */}
      <div className="space-y-2">
        <textarea
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 min-h-[80px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={disabled}
          placeholder="Comentarios adicionales (opcional)"
        />
      </div>

      {/* Botón */}
      <button
        type="submit"
        disabled={disabled}
        className="w-full mt-2 rounded-full bg-sky-600 hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium py-2.5 transition-colors"
      >
        {status === "loading" ? "Enviando..." : "Enviar consulta"}
      </button>

      {/* Mensaje de éxito inline */}
      {status === "success" && (
        <p className="mt-2 text-sm text-emerald-600">
          ¡Listo! Ya recibimos tus datos; en breve te contactamos.
        </p>
      )}

      {/* Mensaje de error */}
      {status === "error" && errorMsg && (
        <p className="mt-2 text-sm text-red-500">{errorMsg}</p>
      )}
    </form>
  );
}
