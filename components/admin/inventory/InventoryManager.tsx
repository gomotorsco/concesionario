"use client";

import { useEffect, useState } from "react";

export default function InventoryManager({ type, title }) {
  const [sections, setSections] = useState([]);
  const [open, setOpen] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);

  async function load() {
    const res = await fetch(`/api/vehicles?admin=1&type=${type}`);
    const json = await res.json();
    setSections(json.sections || []);
  }

  useEffect(() => {
    load();
  }, [type]);

  function toggleSection(id) {
    setOpen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function toggleVehicle(id) {
    await fetch("/api/vehicles", {
      method: "PATCH",
      body: JSON.stringify({ id, action: "toggle_visibility" }),
    });
    load();
  }

  async function deleteVehicle(id) {
    await fetch(`/api/vehicles?id=${id}`, { method: "DELETE" });
    load();
  }

  function editVehicle(v) {
    setEditing(v.id);
    setForm(v);
  }

  async function saveVehicle() {
    const method = editing ? "PATCH" : "POST";

    await fetch("/api/vehicles", {
      method,
      body: JSON.stringify({
        ...form,
        id: editing,
        type: "vehicle",
        inventoryType: type,
      }),
    });

    setForm({});
    setEditing(null);
    load();
  }

  return (
    <div className="p-6">

      <h1 className="mb-6 text-2xl font-bold">{title}</h1>

      {/* FORM */}
      <div className="mb-8 rounded-xl bg-[#0b0f14] p-4">
        <input
          placeholder="Nombre"
          className="mb-2 w-full p-2"
          value={form.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          placeholder="Marca"
          className="mb-2 w-full p-2"
          value={form.marca || ""}
          onChange={(e) => setForm({ ...form, marca: e.target.value })}
        />

        <textarea
          placeholder="Galería (1 URL por línea)"
          className="mb-2 w-full p-2"
          value={(form.gallery || []).join("\n")}
          onChange={(e) =>
            setForm({
              ...form,
              gallery: e.target.value.split("\n"),
              imagenHero: e.target.value.split("\n")[0],
            })
          }
        />

        <button onClick={saveVehicle} className="bg-green-600 px-4 py-2">
          {editing ? "Guardar cambios" : "Crear vehículo"}
        </button>
      </div>

      {/* INVENTARIO */}
      {sections.map((section) => (
        <div key={section.id} className="mb-6 rounded-xl border border-white/10">

          <button
            onClick={() => toggleSection(section.id)}
            className="w-full p-4 text-left"
          >
            <h3 className="text-lg font-bold">{section.title}</h3>
          </button>

          {open.includes(section.id) && (
            <div className="grid grid-cols-3 gap-4 p-4">

              {section.vehicles.map((v) => (
                <div key={v.id} className="rounded-lg bg-[#0b0f14] p-3">

                  <img src={v.imagen_hero} className="h-40 w-full object-cover rounded" />

                  <p className="mt-2 font-bold">{v.title}</p>

                  <div className="mt-3 flex gap-2 text-sm">
                    <button onClick={() => editVehicle(v)}>Editar</button>
                    <button onClick={() => toggleVehicle(v.id)}>
                      {v.visible ? "Pausar" : "Activar"}
                    </button>
                    <button onClick={() => deleteVehicle(v.id)}>
                      Eliminar
                    </button>
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
      ))}
    </div>
  );
}
