"use client";

import { useState } from "react";

export default function ProfilePanel({ vendedor }: { vendedor: any }) {
  const [whatsapp, setWhatsapp] = useState(vendedor?.whatsapp || "");
  const [zona, setZona] = useState(vendedor?.zona || "");
  const [foto, setFoto] = useState(vendedor?.foto_url || "/logo-gomotorsco.png");
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    setSaving(true);

    const res = await fetch("/api/vendedor-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsapp, zona }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      alert(json.message || "No se pudo guardar el perfil.");
      return;
    }

    alert("Perfil actualizado.");
    window.location.reload();
  }

  async function uploadPhoto(file?: File) {
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/vendedor/upload-profile", {
      method: "POST",
      body: fd,
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.message || "No se pudo subir la foto.");
      return;
    }

    setFoto(json.url);
    alert("Foto actualizada.");
    window.location.reload();
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">
        Identidad comercial
      </p>

      <h2 className="mt-2 text-2xl font-black">Perfil vendedor</h2>

      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <img
            src={foto}
            className="mx-auto h-36 w-36 rounded-full border border-white/10 bg-white object-cover"
            alt="Perfil vendedor"
          />

          <label className="mt-5 block cursor-pointer rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white">
            Cambiar foto
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadPhoto(e.target.files?.[0])}
            />
          </label>

          <div className="mt-5 text-center">
            <p className="text-2xl font-black">{vendedor?.nombre || "Vendedor"}</p>
            <p className="mt-1 text-sm text-slate-400">{vendedor?.email || "Sin email"}</p>
          </div>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-xl font-black">Datos comerciales</h3>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-bold">
              WhatsApp comercial
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ej: 573001112233"
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Zona / sede
              <input
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                placeholder="Ej: Bogotá norte, Chiquinquirá, Medellín..."
                className="rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-6 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar perfil"}
          </button>
        </div>
      </div>
    </section>
  );
}
