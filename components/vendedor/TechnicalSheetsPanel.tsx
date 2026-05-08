"use client";

import { useEffect, useMemo, useState } from "react";

export default function TechnicalSheetsPanel() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("todos");

  async function load() {
    const res = await fetch("/api/vendedor/technical-sheets", { cache: "no-store" });
    const json = await res.json();
    setSheets(json.sheets ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return sheets.filter((s) => {
      const sameType = type === "todos" || s.vehicle_type === type;
      const match = [s.title, s.brand, s.model, s.tags, s.vehicle_type]
        .join(" ")
        .toLowerCase()
        .includes(query);
      return sameType && match;
    });
  }, [sheets, q, type]);

  return (
    <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">
        Biblioteca técnica
      </p>
      <h2 className="mt-2 text-2xl font-black">Fichas técnicas</h2>
      <p className="mt-2 text-sm text-slate-400">
        Buscá PDFs oficiales por marca, modelo o tipo de vehículo.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar Toyota, Yamaha, pickup, híbrido..."
          className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none focus:border-blue-500"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none focus:border-blue-500"
        >
          <option value="todos">Todos</option>
          <option value="auto">Autos</option>
          <option value="moto">Motos</option>
          <option value="ciclomotor">Ciclomotores / Cuatris</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-slate-400 md:col-span-2 xl:col-span-3">
            No hay fichas técnicas disponibles.
          </p>
        ) : (
          filtered.map((s) => (
            <article key={s.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-500/40 hover:bg-white/[0.06]">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                {s.vehicle_type || "vehículo"}
              </p>
              <h3 className="mt-2 text-xl font-black">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {s.brand || "Marca"} · {s.model || "Modelo"} · {s.year || "s/año"}
              </p>
              {s.tags ? <p className="mt-3 text-xs text-slate-500">{s.tags}</p> : null}

              <a
                href={s.file_url}
                target="_blank"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white"
              >
                Abrir PDF
              </a>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
