"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Por ahora no llamamos a Supabase:
    // solo mostramos un mensaje y listo.
    setSent(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-50 px-4">
      <div className="w-full max-w-md bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h1 className="text-xl font-semibold">
          Recuperar acceso
        </h1>
        <p className="text-sm text-slate-300">
          Si necesitás recuperar tu acceso, ingresá tu email y el administrador
          del sistema podrá asistirte manualmente.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email de acceso
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="admin@gomotorsco.com.co"
            />
          </div>

          {sent && (
            <p className="text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/60 rounded-lg px-3 py-2">
              Gracias. Registramos tu solicitud. Contactá al administrador para
              completar el proceso.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white py-2.5 transition"
          >
            Enviar solicitud
          </button>
        </form>
      </div>
    </main>
  );
}
