"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: number;
  nombre: string;
  telefono: string;
  estado: string;
  seguimiento: string;
};

export default function VendedorPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch("/api/vendedor-leads")
      .then((r) => r.json())
      .then((data) => setLeads(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-xl mb-4">Panel Vendedor</h1>

      <div className="grid gap-4">
        {leads.map((l) => (
          <div key={l.id} className="p-4 border border-white/10 rounded">
            <p>{l.nombre}</p>
            <p>{l.telefono}</p>
            <p className="text-xs text-gray-400">{l.estado}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
