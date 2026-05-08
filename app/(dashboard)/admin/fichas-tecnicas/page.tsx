"use client";

import { useEffect, useMemo, useState } from "react";

type Vehicle = any;

export default function AdminTechnicalSheetsPage() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [vehicleType, setVehicleType] = useState("auto");
  const [brand, setBrand] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  async function load() {
    const [sheetsRes, vehiclesRes] = await Promise.all([
      fetch("/api/admin/technical-sheets", { cache: "no-store" }),
      fetch("/api/vehicles?admin=1", { cache: "no-store" }),
    ]);

    const sheetsJson = await sheetsRes.json();
    const vehiclesJson = await vehiclesRes.json();

    setSheets(sheetsJson.sheets ?? []);
    setSections(vehiclesJson.sections ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const vehicles: Vehicle[] = useMemo(() => {
    return sections.flatMap((s: any) =>
      (s.vehicles ?? []).map((v: any) => ({
        ...v,
        tipo: v.tipo || s.type || "auto",
        marca: v.marca || s.title || s.name || "",
      }))
    );
  }, [sections]);

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        vehicles
          .filter((v) => String(v.tipo || "auto") === vehicleType)
          .map((v) => String(v.marca || "Sin marca"))
      )
    ).sort();
  }, [vehicles, vehicleType]);

  const vehicleOptions = useMemo(() => {
    return vehicles
      .filter((v) => String(v.tipo || "auto") === vehicleType)
      .filter((v) => !brand || String(v.marca || "") === brand)
      .sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
  }, [vehicles, vehicleType, brand]);

  const selectedVehicle = vehicleOptions.find((v) => String(v.id) === String(vehicleId));

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return sheets.filter((s) =>
      [s.title, s.brand, s.model, s.vehicle_type, s.tags]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [sheets, q]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedVehicle) return alert("Seleccioná un vehículo.");
    if (!file) return alert("Seleccioná un PDF.");

    setSaving(true);

    const fd = new FormData();
    fd.append("title", selectedVehicle.title || selectedVehicle.modelo || "Ficha técnica");
    fd.append("brand", selectedVehicle.marca || brand || "");
    fd.append("model", selectedVehicle.modelo || selectedVehicle.title || "");
    fd.append("vehicle_type", vehicleType);
    fd.append("year", selectedVehicle.anio ? String(selectedVehicle.anio) : "");
    fd.append("tags", [selectedVehicle.marca, selectedVehicle.title, vehicleType].filter(Boolean).join(", "));
    fd.append("file", file);

    const res = await fetch("/api/admin/technical-sheets", {
      method: "POST",
      body: fd,
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) return alert(json.message || "No se pudo subir la ficha.");

    setVehicleId("");
    setFile(null);
    await load();
  }

  async function toggle(sheet: any) {
    await fetch("/api/admin/technical-sheets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sheet.id, visible: !sheet.visible }),
    });
    await load();
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-blue-300">Biblioteca comercial</p>
        <h1 className="mt-2 text-3xl font-black text-white">Fichas técnicas</h1>
        <p className="mt-2 text-sm text-slate-400">
          Elegí tipo, marca y vehículo ya cargado. Luego subí el PDF correspondiente.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-lg font-black text-white">Asignar PDF a vehículo</h2>

          <div className="mt-5 grid gap-3">
            <label className="grid gap-1 text-xs font-bold text-slate-400">
              Tipo
              <select
                value={vehicleType}
                onChange={(e) => {
                  setVehicleType(e.target.value);
                  setBrand("");
                  setVehicleId("");
                }}
                className="rounded-xl border border-slate-700 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="auto">Autos</option>
                <option value="moto">Motos</option>
                <option value="ciclomotor">Ciclomotores / Cuatriciclos</option>
              </select>
            </label>

            <label className="grid gap-1 text-xs font-bold text-slate-400">
              Marca
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setVehicleId("");
                }}
                className="rounded-xl border border-slate-700 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="">Todas las marcas</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-bold text-slate-400">
              Vehículo
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="rounded-xl border border-slate-700 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="">Seleccionar vehículo</option>
                {vehicleOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.marca ? `${v.marca} · ` : ""}{v.title || v.modelo || "Sin nombre"}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-bold text-slate-400">
              PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="rounded-xl border border-slate-700 bg-black px-3 py-2 text-sm text-white"
              />
            </label>

            {selectedVehicle ? (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-100">
                Seleccionado: <b>{selectedVehicle.marca}</b> · {selectedVehicle.title}
              </div>
            ) : null}
          </div>

          <button disabled={saving} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60">
            {saving ? "Subiendo..." : "Subir ficha"}
          </button>
        </form>

        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-black text-white">Fichas cargadas</h2>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar ficha..."
              className="rounded-xl border border-slate-700 bg-black px-4 py-2 text-sm text-white"
            />
          </div>

          <div className="mt-5 grid gap-3">
            {filtered.map((s) => (
              <article key={s.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-black text-white">{s.title}</p>
                    <p className="text-xs text-slate-400">
                      {s.brand || "Marca"} · {s.model || "Modelo"} · {s.vehicle_type || "tipo"} · {s.year || "s/año"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a href={s.file_url} target="_blank" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-black text-white">
                      Ver PDF
                    </a>
                    <button onClick={() => toggle(s)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white">
                      {s.visible ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
