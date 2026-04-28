"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const data = await res.json();
          detail = data?.error || JSON.stringify(data);
        } catch {
          detail = await res.text();
        }

        setErrorMsg(
          `Error al iniciar sesión (${res.status}): ${
            detail || "credenciales inválidas"
          }`
        );
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("LOGIN API OK:", data);
      router.push("/admin");
    } catch (err: any) {
      console.error("Error login (catch):", err);
      setErrorMsg(
        `Error de red llamando al servidor: ${
          err?.message || "No se pudo conectar."
        }`
      );
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f1eb] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.18)] p-6 md:p-8">
        <div className="mb-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2">
            Panel interior
          </p>
          <h1 className="text-xl font-semibold text-slate-900">
            Iniciar sesión
          </h1>
          <p className="text-[13px] text-slate-600 mt-1">
            Acceso exclusivo para concesionarios y administradores.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              placeholder="admin@gomotorsco.com.co"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              placeholder="••••••••"
            />
          </div>

          {errorMsg && (
            <p className="text-[12px] text-red-600">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-sky-700 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-sky-600 transition disabled:opacity-70"
          >
            {loading ? "Ingresando..." : "Para entrar"}
          </button>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              Si no tenés usuario, solicitá acceso al administrador.
            </p>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-sky-700 hover:text-sky-600"
            >
              Olvidé mi contraseña
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
