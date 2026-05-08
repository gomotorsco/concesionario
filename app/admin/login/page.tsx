"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);

        setError(json?.message || "Credenciales inválidas.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 text-white">

      {/* Desktop background */}
      <div
        className="absolute inset-0 hidden md:block bg-cover bg-center"
        style={{
          backgroundImage: "url('/login-desktop.png')",
        }}
      />

      {/* Mobile background */}
      <div
        className="absolute inset-0 md:hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/login-mobile.png')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Blur lights */}
      <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-amber-400/20 blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-white/10 blur-3xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[34px] border border-white/15 bg-white/10 p-8 shadow-[0_30px_120px_rgba(0,0,0,.45)] backdrop-blur-2xl">

        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-amber-300">
            GoMotorsCo
          </p>

          <h1 className="mt-3 text-4xl font-black leading-none">
            Panel interno
          </h1>

          <p className="mt-3 text-sm text-white/70">
            Acceso administrativo premium de la concesionaria.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Email
            </label>

            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gomotorsco.com"
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-white placeholder:text-white/40 outline-none backdrop-blur-xl transition focus:border-amber-300/60"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Contraseña
            </label>

            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-white placeholder:text-white/40 outline-none backdrop-blur-xl transition focus:border-amber-300/60"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white py-4 text-sm font-black text-black transition hover:scale-[1.01] hover:bg-amber-200 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-5 text-xs text-white/45">
          Acceso restringido · Sistema interno GoMotorsCo
        </div>
      </div>
    </main>
  );
}
