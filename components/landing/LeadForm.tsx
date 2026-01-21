"use client";

import { useState } from "react";
import { trackGtag, trackInternal } from "@/lib/track";

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
  const [contactTo, setContactTo] = useState("");
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

  const readSelectedVehicleCtx = () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem("selected_vehicle_ctx");
      if (!raw) return null;
      return JSON.parse(raw) as any;
    } catch {
      return null;
    }
  };

  const readAttribution = () => {
    if (typeof window === "undefined") return {};
    const url = new URL(window.location.href);
    const sp = url.searchParams;
    return {
      utm_source: sp.get("utm_source"),
      utm_medium: sp.get("utm_medium"),
      utm_campaign: sp.get("utm_campaign"),
      utm_term: sp.get("utm_term"),
      utm_content: sp.get("utm_content"),
      gclid: sp.get("gclid"),
      referrer: document.referrer || null,
      landing_path: window.location.pathname,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);

    const vehicleCtx = readSelectedVehicleCtx();
    const attribution = readAttribution();

    try {
      const body = {
        full_name: fullName || null,
        email: email || null,
        phone: buildPhone(),
        province: province || null,
        city: city || null,
        notes: notes || null,
        extra_data: {
          canal_contacto: contactChannel || null,
          horario_desde: contactFrom || null,
          horario_hasta: contactTo || null,
          tiene_auto_usado: hasUsedCar || null,

          // >>> CONTEXTO (auto + utms)
          selected_vehicle_id: vehicleCtx?.vehicle_id ?? null,
          selected_vehicle_name: vehicleCtx?.vehicle_name ?? null,
          selected_vehicle_origin: vehicleCtx?.origin ?? null,
          utm: attribution,
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

      // EVENTO INTERNO
      trackInternal({
        type: "lead_submit",
        origin: vehicleCtx?.origin ?? "form",
        vehicle_id: vehicleCtx?.vehicle_id ?? null,
        vehicle_name: vehicleCtx?.vehicle_name ?? null,
        meta: {
          ...attribution,
          has_email: Boolean(email),
          has_phone: Boolean(buildPhone()),
        },
      });

      // EVENTO GA/Ads (tu conversión)
      trackGtag("conversion", {
        send_to: "AW-17876395056/vsMTCPpGg-BYbELDlIMxC",
      });

      // Opcional: evento GA4 “lead_submit”
      trackGtag("lead_submit", {
        origin: vehicleCtx?.origin ?? "form",
        vehicle_id: vehicleCtx?.vehicle_id ?? null,
        vehicle_name: vehicleCtx?.vehicle_name ?? null,
      });

      // Limpiar campos
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
    } catch (err: any) {
      console.error("Error enviando lead:", err);
      setStatus("error");
      setErrorMsg("Ocurrió un error al enviar el formulario.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="space-y-2">
        <textarea
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 min-h-[80px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={disabled}
          placeholder="Comentarios adicionales (opcional)"
        />
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full mt-2 rounded-full bg-sky-600 hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium py-2.5 transition-colors"
      >
        {status === "loading" ? "Enviando..." : "Enviar consulta"}
      </button>

      {status === "success" && (
        <p className="mt-2 text-sm text-emerald-600">
          ¡Listo! Ya recibimos tus datos; en breve te contactamos.
        </p>
      )}

      {status === "error" && errorMsg && (
        <p className="mt-2 text-sm text-red-500">{errorMsg}</p>
      )}
    </form>
  );
}
