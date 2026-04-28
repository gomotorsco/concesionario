"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookies_ok");
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookies_ok", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-black/90 p-4 text-white backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-zinc-300">
            Usamos cookies para mejorar la experiencia y analizar tráfico.
          </p>

          <button
            onClick={accept}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
