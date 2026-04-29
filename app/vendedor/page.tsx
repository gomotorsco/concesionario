"use client";

import { useEffect, useState } from "react";

export default function VendedorPage() {
  const [data, setData] = useState<any>(null);

  async function load() {
    const res = await fetch("/api/vendedor-leads");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  if (!data) return <p>Cargando...</p>;

  const m = data.metrics;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-white">Panel Comercial</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Hoy asignados" value={m.asignados_hoy} />
        <Card title="Hoy trabajados" value={m.trabajados_hoy} />
        <Card title="Sin tocar" value={m.leads_sin_tocar} />
        <Card title="Seguimiento" value={m.en_seguimiento} />
        <Card title="Vendidos" value={m.vendidos} />
        <Card title="Meta" value={m.meta_mensual} />
        <Card title="% conversión" value={m.conversion + "%"} />
        <Card title="Progreso" value={m.progreso_meta + "%"} />
      </div>

      <div>
        <h2>Inteligencia</h2>
        {data.inteligencia.map((i: string, idx: number) => (
          <p key={idx}>• {i}</p>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="p-4 bg-black/40 border border-slate-700 rounded-lg">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="text-xl text-white">{value}</p>
    </div>
  );
}
