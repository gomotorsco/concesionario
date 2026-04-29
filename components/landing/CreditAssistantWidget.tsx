"use client";

export function CreditAssistantWidget() {
  return (
    <a
      href="/preaprobacion"
      className="fixed bottom-5 right-5 z-50 bg-black text-white px-5 py-3 rounded-full shadow-lg text-sm font-bold hover:bg-gray-900"
    >
      Asesor virtual
    </a>
  );
}

export function WhatsAppButton() {
  const number = "573001234567"; // cambiar dinámico después

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      className="fixed bottom-20 right-5 z-50 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg text-sm font-bold"
    >
      WhatsApp
    </a>
  );
}
