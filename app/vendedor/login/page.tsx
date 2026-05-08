"use client";

import { useState } from "react";

export default function VendedorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/vendedor-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.message || "No se pudo ingresar.");
      return;
    }

    window.location.href = "/vendedor";
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 text-white">
      <div
        className="absolute inset-0 hidden bg-cover bg-center md:block"
        style={{ backgroundImage: "url('/login-desktop.png')" }}
      />

      <div
        className="absolute inset-0 bg-cover bg-center md:hidden"
        style={{ backgroundImage: "url('/login-mobile.png')" }}
      />

      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-amber-400/20 blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-white/10 blur-3xl" />

      <form
        onSubmit={login}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[34px] border border-white/15 bg-white/10 p-8 shadow-[0_30px_120px_rgba(0,0,0,.45)] backdrop-blur-2xl"
      >
        <p className="text-xs font-black uppercase tracking-[0.34em] text-amber-300">
          GoMotorsCo
        </p>

        <h1 className="mt-3 text-4xl font-black leading-none">
          Ingreso vendedores
        </h1>

        <p className="mt-3 text-sm text-white/70">
          Acceso comercial interno para asesores de la concesionaria.
        </p>

        <div className="mt-8 grid gap-4">
          <input
            type="email"
            placeholder="Email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-white placeholder:text-white/40 outline-none backdrop-blur-xl transition focus:border-amber-300/60"
          />

          <input
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-white placeholder:text-white/40 outline-none backdrop-blur-xl transition focus:border-amber-300/60"
          />

          <button className="rounded-2xl bg-white py-4 text-sm font-black text-black transition hover:scale-[1.01] hover:bg-amber-200">
            Ingresar
          </button>
        </div>

        <div className="mt-6 border-t border-white/10 pt-5 text-xs text-white/45">
          Acceso restringido · Sistema comercial GoMotorsCo
        </div>
      </form>
    </main>
  );
}
