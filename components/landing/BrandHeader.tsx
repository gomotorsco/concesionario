"use client";

import { useEffect, useState } from "react";

function Icon({ type }: { type: "car" | "moto" | "cycle" }) {
  if (type === "car") return <span className="text-lg">▰</span>;
  if (type === "moto") return <span className="text-lg">◒</span>;
  return <span className="text-lg">◇</span>;
}

export default function BrandHeader() {
  const [theme, setTheme] = useState<"dark" | "ivory">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("gm-theme") as "dark" | "ivory" | null;
    const current = saved || "dark";
    setTheme(current);
    document.documentElement.setAttribute("data-gm-theme", current);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "ivory" : "dark";
    setTheme(next);
    localStorage.setItem("gm-theme", next);
    document.documentElement.setAttribute("data-gm-theme", next);
  }

  return (
    <header className="sticky top-4 z-50">
      <div className="gm-premium-container">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border px-5 py-3 backdrop-blur-2xl gm-premium-card">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gm-accent)] text-sm font-black text-[var(--gm-bg)]">
              G
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--gm-muted)]">
                Grupo automotor
              </p>
              <p className="text-xl font-black tracking-[-0.04em] text-[var(--gm-text)]">
                GoMotorsCo
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 rounded-full bg-[var(--gm-soft)] p-1 md:flex">
            <a href="#stock" className="rounded-full px-4 py-2 text-sm font-bold text-[var(--gm-muted)] hover:bg-[var(--gm-surface)] hover:text-[var(--gm-text)]">
              Stock
            </a>
            <a href="#stock" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[var(--gm-muted)] hover:bg-[var(--gm-surface)] hover:text-[var(--gm-text)]">
              <Icon type="car" /> Autos
            </a>
            <a href="#stock" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[var(--gm-muted)] hover:bg-[var(--gm-surface)] hover:text-[var(--gm-text)]">
              <Icon type="moto" /> Motos
            </a>
            <a href="#stock" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[var(--gm-muted)] hover:bg-[var(--gm-surface)] hover:text-[var(--gm-text)]">
              <Icon type="cycle" /> Ciclomotores
            </a>
            <a href="/preaprobacion" className="rounded-full px-4 py-2 text-sm font-bold text-[var(--gm-muted)] hover:bg-[var(--gm-surface)] hover:text-[var(--gm-text)]">
              Financiación
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden rounded-full border border-[var(--gm-border)] px-3 py-2 text-xs font-bold text-[var(--gm-muted)] hover:text-[var(--gm-text)] md:block"
            >
              {theme === "dark" ? "Hueso" : "Negro"}
            </button>

            <a href="/preaprobacion" className="gm-premium-button px-5 py-2.5 text-sm">
              Evaluar
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
