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
    <main className="flex min-h-screen items-center justify-center bg-[#05070d] p-4 text-white">
      <form onSubmit={login} className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#080d18] p-8">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">GoMotorsCo</p>
        <h1 className="mt-3 text-3xl font-black">Ingreso vendedores</h1>

        <div className="mt-8 grid gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3"
          />

          <button className="rounded-2xl bg-blue-600 px-6 py-3 font-black">
            Ingresar
          </button>
        </div>
      </form>
    </main>
  );
}
