"use client";

import { useEffect, useMemo, useState } from "react";

type Item = any;

function youtubeId(url: string) {
  const raw = String(url || "");
  const match = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match?.[1] || "";
}

export default function TrainingPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState("todos");

  async function load() {
    const res = await fetch("/api/vendedor/training", { cache: "no-store" });
    const json = await res.json();
    setItems(json.items ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (category === "todos") return items;
    return items.filter((i) => i.category === category);
  }, [items, category]);

  const videos = filtered.filter((i) => i.type === "video");
  const consejos = filtered.filter((i) => i.type === "consejo");
  const scripts = filtered.filter((i) => i.type === "script");

  async function copy(text: string) {
    await navigator.clipboard.writeText(text || "");
    alert("Script copiado.");
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-[#080d18] p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">Academia comercial</p>
        <h2 className="mt-2 text-2xl font-black">Capacitación vendedor</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Videos, consejos y scripts para mejorar contacto, seguimiento y cierre.
        </p>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {["todos", "ventas", "whatsapp", "financiacion", "objeciones", "cierre"].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black capitalize ${
                category === c ? "bg-blue-600 text-white" : "bg-white/10 text-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Block title="Videos recomendados">
        {videos.length === 0 ? <Empty /> : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((item) => {
            const id = youtubeId(item.youtube_url || "");
            return (
              <article key={item.id} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#080d18]">
                {id ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    className="aspect-video w-full"
                    allowFullScreen
                  />
                ) : null}
                <div className="p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">{item.category}</p>
                  <h3 className="mt-1 text-lg font-black">{item.title}</h3>
                  {item.content ? <p className="mt-2 text-sm text-slate-400">{item.content}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      </Block>

      <Block title="Mensajes del supervisor">
        {consejos.length === 0 ? <Empty /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {consejos.map((item) => (
            <article key={item.id} className="rounded-[24px] border border-white/10 bg-[#080d18] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">{item.category}</p>
              <h3 className="mt-2 text-xl font-black">{item.title}</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{item.content}</p>
            </article>
          ))}
        </div>
      </Block>

      <Block title="Scripts comerciales">
        {scripts.length === 0 ? <Empty /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {scripts.map((item) => (
            <article key={item.id} className="rounded-[24px] border border-white/10 bg-[#080d18] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">{item.category}</p>
              <h3 className="mt-2 text-xl font-black">{item.title}</h3>
              <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-black/30 p-4 text-sm leading-6 text-slate-300">{item.content}</p>
              <button onClick={() => copy(item.content)} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black">
                Copiar script
              </button>
            </article>
          ))}
        </div>
      </Block>
    </section>
  );
}

function Block({ title, children }: any) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5">
      <h3 className="text-xl font-black">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty() {
  return <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-400">No hay contenido publicado todavía.</p>;
}
