"use client";

import { FormEvent, useState } from "react";

type Msg = {
  role: "user" | "assistant";
  text: string;
};

export function CreditAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hola, soy el asistente comercial. Puedo orientarte sobre financiación, cuota inicial y parte de pago.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();

    const text = message.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/assistant-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const json = await res.json();
    setLoading(false);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: json.reply || "Te paso con un asesor comercial.",
      },
    ]);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="mb-3 w-[340px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Asistente comercial</p>
              <p className="text-[11px] text-zinc-400">Créditos · requisitos · parte de pago</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-sm text-zinc-400 hover:text-white">
              ✕
            </button>
          </div>

          <div className="max-h-[320px] space-y-2 overflow-y-auto p-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-xl px-3 py-2 text-sm ${
                  m.role === "assistant"
                    ? "bg-zinc-900 text-zinc-100"
                    : "ml-8 bg-blue-600 text-white"
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading ? (
              <p className="text-xs text-zinc-500">Respondiendo...</p>
            ) : null}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribí tu pregunta..."
              className="flex-1 rounded-lg border border-white/10 bg-black px-3 py-2 text-sm outline-none"
            />
            <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium">
              Enviar
            </button>
          </form>
        </div>
      ) : null}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-xl"
      >
        Consultar crédito
      </button>
    </div>
  );
}
